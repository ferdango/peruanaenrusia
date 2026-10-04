/**
 * Flujo de inicio de sesión y registro (AuthModal)
 * --------------------------------------------------------------------------
 * Controla los pasos del modal <dialog id="auth-modal"> (solo uno visible):
 *
 *   login ─(Continuar manualmente)→ login-email → login-code → portal
 *     └─(Regístrate aquí)→ register-email → register-name → register-code → portal
 *
 * Marcado que usa este script (ver src/components/overlays/AuthModal.astro):
 *   data-auth-step="login-email"   → contenedor de un paso
 *   data-auth-title                → título del paso (recibe el foco al cambiar)
 *   data-auth-goto="login"         → botón que lleva a otro paso (incluye "‹")
 *   data-auth-form="login-email"   → formulario del paso
 *   data-auth-next="login-code"    → paso siguiente cuando el formulario es válido
 *   data-auth-complete             → último paso: entra al portal
 *   data-auth-field / data-auth-error → campo y su mensaje de error
 *   data-msg-required / data-msg-invalid (en el <input>) → textos de error
 *   data-auth-email                → muestra el correo que escribió la persona
 *   data-auth-google               → "Usa tu cuenta de Google" (OAuth pendiente)
 *   data-auth-resend / data-auth-status → "Volver a enviarlo" y su confirmación
 *   data-auth-announcer            → región aria-live que anuncia el paso actual
 *   data-auth-redirect (en el <dialog>) → URL del portal tras completar el flujo
 *
 * Abrir el modal directamente en un paso: cualquier elemento con
 * data-auth-view="register" (o "login") abre el modal en ese paso, tenga o no
 * data-dialog-open="auth-modal":
 *
 *   <button data-auth-view="register">Crear mi cuenta</button>
 *
 * Todavía no hay backend: los lugares donde van las llamadas a la API están
 * marcados con "TODO (API)".
 */
import { initDialogs, openDialog } from './dialog';

/** Pasos del modal (valor de data-auth-step) */
export type AuthStep =
	'login' | 'login-email' | 'login-code' | 'register-email' | 'register-name' | 'register-code';

const DIALOG_ID = 'auth-modal';
const DEFAULT_STEP: AuthStep = 'login';

/** data-auth-view → paso con el que se abre el modal */
const VIEWS: Record<string, AuthStep> = {
	login: 'login',
	register: 'register-email',
};

/** Ruta del portal si el <dialog> no define data-auth-redirect */
const FALLBACK_REDIRECT = '/portal/mi-proceso/';

/** Tiempo que se muestra la confirmación de "Volver a enviarlo" (ms) */
const RESEND_FEEDBACK_MS = 5000;

interface AuthState {
	email: string;
	name: string;
}

interface ShowStepOptions {
	/** Mueve el foco al título del paso (por defecto sí) */
	focus?: boolean;
	/** Anuncia el paso en la región aria-live (por defecto sí) */
	announce?: boolean;
}

export function initAuthFlow(): void {
	const found = document.getElementById(DIALOG_ID);
	if (!(found instanceof HTMLDialogElement) || found.dataset.authReady === 'true') return;
	const dialog: HTMLDialogElement = found;
	dialog.dataset.authReady = 'true';

	// Abre/cierra con data-dialog-open / data-dialog-close (idempotente)
	initDialogs();

	const steps = Array.from(dialog.querySelectorAll<HTMLElement>('[data-auth-step]'));
	const forms = Array.from(dialog.querySelectorAll<HTMLFormElement>('form[data-auth-form]'));
	const panel = dialog.querySelector<HTMLElement>('[data-auth-panel]');
	const announcer = dialog.querySelector<HTMLElement>('[data-auth-announcer]');

	const state: AuthState = { email: '', name: '' };
	const timers = new Set<number>();

	// ----------------------------------------------------------------------
	// Pasos
	// ----------------------------------------------------------------------

	function showStep(step: AuthStep, { focus = true, announce = true }: ShowStepOptions = {}): void {
		const target = steps.find((section) => section.dataset.authStep === step);
		if (!target) {
			console.warn(`[auth] No existe el paso "${step}"`);
			return;
		}

		steps.forEach((section) => {
			section.hidden = section !== target;
		});

		// El nombre accesible del diálogo es siempre el título del paso visible
		const title = target.querySelector<HTMLElement>('[data-auth-title]');
		if (title?.id) dialog.setAttribute('aria-labelledby', title.id);

		panel?.scrollTo({ top: 0 });

		if (focus) title?.focus({ preventScroll: true });

		if (announce && announcer && title) {
			// Vaciar y volver a escribir garantiza que se anuncie aunque el texto se repita
			announcer.textContent = '';
			window.requestAnimationFrame(() => {
				announcer.textContent = title.textContent?.trim() ?? '';
			});
		}
	}

	// Botones que llevan a otro paso ("Continuar manualmente", "Regístrate aquí", "‹")
	dialog.addEventListener('click', (event) => {
		const button = (event.target as Element).closest<HTMLElement>('[data-auth-goto]');
		if (!button) return;
		event.preventDefault();
		showStep(button.dataset.authGoto as AuthStep);
	});

	// ----------------------------------------------------------------------
	// Validación (Constraint Validation API del navegador + mensajes propios)
	// ----------------------------------------------------------------------

	function messageFor(input: HTMLInputElement): string {
		const { validity, dataset } = input;
		if (validity.valid) return '';
		if (validity.valueMissing) return dataset.msgRequired ?? input.validationMessage;
		return dataset.msgInvalid ?? dataset.msgRequired ?? input.validationMessage;
	}

	function setError(input: HTMLInputElement, message: string): void {
		const error = input.closest('[data-auth-field]')?.querySelector<HTMLElement>('[data-auth-error]');

		if (message) input.setAttribute('aria-invalid', 'true');
		else input.removeAttribute('aria-invalid');

		if (error && error.textContent !== message) error.textContent = message;
	}

	function validateInput(input: HTMLInputElement): boolean {
		const message = messageFor(input);
		setError(input, message);
		return !message;
	}

	/** Valida todos los campos del formulario y enfoca el primero con error */
	function validateForm(form: HTMLFormElement): boolean {
		let firstInvalid: HTMLInputElement | null = null;

		for (const input of form.querySelectorAll<HTMLInputElement>('input')) {
			// Espacios al inicio o al final no cuentan (ej. "  Ana ")
			input.value = input.value.trim();
			if (!validateInput(input) && !firstInvalid) firstInvalid = input;
		}

		firstInvalid?.focus();
		return firstInvalid === null;
	}

	dialog.addEventListener('input', (event) => {
		const input = event.target;
		if (!(input instanceof HTMLInputElement)) return;

		// Campo de código: solo números y como máximo 6 (permite pegar "123 456")
		if (input.inputMode === 'numeric') {
			const digits = input.value.replace(/\D/g, '').slice(0, 6);
			if (digits !== input.value) input.value = digits;
		}

		// Si el campo tenía un error, se revisa mientras se escribe para quitarlo cuanto antes
		if (input.getAttribute('aria-invalid') === 'true') validateInput(input);
	});

	// ----------------------------------------------------------------------
	// Envío de cada paso
	// ----------------------------------------------------------------------

	function setEmail(email: string): void {
		state.email = email.trim();
		dialog.querySelectorAll<HTMLElement>('[data-auth-email]').forEach((element) => {
			element.textContent = state.email;
		});
	}

	function redirectToPortal(): void {
		window.location.href = dialog.dataset.authRedirect || FALLBACK_REDIRECT;
	}

	forms.forEach((form) => {
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			if (!validateForm(form)) return;

			const data = new FormData(form);
			const email = data.get('email');
			const name = data.get('name');
			if (typeof email === 'string') setEmail(email);
			if (typeof name === 'string') state.name = name.trim();

			switch (form.dataset.authForm as AuthStep) {
				case 'login-email':
					// TODO (API): consultar si state.email ya tiene una cuenta.
					//   · Sí → enviar el código de acceso y continuar a "login-code".
					//   · No → continuar a "register-name" (el correo ya queda guardado).
					break;
				case 'register-email':
					// TODO (API): si state.email ya está registrado, enviar el código y
					//   continuar a "login-code" en lugar de "register-name".
					break;
				case 'register-name':
					// TODO (API): crear la cuenta con { name: state.name, email: state.email }
					//   y enviar el código de verificación al correo.
					break;
				case 'login-code':
				case 'register-code':
					// TODO (API): validar el código (data.get('code')) y crear la sesión.
					break;
			}

			if (form.hasAttribute('data-auth-complete')) {
				// Demo: sin backend, se entra directamente al portal
				redirectToPortal();
				return;
			}

			const next = form.dataset.authNext as AuthStep | undefined;
			if (next) showStep(next);
		});
	});

	// "Usa tu cuenta de Google"
	dialog.querySelectorAll<HTMLButtonElement>('[data-auth-google]').forEach((button) => {
		button.addEventListener('click', () => {
			// TODO (OAuth): redirigir al inicio de sesión con Google (ej. /api/auth/google)
			//   y, al volver, entrar al portal. Por ahora no hace nada.
			console.info('[auth] Inicio de sesión con Google pendiente de implementar (OAuth).');
		});
	});

	// "¿No recibiste el código? Volver a enviarlo"
	dialog.querySelectorAll<HTMLButtonElement>('[data-auth-resend]').forEach((button) => {
		button.addEventListener('click', () => {
			// Mientras se muestra la confirmación, no se reenvía otra vez
			if (button.getAttribute('aria-disabled') === 'true') return;

			// TODO (API): volver a enviar el código a state.email.

			const status = button
				.closest('[data-auth-step]')
				?.querySelector<HTMLElement>('[data-auth-status]');
			if (!status) return;

			status.textContent = (status.dataset.message ?? '').replace('{email}', state.email);
			button.setAttribute('aria-disabled', 'true');

			const timer = window.setTimeout(() => {
				status.textContent = '';
				button.removeAttribute('aria-disabled');
				timers.delete(timer);
			}, RESEND_FEEDBACK_MS);
			timers.add(timer);
		});
	});

	// ----------------------------------------------------------------------
	// Abrir y cerrar
	// ----------------------------------------------------------------------

	/** Deja el modal como recién cargado: paso 1, campos vacíos y sin errores */
	function resetFlow(): void {
		timers.forEach((timer) => window.clearTimeout(timer));
		timers.clear();

		forms.forEach((form) => form.reset());
		dialog.querySelectorAll<HTMLInputElement>('input').forEach((input) => setError(input, ''));
		dialog.querySelectorAll<HTMLElement>('[data-auth-status]').forEach((status) => {
			status.textContent = '';
		});
		dialog.querySelectorAll<HTMLElement>('[data-auth-resend]').forEach((button) => {
			button.removeAttribute('aria-disabled');
		});
		if (announcer) announcer.textContent = '';

		state.name = '';
		setEmail('');
		showStep(DEFAULT_STEP, { focus: false, announce: false });
	}

	// Al abrir: paso según data-auth-view del botón que lo abrió y foco en el título
	dialog.addEventListener('dialog:open', (event) => {
		const trigger = (event as CustomEvent<{ trigger?: HTMLElement }>).detail?.trigger;
		const view = trigger?.closest<HTMLElement>('[data-auth-view]')?.dataset.authView ?? '';
		showStep(VIEWS[view] ?? DEFAULT_STEP, { announce: false });
	});

	// Al cerrar (X, Esc o clic fuera): volver al paso 1
	dialog.addEventListener('close', resetFlow);

	// Elementos con data-auth-view pero sin data-dialog-open (dialog.ts no los abre)
	document.addEventListener('click', (event) => {
		const trigger = (event.target as Element | null)?.closest<HTMLElement>('[data-auth-view]');
		if (!trigger || trigger.hasAttribute('data-dialog-open') || dialog.contains(trigger)) return;
		event.preventDefault();
		openDialog(DIALOG_ID, trigger);
	});
}
