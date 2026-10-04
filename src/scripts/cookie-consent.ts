/**
 * Consentimiento de cookies (CookieBanner)
 * --------------------------------------------------------------------------
 * - El aviso se renderiza oculto (atributo `hidden`) y este script lo muestra
 *   solo si la persona todavía no eligió. Así quien ya respondió no ve ningún
 *   "parpadeo" al cargar la página.
 * - La elección se guarda en localStorage (clave "peru-cookie-consent") con
 *   el valor "accepted" o "rejected".
 * - Al elegir se emite el evento "cookie-consent:change" en `document`
 *   (detail: { value }) para que otros scripts reaccionen.
 *
 * Uso desde otros scripts:
 *
 *   import { getCookieConsent } from '@scripts/cookie-consent';
 *   if (getCookieConsent() === 'accepted') { … }
 *
 * TODO: cuando se agreguen analítica o píxeles de publicidad, cargarlos solo
 * si getCookieConsent() === 'accepted' (y al recibir "cookie-consent:change").
 */

export const COOKIE_CONSENT_KEY = 'peru-cookie-consent';

export type CookieConsent = 'accepted' | 'rejected';

function isConsent(value: unknown): value is CookieConsent {
	return value === 'accepted' || value === 'rejected';
}

/** Elección guardada o null si la persona aún no respondió */
export function getCookieConsent(): CookieConsent | null {
	try {
		const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
		return isConsent(value) ? value : null;
	} catch {
		return null;
	}
}

/** Guarda la elección y avisa al resto de la página */
export function setCookieConsent(value: CookieConsent): void {
	try {
		window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
	} catch {
		// Almacenamiento no disponible (ej. navegación privada): vale solo para esta visita
	}
	document.dispatchEvent(new CustomEvent('cookie-consent:change', { detail: { value } }));
}

/** Tiempo máximo de la animación de salida antes de ocultar el aviso (ms) */
const HIDE_FALLBACK_MS = 600;

function hideBanner(banner: HTMLElement): void {
	banner.classList.remove('is-visible');

	let done = false;
	const finish = () => {
		if (done) return;
		done = true;
		banner.hidden = true;
	};

	banner.addEventListener('transitionend', finish, { once: true });
	// Respaldo: sin transición (movimiento reducido) el evento no llega
	window.setTimeout(finish, HIDE_FALLBACK_MS);
}

export function initCookieBanner(): void {
	const banner = document.querySelector<HTMLElement>('[data-cookie-banner]');
	if (!banner || banner.dataset.cookieReady === 'true') return;
	banner.dataset.cookieReady = 'true';

	// Ya respondió en una visita anterior → el aviso sigue oculto
	if (getCookieConsent()) return;

	banner.querySelectorAll<HTMLButtonElement>('[data-cookie-consent]').forEach((button) => {
		button.addEventListener('click', () => {
			const value = button.dataset.cookieConsent;
			if (!isConsent(value)) return;
			setCookieConsent(value);
			hideBanner(banner);
		});
	});

	// Mostrar con una pequeña animación de entrada
	banner.hidden = false;
	window.requestAnimationFrame(() => {
		window.requestAnimationFrame(() => banner.classList.add('is-visible'));
	});
}
