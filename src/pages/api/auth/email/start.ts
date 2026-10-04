/**
 * POST /api/auth/email/start/
 * --------------------------------------------------------------------------
 * Paso "Usar mi correo personal" / "Crear mi cuenta" del modal de acceso.
 *
 * Cuerpo: { email, name?, next? }  (el modal también envía `intent`, informativo)
 * Respuesta: { next: 'login-code' | 'register-name' | 'register-code' }
 *   - Si la cuenta existe → se envía el código de acceso → "login-code"
 *     (aunque se haya entrado por "Crear mi cuenta").
 *   - Si no existe y aún no hay nombre → "register-name" (pedir el nombre).
 *   - Si no existe y llegó el nombre → se envía el código → "register-code".
 */
import type { APIRoute } from 'astro';

import { issueAccessCode } from '@lib/server/access-code';
import { BadRequestError, clientIp, jsonError, json, readJson, safeRedirectPath } from '@lib/server/http';
import { ServerConfigError } from '@lib/server/errors';
import { HOUR, MINUTE, rateLimit } from '@lib/server/rate-limit';
import { PORTAL_HOME } from '@lib/server/session';
import { normalizeEmail, userStore } from '@lib/server/users';

export const prerender = false;

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const POST: APIRoute = async (context) => {
	try {
		const body = await readJson(context.request);
		const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
		const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
		const next = safeRedirectPath(body.next, PORTAL_HOME);

		if (!EMAIL_PATTERN.test(email) || email.length > 160) {
			throw new BadRequestError('Ingresa un correo válido, por ejemplo: tucorreo@gmail.com.', 'email');
		}
		if (name && (name.length < 2 || name.length > 60)) {
			throw new BadRequestError('Ingresa un nombre de 2 a 60 caracteres.', 'name');
		}

		const ip = clientIp(context);
		const limitedByIp = !rateLimit(`otp-ip:${ip}`, 10, 10 * MINUTE).ok;
		if (limitedByIp)
			return jsonError(429, 'Hiciste demasiados intentos. Espera unos minutos y vuelve a probar.');

		const account = await userStore().findByEmail(email);

		// Cuenta nueva sin nombre todavía: el modal pide el nombre (no se envía correo)
		if (!account && !name) return json({ next: 'register-name' });

		if (!rateLimit(`otp-email:${email}`, 5, HOUR).ok) {
			return jsonError(429, 'Ya te enviamos varios códigos. Revisa tu correo o espera un momento.');
		}

		await issueAccessCode(context, {
			email,
			name: account?.name ?? name,
			intent: account ? 'login' : 'register',
			next,
		});

		return json({ next: account ? 'login-code' : 'register-code' });
	} catch (error) {
		if (error instanceof BadRequestError) return jsonError(400, error.message, { field: error.field });
		if (error instanceof ServerConfigError) {
			return jsonError(
				503,
				'El acceso con correo no está disponible en este momento. Usa tu cuenta de Google o escríbenos por WhatsApp.',
			);
		}
		console.error('[auth] Error al enviar el código de acceso:', error);
		return jsonError(500, 'No pudimos enviarte el código. Inténtalo de nuevo en unos minutos.');
	}
};
