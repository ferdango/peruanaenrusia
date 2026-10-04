/**
 * GET /api/auth/google/callback/?code=…&state=…
 * --------------------------------------------------------------------------
 * Vuelta desde Google: valida el state, canjea el código (con PKCE),
 * verifica el id_token, crea o actualiza la cuenta del estudiante e inicia la
 * sesión. Si algo falla, vuelve al sitio con el modal abierto y un aviso.
 */
import type { APIRoute } from 'astro';

import { routes } from '@data/navigation';
import { completeAuthorization } from '@lib/server/google';
import { safeEqual } from '@lib/server/crypto';
import { publicOrigin } from '@lib/server/http';
import { PORTAL_HOME, startSession } from '@lib/server/session';
import { userStore } from '@lib/server/users';

export const prerender = false;

/** Tiempo máximo entre ir a Google y volver */
const MAX_AGE_MS = 10 * 60_000;

export const GET: APIRoute = async (context) => {
	const { url, session, redirect } = context;
	const oauth = await session?.get('oauth');
	session?.delete('oauth');

	const next = oauth?.next ?? PORTAL_HOME;
	const fail = (reason: string) =>
		redirect(`${routes.home}?login=1&auth_error=${reason}&next=${encodeURIComponent(next)}`, 302);

	// La persona canceló en la pantalla de Google
	if (url.searchParams.get('error')) return fail('cancelled');

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	if (
		!oauth ||
		!code ||
		!state ||
		!safeEqual(state, oauth.state) ||
		Date.now() - oauth.createdAt > MAX_AGE_MS
	) {
		return fail('expired');
	}

	try {
		const profile = await completeAuthorization({
			code,
			verifier: oauth.verifier,
			nonce: oauth.nonce,
			origin: publicOrigin(url),
		});

		const account = await userStore().upsert({
			email: profile.email,
			name: profile.name,
			picture: profile.picture,
			googleSub: profile.sub,
		});

		await startSession(context, {
			id: account.id,
			email: account.email,
			name: account.name,
			picture: account.picture,
			provider: 'google',
		});

		return redirect(next, 302);
	} catch (error) {
		console.error('[auth] Error al iniciar sesión con Google:', error);
		return fail('google');
	}
};
