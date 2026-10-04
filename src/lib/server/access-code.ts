/**
 * Acceso con código por correo (sin contraseña)
 * --------------------------------------------------------------------------
 * El modal "Usar mi correo personal" envía un código de 6 dígitos al correo.
 * El código se guarda en la sesión del servidor como hash (HMAC), vence en
 * 10 minutos y admite como máximo 5 intentos; se puede reenviar 3 veces.
 */
import type { APIContext } from 'astro';

import { accessCodeEmail } from './email-templates';
import { generateCode, hashCode, randomToken } from './crypto';
import { sendMail } from './mail';
import type { OtpChallenge } from './types';

export const CODE_TTL_MINUTES = 10;
export const MAX_ATTEMPTS = 5;
export const MAX_RESENDS = 3;
/** Espera mínima entre reenvíos */
export const RESEND_COOLDOWN_MS = 30_000;

/** Crea un código nuevo, lo guarda en la sesión y lo envía por correo */
export async function issueAccessCode(
	context: Pick<APIContext, 'session'>,
	challenge: Pick<OtpChallenge, 'email' | 'name' | 'intent' | 'next'>,
	previous?: OtpChallenge,
): Promise<void> {
	const code = generateCode();
	const salt = randomToken(16);
	const now = Date.now();

	const otp: OtpChallenge = {
		...challenge,
		salt,
		hash: hashCode(code, salt),
		expiresAt: now + CODE_TTL_MINUTES * 60_000,
		attempts: 0,
		sentAt: now,
		resends: previous ? previous.resends + 1 : 0,
	};

	const message = accessCodeEmail({ name: challenge.name, code, minutes: CODE_TTL_MINUTES });
	await sendMail({ to: challenge.email, ...message });

	// Se guarda solo si el correo salió bien
	context.session?.set('otp', otp, { ttl: CODE_TTL_MINUTES * 60 });
}
