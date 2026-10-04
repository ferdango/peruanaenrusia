/**
 * Envío de correos
 * --------------------------------------------------------------------------
 * Códigos de acceso y constancias del Libro de reclamaciones. Usa el primer
 * proveedor configurado:
 *
 *   1. Resend (API HTTP)  → RESEND_API_KEY
 *   2. SMTP               → SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 *                           (ej. el correo de Hostinger: smtp.hostinger.com, 465)
 *   3. Desarrollo         → sin proveedor, el correo se muestra en la terminal
 *
 * Remitente: MAIL_FROM (ej. "Peruana en Rusia <hola@peruanaenrusia.pe>").
 * En producción, si no hay proveedor, sendMail() lanza MailNotConfiguredError.
 */
import { MAIL_FROM, RESEND_API_KEY, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from 'astro:env/server';

import { site } from '@data/site';

import { ServerConfigError } from './errors';

export interface MailMessage {
	to: string;
	subject: string;
	text: string;
	html: string;
	replyTo?: string;
}

export class MailNotConfiguredError extends ServerConfigError {
	constructor() {
		super('[correo] No hay un proveedor de correo configurado (RESEND_API_KEY o SMTP_HOST).');
		this.name = 'MailNotConfiguredError';
	}
}

const sender = () => MAIL_FROM || `${site.name} <${site.contact.email}>`;

/** ¿Se pueden enviar correos de verdad? */
export function isMailConfigured(): boolean {
	return Boolean(RESEND_API_KEY || SMTP_HOST);
}

export async function sendMail(message: MailMessage): Promise<void> {
	if (RESEND_API_KEY) return sendWithResend(message);
	if (SMTP_HOST) return sendWithSmtp(message);

	if (import.meta.env.DEV) {
		console.info(
			`\n📧 [correo de prueba] Para: ${message.to}\n   Asunto: ${message.subject}\n\n${message.text}\n`,
		);
		return;
	}

	throw new MailNotConfiguredError();
}

async function sendWithResend(message: MailMessage): Promise<void> {
	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: sender(),
			to: [message.to],
			subject: message.subject,
			html: message.html,
			text: message.text,
			reply_to: message.replyTo,
		}),
		signal: AbortSignal.timeout(15_000),
	});

	if (!response.ok) {
		throw new Error(`[correo] Resend respondió ${response.status}: ${await response.text()}`);
	}
}

async function sendWithSmtp(message: MailMessage): Promise<void> {
	// Se carga solo si se usa SMTP
	const { createTransport } = await import('nodemailer');
	const port = SMTP_PORT ?? 465;
	const transport = createTransport({
		host: SMTP_HOST,
		port,
		secure: port === 465,
		auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
	});

	await transport.sendMail({
		from: sender(),
		to: message.to,
		subject: message.subject,
		text: message.text,
		html: message.html,
		replyTo: message.replyTo,
	});
}
