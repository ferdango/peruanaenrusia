/**
 * Portal · navegación
 * --------------------------------------------------------------------------
 * Comportamientos de navegación comunes del portal, conectados por atributos:
 *
 *   <button data-portal-back data-fallback="/portal/mi-proceso/">Volver</button>
 *       → vuelve a la página anterior (o a `data-fallback` si se entró directo).
 *
 *   <a href="/" data-portal-logout>…</a>
 *       → cierra la sesión y vuelve al inicio del sitio.
 *
 * Se usa delegación de eventos: basta con llamar initPortalNav() una vez.
 */
import { routes } from '@data/navigation';
import { endSession } from './auth-api';

let ready = false;

export function initPortalNav(): void {
	if (ready) return;
	ready = true;

	document.addEventListener('click', (event) => {
		const target = event.target as HTMLElement;

		// ----- "Volver" -----
		const back = target.closest<HTMLElement>('[data-portal-back]');
		if (back) {
			event.preventDefault();
			goBack(back.dataset.fallback);
			return;
		}

		// ----- Cerrar sesión -----
		const logout = target.closest<HTMLAnchorElement>('a[data-portal-logout]');
		if (logout) {
			event.preventDefault();
			void logoutAndRedirect(logout.href);
		}
	});
}

/** Vuelve a la página anterior del mismo sitio; si no hay, va a `fallback` */
function goBack(fallback = routes.home): void {
	const cameFromThisSite =
		document.referrer && new URL(document.referrer).origin === window.location.origin;

	if (cameFromThisSite && window.history.length > 1) {
		window.history.back();
	} else {
		window.location.assign(fallback);
	}
}

/** Cierra la sesión (POST /api/auth/logout/, ver auth-api.ts) y vuelve al inicio */
async function logoutAndRedirect(href: string): Promise<void> {
	try {
		await endSession();
	} catch {
		// Aunque falle la red, se sale del portal; la sesión vence sola a los 7 días
	}
	window.location.assign(href);
}
