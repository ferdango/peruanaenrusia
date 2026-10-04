/**
 * Selector de idioma (LanguageModal)
 * --------------------------------------------------------------------------
 * - Guarda el idioma elegido en localStorage (clave "peru-lang").
 * - Actualiza la píldora de idioma del header (`.language-pill`: bandera,
 *   texto ES/EN/RU y aria-label) al cargar cada página y al cambiar de
 *   idioma, sin tocar el componente del header.
 * - En desktop coloca el diálogo como un desplegable debajo de la píldora
 *   (en móvil queda centrado por CSS).
 * - Emite el evento "language:change" en `document` (detail: { code }).
 *
 * Marcado que usa este script (ver src/components/overlays/LanguageModal.astro):
 *
 *   <dialog id="language-modal" data-default-language="es">
 *     <button data-language-option="en" data-language-short="EN"
 *             data-language-name="Inglés" data-language-flag="/url-bandera-24px">…</button>
 *   </dialog>
 *
 * TODO (i18n): hoy solo se recuerda la preferencia; el contenido sigue en
 * español. Cuando existan las traducciones, cargar la versión del idioma
 * elegido (ej. redirigir a /en/ o /ru/ con el enrutado i18n de Astro) en
 * applyLanguage() y actualizar <html lang>.
 */
import { initDialogs } from './dialog';

export const LANGUAGE_STORAGE_KEY = 'peru-lang';

const DIALOG_ID = 'language-modal';
const MOBILE_QUERY = '(max-width: 640px)';
/** Separación entre el header y el desplegable (px) */
const DROPDOWN_GAP = 8;

/** Idioma guardado por la persona (o null si nunca eligió / no hay almacenamiento) */
export function getStoredLanguage(): string | null {
	try {
		return window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
	} catch {
		return null;
	}
}

function storeLanguage(code: string): void {
	try {
		window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
	} catch {
		// Almacenamiento no disponible (ej. navegación privada): solo se aplica en esta página
	}
}

export function initLanguageSelector(): void {
	const found = document.getElementById(DIALOG_ID);
	if (!(found instanceof HTMLDialogElement) || found.dataset.languageReady === 'true') return;
	const dialog: HTMLDialogElement = found;
	dialog.dataset.languageReady = 'true';

	initDialogs();

	const options = Array.from(dialog.querySelectorAll<HTMLButtonElement>('[data-language-option]'));
	if (options.length === 0) return;

	const findOption = (code: string | null) =>
		options.find((option) => option.dataset.languageOption === code);
	const defaultOption = findOption(dialog.dataset.defaultLanguage ?? null) ?? options[0];

	/** Marca la opción elegida y actualiza la píldora del header */
	function applyLanguage(option: HTMLButtonElement): void {
		options.forEach((item) => item.setAttribute('aria-pressed', String(item === option)));

		const { languageShort, languageName, languageFlag } = option.dataset;

		document.querySelectorAll<HTMLElement>('.language-pill').forEach((pill) => {
			const label = pill.querySelector('span');
			if (label && languageShort) label.textContent = languageShort;

			const flag = pill.querySelector('img');
			if (flag && languageFlag && flag.getAttribute('src') !== languageFlag) {
				flag.removeAttribute('srcset');
				flag.src = languageFlag;
			}

			if (languageName) pill.setAttribute('aria-label', `Cambiar idioma (actual: ${languageName})`);
		});

		// TODO (i18n): cargar las traducciones del idioma option.dataset.languageOption.
	}

	// Al cargar la página: idioma guardado (si es válido) o el idioma por defecto
	applyLanguage(findOption(getStoredLanguage()) ?? defaultOption);

	options.forEach((option) => {
		option.addEventListener('click', () => {
			const code = option.dataset.languageOption!;
			storeLanguage(code);
			applyLanguage(option);
			document.dispatchEvent(new CustomEvent('language:change', { detail: { code } }));
			dialog.close();
		});
	});

	// ----- Posición de desplegable bajo la píldora del header (solo desktop) -----

	let lastTrigger: HTMLElement | undefined;

	function placeDialog(): void {
		const header = lastTrigger?.closest('header');

		if (!lastTrigger || !header || window.matchMedia(MOBILE_QUERY).matches) {
			// Sin botón de referencia (o en móvil): posición por defecto del CSS
			dialog.style.removeProperty('--language-modal-top');
			dialog.style.removeProperty('--language-modal-left');
			return;
		}

		const triggerRect = lastTrigger.getBoundingClientRect();
		const top = header.getBoundingClientRect().bottom + DROPDOWN_GAP;
		// Alineado con la píldora, sin salirse por la derecha en pantallas angostas
		const maxLeft = window.innerWidth - dialog.offsetWidth - DROPDOWN_GAP * 2;
		const left = Math.max(DROPDOWN_GAP * 2, Math.min(triggerRect.left, maxLeft));

		dialog.style.setProperty('--language-modal-top', `${Math.round(top)}px`);
		dialog.style.setProperty('--language-modal-left', `${Math.round(left)}px`);
	}

	dialog.addEventListener('dialog:open', (event) => {
		lastTrigger = (event as CustomEvent<{ trigger?: HTMLElement }>).detail?.trigger;
		placeDialog();

		// El foco empieza en el idioma seleccionado
		const selected =
			options.find((option) => option.getAttribute('aria-pressed') === 'true') ?? options[0];
		selected.focus();
	});

	window.addEventListener('resize', () => {
		if (dialog.open) placeDialog();
	});
}
