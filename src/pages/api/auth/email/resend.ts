/**
 * POST /api/auth/email/resend/
 * --------------------------------------------------------------------------
 * "¿No recibiste el código? Volver a enviarlo": genera un código nuevo
 * (el anterior deja de servir) y lo envía al mismo correo.
 * Máximo 3 reenvíos, con 30 segundos de espera entre cada uno.
 */
import type { APIRoute } from 'astro';

import { issueAccessCode, MAX_RESENDS, RESEND_COOLDOWN_MS } from '@lib/server/access-code';
import { clientIp, jsonError, json } from '@lib/server/http';
import { ServerConfigError } from '@lib/server/errors';
import { MINUTE, rateLimit } from '@lib/server/rate-limit';

export const prerender = false;

export const POST: APIRoute = async (context) => {
	const otp = await context.session?.get('otp');
	if (!otp) return jsonError(400, 'Vuelve a escribir tu correo para recibir un código nuevo.');

	const wait = otp.sentAt + RESEND_COOLDOWN_MS - Date.now();
	if (wait > 0) {
		return jsonError(429, `Espera ${Math.ceil(wait / 1000)} segundos para pedir otro código.`);
	}
	if (otp.resends >= MAX_RESENDS || !rateLimit(`resend:${clientIp(context)}`, 6, 10 * MINUTE).ok) {
		return jsonError(
			429,
			'Ya te enviamos varios códigos. Revisa tu correo (también la carpeta de spam).',
		);
	}

	try {
		await issueAccessCode(
			context,
			{ email: otp.email, name: otp.name, intent: otp.intent, next: otp.next },
			otp,
		);
		return json({ ok: true });
	} catch (error) {
		if (error instanceof ServerConfigError) {
			return jsonError(503, 'El envío de correos no está disponible en este momento.');
		}
		console.error('[auth] Error al reenviar el código:', error);
		return jsonError(500, 'No pudimos reenviar el código. Inténtalo de nuevo en unos minutos.');
	}
};
