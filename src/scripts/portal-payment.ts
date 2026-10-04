/**
 * Portal · pantalla de pago
 * --------------------------------------------------------------------------
 *  - Selector de banco: muestra el logo del banco elegido (si existe) y
 *    ajusta la sangría del texto (ver PaymentTransferCard.astro).
 *  - Botón de cambio de moneda (PEN ↔ USD): pendiente de definir.
 */

let ready = false;

export function initPaymentScreen(): void {
	if (ready) return;
	ready = true;

	document.querySelectorAll<HTMLSelectElement>('[data-bank-select]').forEach((select) => {
		updateBankLogo(select);
		select.addEventListener('change', () => updateBankLogo(select));
	});

	document.querySelectorAll<HTMLButtonElement>('[data-currency-swap]').forEach((button) => {
		button.addEventListener('click', () => {
			// TODO: alternar el monto entre soles (PEN) y dólares (USD) cuando se
			// defina el tipo de cambio y el diseño del estado en dólares.
		});
	});
}

function updateBankLogo(select: HTMLSelectElement): void {
	const box = select.closest<HTMLElement>('[data-bank-box]');
	if (!box) return;

	let hasLogo = false;
	box.querySelectorAll<HTMLElement>('[data-bank-logo]').forEach((logo) => {
		const visible = logo.dataset.bankLogo === select.value;
		logo.hidden = !visible;
		hasLogo ||= visible;
	});

	box.toggleAttribute('data-has-logo', hasLogo);
}
