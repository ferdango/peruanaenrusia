/**
 * POST /api/auth/email/verify/
 * --------------------------------------------------------------------------
 * Último paso del acceso con correo: valida el código de 6 dígitos.
 *
 * Cuerpo: { code }
 * Respuesta: { redirect } (página a la que ir, normalmente el portal)
 *
 * Seguridad: el código se compara contra su hash en la sesión del servidor,
 * vence a los 10 minutos y se invalida tras 5 intentos fallidos.
 */
import type { APIRoute } from 'astro';

import { MAX_ATTEMPTS } from '@lib/server/access-code';
import { verifyCode } from '@lib/server/crypto';
import { BadRequestError, clientIp, jsonError, json, readJson } from '@lib/server/http';
import { MINUTE, rateLimit } from '@lib/server/rate-limit';
import { startSession } from '@lib/server/session';
import { userStore } from '@lib/server/users';

export const prerender = false;

export const POST: APIRoute = async (context) => {
	const { session } = context;

	try {
		const body = await readJson(context.request);
		const code = typeof body.code === 'string' ? body.code.replace(/\D/g, '') : '';
		if (code.length !== 6) throw new BadRequestError('El código tiene 6 números.', 'code');

		if (!rateLimit(`verify:${clientIp(context)}`, 20, 10 * MINUTE).ok) {
			return jsonError(429, 'Hiciste demasiados intentos. Espera unos minutos y vuelve a probar.');
		}

		const otp = await session?.get('otp');
		if (!otp || Date.now() > otp.expiresAt) {
			session?.delete('otp');
			return jsonError(400, 'El código venció. Pide uno nuevo con "Volver a enviarlo".', {
				field: 'code',
			});
		}

		if (otp.attempts >= MAX_ATTEMPTS) {
			session?.delete('otp');
			return jsonError(429, 'Superaste el número de intentos. Pide un código nuevo.', {
				field: 'code',
			});
		}

		if (!verifyCode(code, otp.salt, otp.hash)) {
			session?.set('otp', { ...otp, attempts: otp.attempts + 1 });
			const left = MAX_ATTEMPTS - otp.attempts - 1;
			return jsonError(
				400,
				left > 0
					? `El código no es correcto. Te quedan ${left} ${left === 1 ? 'intento' : 'intentos'}.`
					: 'El código no es correcto. Pide un código nuevo.',
				{ field: 'code' },
			);
		}

		session?.delete('otp');
		const account = await userStore().upsert({ email: otp.email, name: otp.name });
		await startSession(context, {
			id: account.id,
			email: account.email,
			name: account.name,
			picture: account.picture,
			provider: 'email',
		});

		return json({ redirect: otp.next });
	} catch (error) {
		if (error instanceof BadRequestError) return jsonError(400, error.message, { field: error.field });
		console.error('[auth] Error al verificar el código:', error);
		return jsonError(500, 'No pudimos verificar el código. Inténtalo de nuevo en unos minutos.');
	}
};
