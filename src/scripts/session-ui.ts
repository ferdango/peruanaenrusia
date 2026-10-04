/**
 * Estado de sesión en las páginas estáticas
 * --------------------------------------------------------------------------
 * Las páginas públicas son HTML estático, así que no saben si hay sesión.
 * Este script lee la cookie informativa `peru_auth` (sin datos personales) y
 * adapta los textos de los botones de acceso:
 *
 *   <button data-dialog-open="auth-modal" data-session-text="Mi proceso">Inicia sesión</button>
 *       → con sesión, el texto pasa a "Mi proceso".
 *   <button aria-label="Iniciar sesión" data-session-label="Ir a mi proceso">…</button>
 *       → con sesión, cambia el nombre accesible.
 *
 * Al pulsarlos con sesión iniciada, src/scripts/auth-flow.ts lleva al portal
 * en lugar de abrir el modal.
 */
import { hasSession } from './auth-flow';

export function initSessionUi(): void {
	if (!hasSession()) return;
	document.documentElement.dataset.session = 'true';

	document.querySelectorAll<HTMLElement>('[data-session-text]').forEach((element) => {
		element.textContent = element.dataset.sessionText ?? element.textContent;
	});

	document.querySelectorAll<HTMLElement>('[data-session-label]').forEach((element) => {
		element.setAttribute('aria-label', element.dataset.sessionLabel ?? '');
		element.setAttribute('title', element.dataset.sessionLabel ?? '');
	});
}
