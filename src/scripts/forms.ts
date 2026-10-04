/**
 * Formularios: validación accesible y envío a la API
 * --------------------------------------------------------------------------
 * Utilidades compartidas por los formularios del sitio (Libro de
 * reclamaciones, modal de acceso…). Usan la validación nativa del navegador
 * (required, type, pattern, maxlength…) con mensajes propios en español:
 *
 *   <input required data-msg-required="Ingresa tu correo."
 *          data-msg-invalid="Revisa el formato del correo." aria-describedby="x-error">
 *   <p id="x-error" data-form-error></p>        ← dentro del mismo [data-form-field]
 *
 * El error se asocia al campo (aria-describedby + aria-invalid) y se anuncia
 * con aria-live. Mientras se escribe, el error se quita en cuanto el campo
 * queda bien.
 */

export type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const isControl = (element: EventTarget | null): element is FormControl =>
	element instanceof HTMLInputElement ||
	element instanceof HTMLSelectElement ||
	element instanceof HTMLTextAreaElement;

/** Mensaje de error de un campo (vacío si es válido) */
export function messageFor(control: FormControl): string {
	const { validity, dataset } = control;
	if (validity.valid) return '';
	if (validity.valueMissing) return dataset.msgRequired ?? control.validationMessage;
	return dataset.msgInvalid ?? dataset.msgRequired ?? control.validationMessage;
}

/** Muestra (o quita) el mensaje de error de un campo */
export function setFieldError(control: FormControl, message: string): void {
	const error = control.closest('[data-form-field]')?.querySelector<HTMLElement>('[data-form-error]');
	if (message) control.setAttribute('aria-invalid', 'true');
	else control.removeAttribute('aria-invalid');
	if (error && error.textContent !== message) error.textContent = message;
}

export function validateControl(control: FormControl): boolean {
	const message = messageFor(control);
	setFieldError(control, message);
	return !message;
}

/** Valida todos los campos visibles del formulario y enfoca el primero con error */
export function validateForm(form: HTMLFormElement): boolean {
	let firstInvalid: FormControl | null = null;

	for (const control of Array.from(form.elements)) {
		if (!isControl(control) || control.disabled || control.type === 'hidden') continue;
		// Espacios al inicio o al final no cuentan
		if (control instanceof HTMLInputElement && control.type !== 'checkbox' && control.type !== 'radio') {
			control.value = control.value.trim();
		}
		if (control instanceof HTMLTextAreaElement) control.value = control.value.trim();
		if (!validateControl(control) && !firstInvalid) firstInvalid = control;
	}

	firstInvalid?.focus();
	return firstInvalid === null;
}

/** Quita el error de un campo en cuanto se corrige (se llama una vez por formulario) */
export function enableLiveValidation(form: HTMLFormElement): void {
	const revalidate = (event: Event) => {
		const control = event.target;
		if (isControl(control) && control.getAttribute('aria-invalid') === 'true') validateControl(control);
	};
	form.addEventListener('input', revalidate);
	form.addEventListener('change', revalidate);
}

/** Limpia los errores de todos los campos */
export function clearErrors(form: HTMLFormElement): void {
	for (const control of Array.from(form.elements)) {
		if (isControl(control)) setFieldError(control, '');
	}
}

// ---------------------------------------------------------------------------
// Envío a la API
// ---------------------------------------------------------------------------

/** Error devuelto por la API (con el mensaje para mostrar a la persona) */
export class ApiError extends Error {
	constructor(
		message: string,
		readonly status: number,
		readonly field?: string,
	) {
		super(message);
		this.name = 'ApiError';
	}
}

const NETWORK_ERROR = 'No pudimos conectarnos. Revisa tu conexión a internet e inténtalo de nuevo.';

/**
 * POST con cuerpo JSON a una ruta de la API del sitio (/api/…).
 * La cabecera X-Requested-With ayuda al servidor a rechazar envíos desde
 * otros sitios (CSRF); la cookie de sesión viaja automáticamente.
 */
export async function postJson<T>(url: string, data: unknown): Promise<T> {
	let response: Response;
	try {
		response = await fetch(url, {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				'X-Requested-With': 'fetch',
			},
			body: JSON.stringify(data),
			signal: AbortSignal.timeout(20_000),
		});
	} catch {
		throw new ApiError(NETWORK_ERROR, 0);
	}

	const payload = (await response.json().catch(() => ({}))) as { error?: string; field?: string } & T;

	if (!response.ok) {
		throw new ApiError(
			payload.error ?? 'Ocurrió un error inesperado. Inténtalo de nuevo en unos minutos.',
			response.status,
			payload.field,
		);
	}

	return payload;
}
