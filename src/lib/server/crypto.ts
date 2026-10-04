/**
 * Utilidades criptográficas del servidor
 * --------------------------------------------------------------------------
 * Valores aleatorios seguros, PKCE para OAuth y códigos de acceso de un
 * solo uso (6 dígitos) guardados como hash HMAC (nunca en texto plano).
 */
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { SESSION_SECRET } from 'astro:env/server';

import { ServerConfigError } from './errors';

let devSecret: string | undefined;

/**
 * Secreto del servidor (SESSION_SECRET). En desarrollo, si falta, se usa uno
 * aleatorio por proceso; en producción es obligatorio.
 */
export function serverSecret(): string {
	if (SESSION_SECRET) return SESSION_SECRET;
	if (import.meta.env.DEV) {
		devSecret ??= randomBytes(32).toString('hex');
		return devSecret;
	}
	throw new ServerConfigError('[auth] Falta la variable SESSION_SECRET (mínimo 32 caracteres).');
}

/** Texto aleatorio seguro en base64url */
export function randomToken(bytes = 32): string {
	return randomBytes(bytes).toString('base64url');
}

/** Desafío PKCE (S256) a partir del verificador */
export function pkceChallenge(verifier: string): string {
	return createHash('sha256').update(verifier).digest('base64url');
}

/** Compara dos textos en tiempo constante */
export function safeEqual(a: string, b: string): boolean {
	const bufferA = Buffer.from(a);
	const bufferB = Buffer.from(b);
	return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

/** Código de acceso de 6 dígitos */
export function generateCode(): string {
	return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

/** Hash del código (HMAC-SHA256 con el secreto del servidor y una sal) */
export function hashCode(code: string, salt: string): string {
	return createHmac('sha256', serverSecret()).update(`${salt}:${code}`).digest('hex');
}

export function verifyCode(code: string, salt: string, hash: string): boolean {
	return safeEqual(hashCode(code, salt), hash);
}
