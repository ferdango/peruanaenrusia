/**
 * GET /api/auth/google/?next=/portal/mi-proceso/
 * --------------------------------------------------------------------------
 * Inicia el inicio de sesión con Google: guarda en la sesión del servidor
 * los valores de seguridad (state, PKCE y nonce) y redirige a Google.
 * Ver src/lib/server/google.ts.
 */
import type { APIRoute } from 'astro';

import { createAuthorizationRequest, isGoogleConfigured } from '@lib/server/google';
import { clientIp, publicOrigin, safeRedirectPath } from '@lib/server/http';
import { MINUTE, rateLimit } from '@lib/server/rate-limit';
import { PORTAL_HOME } from '@lib/server/session';

export const prerender = false;

export const GET: APIRoute = (context) => {
	const { url, session, redirect } = context;
	const next = safeRedirectPath(url.searchParams.get('next'), PORTAL_HOME);

	// Vuelve al sitio con el modal abierto y un mensaje de error
	const fail = (reason: string) =>
		redirect(`/?login=1&auth_error=${reason}&next=${encodeURIComponent(next)}`, 302);

	if (!isGoogleConfigured() || !session) return fail('google_unavailable');

	if (!rateLimit(`google:${clientIp(context)}`, 20, 10 * MINUTE).ok) return fail('too_many');

	const request = createAuthorizationRequest(publicOrigin(url));
	session.set(
		'oauth',
		{
			state: request.state,
			verifier: request.verifier,
			nonce: request.nonce,
			next,
			createdAt: Date.now(),
		},
		{ ttl: 10 * 60 },
	);

	return redirect(request.url, 302);
};
