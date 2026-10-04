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
function goBack(fallback = '/'): void {
	const cameFromThisSite =
		document.referrer && new URL(document.referrer).origin === window.location.origin;

	if (cameFromThisSite && window.history.length > 1) {
		window.history.back();
	} else {
		window.location.assign(fallback);
	}
}

async function logoutAndRedirect(href: string): Promise<void> {
	// TODO (API): cerrar la sesión en el servidor, por ejemplo:
	//   await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
	// y limpiar cualquier dato del estudiante guardado en el navegador.
	window.location.assign(href);
}
