/**
 * Portal · avisos para lectores de pantalla
 * --------------------------------------------------------------------------
 * PortalLayout incluye una región oculta `[data-portal-announcer]` con
 * aria-live="polite". Esta función escribe un mensaje en ella para que los
 * lectores de pantalla lo lean (ej. "Copiado", "Archivo seleccionado: …").
 */

export function announce(message: string): void {
	const region = document.querySelector<HTMLElement>('[data-portal-announcer]');
	if (!region) return;

	// Se vacía primero para que el mismo mensaje se vuelva a anunciar
	region.textContent = '';
	window.setTimeout(() => {
		region.textContent = message;
	}, 50);
}
