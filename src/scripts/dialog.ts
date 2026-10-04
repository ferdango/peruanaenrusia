/**
 * Diálogos (modales y menú lateral)
 * --------------------------------------------------------------------------
 * Sistema mínimo para abrir/cerrar elementos <dialog> desde cualquier botón,
 * sin escribir JavaScript en cada componente:
 *
 *   <button data-dialog-open="auth-modal">Inicia sesión</button>   ← abre
 *   <dialog id="auth-modal"> …
 *       <button data-dialog-close>Cerrar</button>                  ← cierra
 *   </dialog>
 *
 * Ventajas de usar <dialog> nativo:
 *   - Mantiene el foco dentro del modal (accesible con teclado).
 *   - Se cierra con la tecla Esc.
 *   - Muestra un fondo (::backdrop) que se puede estilizar con CSS.
 *
 * Extras de este script:
 *   - Cerrar al hacer clic fuera del contenido (en el fondo).
 *   - Bloquear el scroll de la página mientras hay un diálogo abierto.
 *   - Eventos "dialog:open" / "dialog:close" para que otros scripts reaccionen.
 */

let listenersReady = false;

export function initDialogs(): void {
	if (listenersReady) return;
	listenersReady = true;

	// Delegación de eventos: funciona incluso con botones agregados después.
	document.addEventListener('click', (event) => {
		const target = event.target as HTMLElement;

		const opener = target.closest<HTMLElement>('[data-dialog-open]');
		if (opener) {
			event.preventDefault();
			openDialog(opener.dataset.dialogOpen!, opener);
			return;
		}

		const closer = target.closest<HTMLElement>('[data-dialog-close]');
		if (closer) {
			event.preventDefault();
			closer.closest('dialog')?.close();
			return;
		}

		// Clic sobre el fondo del diálogo (fuera de su contenido) → cerrar
		if (target instanceof HTMLDialogElement && target.open && target.dataset.dismissable !== 'false') {
			const rect = target.getBoundingClientRect();
			const { clientX: x, clientY: y } = event as MouseEvent;
			const clickedOutside = x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;
			if (clickedOutside) target.close();
		}
	});
}

/** Abre un diálogo por su id. Si ya hay otro abierto, lo cierra primero. */
export function openDialog(id: string, trigger?: HTMLElement): void {
	const dialog = document.getElementById(id);
	if (!(dialog instanceof HTMLDialogElement)) {
		console.warn(`[dialog] No existe un <dialog id="${id}">`);
		return;
	}

	document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach((openDialog) => {
		if (openDialog !== dialog) openDialog.close();
	});

	dialog.showModal();
	document.documentElement.classList.add('is-scroll-locked');
	dialog.dispatchEvent(new CustomEvent('dialog:open', { detail: { trigger } }));

	dialog.addEventListener(
		'close',
		() => {
			if (!document.querySelector('dialog[open]')) {
				document.documentElement.classList.remove('is-scroll-locked');
			}
			dialog.dispatchEvent(new CustomEvent('dialog:close'));
			trigger?.focus({ preventScroll: true });
		},
		{ once: true },
	);
}
