/**
 * Sesión del estudiante
 * --------------------------------------------------------------------------
 * La sesión vive en el servidor (Astro sessions, ver astro.config.mjs): el
 * navegador solo guarda una cookie HttpOnly con un identificador aleatorio.
 *
 * Además se guarda la cookie `peru_auth=1` (sin datos personales y legible
 * por JavaScript) solo para que las páginas estáticas sepan que hay sesión y
 * muestren "Mi proceso" en lugar de "Iniciar sesión". No da acceso a nada:
 * el portal siempre verifica la sesión real en el servidor.
 */
import type { APIContext } from 'astro';

import { routes } from '@data/navigation';
import type { SessionUser } from './types';

export const AUTH_HINT_COOKIE = 'peru_auth';

/** Ruta del portal (destino por defecto después de iniciar sesión) */
export const PORTAL_HOME = routes.portal;

const SEVEN_DAYS = 60 * 60 * 24 * 7;

type SessionContext = Pick<APIContext, 'session' | 'cookies'>;

/** Inicia la sesión (con un identificador nuevo para evitar la fijación de sesión) */
export async function startSession(context: SessionContext, user: SessionUser): Promise<void> {
	if (!context.session) throw new Error('[auth] Las sesiones no están configuradas.');
	await context.session.regenerate();
	context.session.set('user', user);
	context.cookies.set(AUTH_HINT_COOKIE, '1', {
		path: '/',
		sameSite: 'lax',
		secure: !import.meta.env.DEV,
		httpOnly: false,
		maxAge: SEVEN_DAYS,
	});
}

/** Cierra la sesión en el servidor y borra las cookies */
export function endSession(context: SessionContext): void {
	context.session?.destroy();
	context.cookies.delete(AUTH_HINT_COOKIE, { path: '/' });
}
