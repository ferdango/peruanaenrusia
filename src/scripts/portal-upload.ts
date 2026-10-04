/**
 * Portal · subida de archivos (clic o arrastrar y soltar)
 * --------------------------------------------------------------------------
 * Funciona con cualquier contenedor marcado así:
 *
 *   <div data-upload>
 *       <input type="file" accept=".pdf,…" data-upload-input />
 *       <label data-upload-dropzone>…</label>          ← opcional: zona para soltar
 *       <span data-upload-label>Subir archivo</span>    ← opcional: texto del botón
 *       <p data-upload-output hidden></p>               ← nombre del archivo elegido
 *   </div>
 *
 * Al elegir (o soltar) un archivo se valida el formato y el tamaño, se muestra
 * su nombre y el contenedor pasa a data-upload-state="selected" (o "error").
 * Ver FileDropzone.astro, UploadButton.astro y DocumentRow.astro.
 */
import { announce } from './portal-announce';

// TODO: confirmar el tamaño máximo permitido con el backend.
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const texts = {
	selected: (name: string) => `Archivo seleccionado: ${name}`,
	invalidType: 'Formato no permitido. Usa un archivo JPG, PNG o PDF.',
	tooBig: 'El archivo supera el tamaño máximo de 10 MB.',
	change: 'Cambiar archivo',
};

let ready = false;

export function initPortalUploads(): void {
	if (ready) return;
	ready = true;

	// ----- Selección con el explorador de archivos -----
	document.addEventListener('change', (event) => {
		const input = event.target;
		if (input instanceof HTMLInputElement && input.matches('[data-upload-input]')) {
			handleSelection(input);
		}
	});

	// ----- Arrastrar y soltar -----
	document.addEventListener('dragover', (event) => {
		const zone = getDropzone(event);
		if (!zone) return;
		event.preventDefault();
		zone.dataset.dragover = '';
	});

	document.addEventListener('dragleave', (event) => {
		const zone = getDropzone(event);
		if (zone && !zone.contains(event.relatedTarget as Node | null)) delete zone.dataset.dragover;
	});

	document.addEventListener('drop', (event) => {
		const zone = getDropzone(event);
		if (!zone) return;
		event.preventDefault();
		delete zone.dataset.dragover;

		const input = zone.closest('[data-upload]')?.querySelector<HTMLInputElement>('[data-upload-input]');
		const files = event.dataTransfer?.files;
		if (!input || !files?.length) return;

		input.files = files;
		handleSelection(input);
	});
}

function getDropzone(event: DragEvent): HTMLElement | null {
	return (event.target as HTMLElement | null)?.closest?.<HTMLElement>('[data-upload-dropzone]') ?? null;
}

function handleSelection(input: HTMLInputElement): void {
	const root = input.closest<HTMLElement>('[data-upload]');
	const output = root?.querySelector<HTMLElement>('[data-upload-output]');
	const file = input.files?.[0];
	if (!root || !output) return;

	if (!file) {
		delete root.dataset.uploadState;
		output.hidden = true;
		return;
	}

	const error = !isAccepted(file, input.accept)
		? texts.invalidType
		: file.size > MAX_FILE_SIZE
			? texts.tooBig
			: null;

	if (error) {
		input.value = '';
		root.dataset.uploadState = 'error';
		output.dataset.state = 'error';
		output.textContent = error;
		output.hidden = false;
		announce(error);
		return;
	}

	root.dataset.uploadState = 'selected';
	output.dataset.state = 'selected';
	output.textContent = `${file.name} (${formatSize(file.size)})`;
	output.hidden = false;

	const label = root.querySelector<HTMLElement>('[data-upload-label]');
	if (label) label.textContent = texts.change;

	announce(texts.selected(file.name));

	// TODO (API): subir el archivo, por ejemplo:
	//   const body = new FormData();
	//   body.append(input.name, file);
	//   await fetch('/api/portal/documentos', { method: 'POST', body });
}

/** Comprueba el archivo contra el atributo accept (".pdf,.png" o "image/*") */
function isAccepted(file: File, accept: string): boolean {
	if (!accept) return true;
	const name = file.name.toLowerCase();
	return accept
		.split(',')
		.map((rule) => rule.trim().toLowerCase())
		.some((rule) =>
			rule.startsWith('.')
				? name.endsWith(rule)
				: rule.endsWith('/*')
					? file.type.startsWith(rule.slice(0, -1))
					: file.type === rule,
		);
}

function formatSize(bytes: number): string {
	if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
