/**
 * Acceso de estudiantes · conexión con el servidor
 * --------------------------------------------------------------------------
 * El modal (auth-flow.ts), los botones de acceso (session-ui.ts) y el cierre
 * de sesión del portal (portal-nav.ts) usan estas funciones en lugar de
 * llamar a la API directamente:
 *
 *   - Con servidor (por defecto): POST a /api/auth/* (ver src/pages/api/auth/).
 *   - Versión estática (DEPLOY_TARGET=static, ej. GitHub Pages): no hay
 *     servidor, así que el acceso es una demostración para recorrer las
 *     pantallas. No se envía ningún dato: se acepta cualquier correo y
 *     cualquier código de 6 dígitos, y la "sesión" dura lo que la pestaña
 *     del navegador (sessionStorage).
 */
import { DEPLOY_TARGET } from 'astro:env/client';

import { withBase } from '@utils/url';
import { postJson } from './forms';

/** Pasos del modal (valor de data-auth-step) */
export type AuthStep =
	'login' | 'login-email' | 'login-code' | 'register-email' | 'register-name' | 'register-code';

/** true en la versión estática: el inicio de sesión es una demostración */
export const isDemoAuth = DEPLOY_TARGET === 'static';

const DEMO_SESSION_KEY = 'peru_demo_session';

/** Pausa de la demostración: deja ver el estado "enviando" de los botones (ms) */
const DEMO_DELAY_MS = 600;

const pause = () => new Promise<void>((resolve) => window.setTimeout(resolve, DEMO_DELAY_MS));

function setDemoSession(active: boolean): void {
	try {
		if (active) window.sessionStorage.setItem(DEMO_SESSION_KEY, '1');
		else window.sessionStorage.removeItem(DEMO_SESSION_KEY);
	} catch {
		// Sin almacenamiento (navegación privada estricta): la demostración funciona igual
	}
}

function hasDemoSession(): boolean {
	try {
		return window.sessionStorage.getItem(DEMO_SESSION_KEY) === '1';
	} catch {
		return false;
	}
}

/** ¿Hay una sesión iniciada? (cookie informativa, ver src/lib/server/session.ts) */
export function hasSession(): boolean {
	if (isDemoAuth) return hasDemoSession();
	return document.cookie.split(';').some((cookie) => cookie.trim() === 'peru_auth=1');
}

interface StartInput {
	email: string;
	name?: string;
	intent: 'login' | 'register';
	/** Página a la que se vuelve al iniciar sesión */
	next: string;
}

/** Envía el código al correo o, si la cuenta no existe, pide el nombre */
export async function startEmailAccess(input: StartInput): Promise<{ next: AuthStep }> {
	if (isDemoAuth) {
		await pause();
		if (input.name) return { next: 'register-code' };
		return { next: input.intent === 'login' ? 'login-code' : 'register-name' };
	}
	return postJson<{ next: AuthStep }>(withBase('/api/auth/email/start/'), input);
}

/** Valida el código e inicia la sesión; devuelve la página a la que hay que ir */
export async function verifyAccessCode(code: string, next: string): Promise<{ redirect: string }> {
	if (isDemoAuth) {
		await pause();
		setDemoSession(true);
		return { redirect: next };
	}
	return postJson<{ redirect: string }>(withBase('/api/auth/email/verify/'), { code });
}

/** Reenvía el código al mismo correo */
export async function resendAccessCode(): Promise<void> {
	if (isDemoAuth) return pause();
	await postJson(withBase('/api/auth/email/resend/'), {});
}

/** Demostración de "Usa tu cuenta de Google": inicia la sesión de ejemplo */
export function startDemoGoogleAccess(): void {
	setDemoSession(true);
}

/** Cierra la sesión (en el servidor o la de demostración) */
export async function endSession(): Promise<void> {
	if (isDemoAuth) {
		setDemoSession(false);
		return;
	}
	await fetch(withBase('/api/auth/logout/'), {
		method: 'POST',
		credentials: 'same-origin',
		headers: { 'X-Requested-With': 'fetch' },
	});
}
