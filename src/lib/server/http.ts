/**
 * Utilidades HTTP de la API
 * --------------------------------------------------------------------------
 * Respuestas JSON, lectura segura del cuerpo, comprobación de origen (CSRF),
 * IP del cliente y validación de redirecciones.
 */
import type { APIContext } from 'astro';
import { TRUST_PROXY } from 'astro:env/server';

import { apiHeaders } from '../../../config/security-headers.mjs';

/** Tamaño máximo del cuerpo de una petición JSON (64 KB) */
const MAX_BODY_BYTES = 64 * 1024;

/** Respuesta JSON que nunca se guarda en caché */
export function json(data: unknown, init: ResponseInit = {}): Response {
	const headers = new Headers(init.headers);
	headers.set('Content-Type', 'application/json; charset=utf-8');
	for (const [name, value] of Object.entries(apiHeaders)) headers.set(name, value);
	return new Response(JSON.stringify(data), { ...init, headers });
}

/** Error para mostrar a la persona (`field` = campo del formulario relacionado) */
export function jsonError(status: number, error: string, extra: Record<string, unknown> = {}): Response {
	return json({ error, ...extra }, { status });
}

/** Error de validación del cuerpo de la petición */
export class BadRequestError extends Error {
	constructor(
		message: string,
		readonly field?: string,
	) {
		super(message);
		this.name = 'BadRequestError';
	}
}

/**
 * Lee el cuerpo JSON de la petición con un límite de tamaño.
 * Exige Content-Type: application/json (así un formulario de otro sitio no
 * puede enviarlo sin pasar por CORS).
 */
export async function readJson(request: Request): Promise<Record<string, unknown>> {
	const type = request.headers.get('content-type') ?? '';
	if (!type.includes('application/json')) throw new BadRequestError('Formato de solicitud no válido.');

	const declared = Number(request.headers.get('content-length') ?? '0');
	if (declared > MAX_BODY_BYTES) throw new BadRequestError('La solicitud es demasiado grande.');

	const text = await request.text();
	if (text.length > MAX_BODY_BYTES) throw new BadRequestError('La solicitud es demasiado grande.');

	try {
		const data = JSON.parse(text) as unknown;
		if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('not an object');
		return data as Record<string, unknown>;
	} catch {
		throw new BadRequestError('Formato de solicitud no válido.');
	}
}

/**
 * ¿La petición viene del propio sitio? (protección CSRF de la API)
 * Comprueba Origin y, si el navegador lo envía, Sec-Fetch-Site.
 */
export function isSameOrigin(request: Request, url: URL): boolean {
	const fetchSite = request.headers.get('sec-fetch-site');
	if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return false;

	const origin = request.headers.get('origin');
	if (!origin) {
		// Sin Origin (algunos navegadores en peticiones del mismo sitio): se exige la cabecera propia
		return request.headers.get('x-requested-with') === 'fetch';
	}

	const allowed = new Set([url.origin]);
	if (import.meta.env.SITE) allowed.add(new URL(import.meta.env.SITE).origin);
	return allowed.has(origin);
}

/** IP del cliente (para limitar intentos). Detrás de un proxy usa X-Forwarded-For si TRUST_PROXY=true */
export function clientIp(context: Pick<APIContext, 'request' | 'clientAddress'>): string {
	if (TRUST_PROXY) {
		const forwarded = context.request.headers.get('x-forwarded-for');
		if (forwarded) return forwarded.split(',')[0]!.trim();
	}
	try {
		return context.clientAddress;
	} catch {
		return 'unknown';
	}
}

/**
 * Valida una ruta interna para redirigir (evita redirecciones abiertas a
 * otros sitios). Solo acepta rutas del propio sitio que empiezan con "/".
 */
export function safeRedirectPath(value: unknown, fallback: string): string {
	if (typeof value !== 'string' || value.length > 512) return fallback;
	if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
	try {
		const parsed = new URL(value, 'https://peruanaenrusia.invalid');
		if (parsed.origin !== 'https://peruanaenrusia.invalid') return fallback;
		return `${parsed.pathname}${parsed.search}`;
	} catch {
		return fallback;
	}
}

/** Origen público del sitio (para construir URLs absolutas, ej. la vuelta de Google) */
export function publicOrigin(url: URL): string {
	if (import.meta.env.DEV || !import.meta.env.SITE) return url.origin;
	return new URL(import.meta.env.SITE).origin;
}
