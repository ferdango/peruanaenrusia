/**
 * Portal · envío de formularios
 * --------------------------------------------------------------------------
 * Formularios del portal marcados con `data-portal-form`. Primero actúa la
 * validación nativa del navegador (campos `required`, formatos…); si todo
 * está bien, se envía (TODO: API) y se navega a `data-redirect`.
 *
 *   <form data-portal-form data-redirect="/portal/pago/enviado/">…</form>
 */

let ready = false;

export function initPortalForms(): void {
	if (ready) return;
	ready = true;

	// El evento "submit" solo llega si el formulario pasó la validación nativa
	document.addEventListener('submit', (event) => {
		const form = event.target;
		if (!(form instanceof HTMLFormElement) || !form.matches('[data-portal-form]')) return;

		event.preventDefault();
		void submitForm(form);
	});
}

async function submitForm(form: HTMLFormElement): Promise<void> {
	const submitButtons = form.querySelectorAll<HTMLButtonElement>('[type="submit"]');
	submitButtons.forEach((button) => button.setAttribute('aria-disabled', 'true'));
	form.setAttribute('aria-busy', 'true');

	try {
		// TODO (API): enviar los datos al backend, por ejemplo:
		//   const response = await fetch(form.dataset.endpoint!, { method: 'POST', body: new FormData(form) });
		//   if (!response.ok) throw new Error(await response.text());
		const redirect = form.dataset.redirect;
		if (redirect) {
			window.location.assign(redirect);
			return;
		}
	} catch (error) {
		// TODO (API): mostrar un mensaje de error al estudiante.
		console.error('[portal] No se pudo enviar el formulario', error);
	}

	submitButtons.forEach((button) => button.removeAttribute('aria-disabled'));
	form.removeAttribute('aria-busy');
}
