/**
 * Portal · copiar al portapapeles
 * --------------------------------------------------------------------------
 * Cualquier botón con `data-copy="texto"` copia ese texto al hacer clic y
 * muestra el aviso "Copiado" durante 2 segundos (ver CopyPill.astro):
 *
 *   <button type="button" data-copy="193-2414529-0-80">…
 *       <span data-copy-feedback>Copiado</span>
 *   </button>
 *
 * Mientras se muestra el aviso, el botón tiene el atributo data-copied
 * ("true" si se copió, "false" si el navegador no lo permitió).
 */
import { announce } from './portal-announce';

const FEEDBACK_MS = 2000;
const messages = {
	success: 'Copiado',
	error: 'No se pudo copiar',
};

const timers = new WeakMap<HTMLElement, number>();
let ready = false;

export function initPortalCopy(): void {
	if (ready) return;
	ready = true;

	document.addEventListener('click', async (event) => {
		const button = (event.target as HTMLElement).closest<HTMLElement>('[data-copy]');
		if (!button) return;

		const value = button.dataset.copy ?? '';
		const copied = await copyText(value);

		showFeedback(button, copied);
		announce(copied ? `${messages.success}: ${value}` : messages.error);
	});
}

/** Usa la API del portapapeles (disponible en HTTPS y en localhost) */
async function copyText(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
}

function showFeedback(button: HTMLElement, copied: boolean): void {
	const feedback = button.querySelector<HTMLElement>('[data-copy-feedback]');
	if (feedback) feedback.textContent = copied ? messages.success : messages.error;

	button.dataset.copied = String(copied);
	window.clearTimeout(timers.get(button));
	timers.set(
		button,
		window.setTimeout(() => {
			delete button.dataset.copied;
		}, FEEDBACK_MS),
	);
}
