/**
 * Flujo de inicio de sesión y registro (AuthModal)
 * --------------------------------------------------------------------------
 * Controla los pasos del modal <dialog id="auth-modal"> (solo uno visible):
 *
 *   login ─(Continuar manualmente)→ login-email → login-code → portal
 *     └─(Regístrate aquí)→ register-email → register-name → register-code → portal
 *
 * Backend (src/pages/api/auth/, llamado desde src/scripts/auth-api.ts):
 *   - "Usa tu cuenta de Google" → enlace a /api/auth/google/?next=… (OAuth en
 *     el servidor; al volver, la sesión ya está iniciada).
 *   - Pasos de correo → POST /api/auth/email/start/ (envía el código o pide
 *     el nombre si la cuenta no existe), /verify/ (valida el código e inicia
 *     la sesión) y /resend/ (reenvía el código).
 *   - En la versión estática (GitHub Pages) no hay servidor: auth-api.ts
 *     simula estas respuestas y el modal muestra un aviso de demostración.
 *
 * Marcado que usa este script (ver src/components/overlays/AuthModal.astro):
 *   data-auth-step="login-email"   → contenedor de un paso
 *   data-auth-title                → título del paso (recibe el foco al cambiar)
 *   data-auth-goto="login"         → botón que lleva a otro paso (incluye "‹")
 *   data-auth-form="login-email"   → formulario del paso
 *   data-auth-field / data-auth-error → campo y su mensaje de error
 *   data-msg-required / data-msg-invalid (en el <input>) → textos de error
 *   data-auth-email                → muestra el correo que escribió la persona
 *   data-auth-google               → enlace "Usa tu cuenta de Google"
 *   data-auth-alert                → aviso de error del paso (role="alert")
 *   data-auth-resend / data-auth-status → "Volver a enviarlo" y su confirmación
 *   data-auth-announcer            → región aria-live que anuncia el paso actual
 *   data-auth-redirect (en el <dialog>) → URL del portal tras completar el flujo
 *
 * Abrir el modal:
 *   - Cualquier elemento con data-dialog-open="auth-modal" o data-auth-view
 *     ("login" o "register").
 *   - Desde una URL: /?login=1 (o login=register), con &next=/ruta/ y
 *     &auth_error=… para mostrar un aviso (lo usan el portal y la vuelta de Google).
 *
 * Si ya hay una sesión iniciada (cookie peru_auth), abrir el modal lleva
 * directo al portal.
 */
import { routes } from '@data/navigation';
import { withBase } from '@utils/url';
import {
	hasSession,
	isDemoAuth,
	resendAccessCode,
	startDemoGoogleAccess,
	startEmailAccess,
	verifyAccessCode,
	type AuthStep,
} from './auth-api';
import { initDialogs, openDialog } from './dialog';
import { ApiError } from './forms';

const DIALOG_ID = 'auth-modal';
const DEFAULT_STEP: AuthStep = 'login';

/** data-auth-view / ?login= → paso con el que se abre el modal */
const VIEWS: Record<string, AuthStep> = {
	login: 'login',
	'1': 'login',
	register: 'register-email',
};

/** Ruta del portal si el <dialog> no define data-auth-redirect */
const FALLBACK_REDIRECT = routes.portal;

/** Tiempo que se muestra la confirmación de "Volver a enviarlo" (ms) */
const RESEND_FEEDBACK_MS = 5000;

/** Avisos al volver de Google o del portal (?auth_error=…) */
const AUTH_ERRORS: Record<string, string> = {
	google: 'No pudimos iniciar sesión con Google. Inténtalo de nuevo o usa tu correo.',
	google_unavailable:
		'El inicio de sesión con Google no está disponible en este momento. Usa tu correo para continuar.',
	cancelled: 'Cancelaste el inicio de sesión con Google. Puedes intentarlo de nuevo o usar tu correo.',
	expired: 'El inicio de sesión tardó demasiado. Vuelve a intentarlo.',
	too_many: 'Hiciste demasiados intentos. Espera unos minutos y vuelve a probar.',
};

interface AuthState {
	email: string;
	name: string;
	/** Página a la que se vuelve al iniciar sesión */
	next: string;
}

interface ShowStepOptions {
	/** Mueve el foco al título del paso (por defecto sí) */
	focus?: boolean;
	/** Anuncia el paso en la región aria-live (por defecto sí) */
	announce?: boolean;
}

/** Solo rutas del propio sitio (evita redirecciones a otros dominios) */
function safePath(value: string | null | undefined, fallback: string): string {
	if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
	return value;
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
	const portalUrl = dialog.dataset.authRedirect || FALLBACK_REDIRECT;

	const state: AuthState = { email: '', name: '', next: portalUrl };
	const timers = new Set<number>();
	/** true mientras se abre desde la URL (?login=1): no se redirige aunque exista la cookie */
	let openedFromUrl = false;

	// ----------------------------------------------------------------------
	// Pasos
	// ----------------------------------------------------------------------

	function stepElement(step: AuthStep): HTMLElement | undefined {
		return steps.find((section) => section.dataset.authStep === step);
	}

	function showStep(step: AuthStep, { focus = true, announce = true }: ShowStepOptions = {}): void {
		const target = stepElement(step);
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

	/** Muestra (o limpia) el aviso de error de un paso */
	function setAlert(step: AuthStep | HTMLElement | null | undefined, message: string): void {
		const container = typeof step === 'string' ? stepElement(step) : step;
		const alert = container?.querySelector<HTMLElement>('[data-auth-alert]');
		if (alert) alert.textContent = message;
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

	function setBusy(form: HTMLFormElement, busy: boolean): void {
		form.toggleAttribute('aria-busy', busy);
		form.querySelectorAll<HTMLElement>('[type="submit"]').forEach((button) => {
			if (busy) button.setAttribute('aria-disabled', 'true');
			else button.removeAttribute('aria-disabled');
		});
	}

	/** Muestra un error de la API en su campo (si lo indica) o en el aviso del paso */
	function showApiError(form: HTMLFormElement, error: unknown): void {
		const message =
			error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Inténtalo de nuevo.';
		const field =
			error instanceof ApiError && error.field
				? form.querySelector<HTMLInputElement>(`input[name="${error.field}"]`)
				: null;

		if (field) {
			setError(field, message);
			field.focus();
		} else {
			setAlert(form.closest<HTMLElement>('[data-auth-step]'), message);
		}
	}

	async function handleSubmit(form: HTMLFormElement): Promise<void> {
		const step = form.dataset.authForm as AuthStep;
		const data = new FormData(form);
		const email = data.get('email');
		const name = data.get('name');
		if (typeof email === 'string') setEmail(email);
		if (typeof name === 'string') state.name = name.trim();

		setAlert(step, '');
		setBusy(form, true);

		try {
			switch (step) {
				case 'login-email':
				case 'register-email': {
					const result = await startEmailAccess({
						email: state.email,
						intent: step === 'login-email' ? 'login' : 'register',
						next: state.next,
					});
					showStep(result.next);
					break;
				}
				case 'register-name': {
					const result = await startEmailAccess({
						email: state.email,
						name: state.name,
						intent: 'register',
						next: state.next,
					});
					showStep(result.next);
					break;
				}
				case 'login-code':
				case 'register-code': {
					const result = await verifyAccessCode(String(data.get('code') ?? ''), state.next);
					window.location.assign(safePath(result.redirect, portalUrl));
					return; // se mantiene "ocupado" mientras carga el portal
				}
			}
		} catch (error) {
			showApiError(form, error);
		}

		setBusy(form, false);
	}

	forms.forEach((form) => {
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			if (form.hasAttribute('aria-busy') || !validateForm(form)) return;
			void handleSubmit(form);
		});
	});

	// "Usa tu cuenta de Google": el enlace lleva el destino final (next)
	const googleLinks = Array.from(dialog.querySelectorAll<HTMLAnchorElement>('a[data-auth-google]'));

	function updateGoogleLinks(): void {
		googleLinks.forEach((link) => {
			const url = new URL(
				link.getAttribute('href') ?? withBase('/api/auth/google/'),
				window.location.origin,
			);
			url.searchParams.set('next', state.next);
			link.href = `${url.pathname}${url.search}`;
		});
	}

	googleLinks.forEach((link) => {
		link.addEventListener('click', (event) => {
			link.setAttribute('aria-busy', 'true');
			// Versión estática: no hay servidor que hable con Google → demostración
			if (isDemoAuth) {
				event.preventDefault();
				startDemoGoogleAccess();
				window.location.assign(state.next);
			}
		});
	});

	// "¿No recibiste el código? Volver a enviarlo"
	dialog.querySelectorAll<HTMLButtonElement>('[data-auth-resend]').forEach((button) => {
		button.addEventListener('click', async () => {
			// Mientras se muestra la confirmación, no se reenvía otra vez
			if (button.getAttribute('aria-disabled') === 'true') return;

			const stepContainer = button.closest<HTMLElement>('[data-auth-step]');
			const status = stepContainer?.querySelector<HTMLElement>('[data-auth-status]');
			setAlert(stepContainer, '');
			button.setAttribute('aria-disabled', 'true');

			try {
				await resendAccessCode();
				if (status)
					status.textContent = (status.dataset.message ?? '').replace('{email}', state.email);
			} catch (error) {
				setAlert(
					stepContainer,
					error instanceof ApiError
						? error.message
						: 'No pudimos reenviar el código. Inténtalo de nuevo.',
				);
			}

			const timer = window.setTimeout(() => {
				if (status) status.textContent = '';
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

		forms.forEach((form) => {
			form.reset();
			setBusy(form, false);
		});
		dialog.querySelectorAll<HTMLInputElement>('input').forEach((input) => setError(input, ''));
		dialog.querySelectorAll<HTMLElement>('[data-auth-status], [data-auth-alert]').forEach((element) => {
			element.textContent = '';
		});
		dialog.querySelectorAll<HTMLElement>('[data-auth-resend]').forEach((button) => {
			button.removeAttribute('aria-disabled');
		});
		googleLinks.forEach((link) => link.removeAttribute('aria-busy'));
		if (announcer) announcer.textContent = '';

		state.name = '';
		state.next = portalUrl;
		setEmail('');
		showStep(DEFAULT_STEP, { focus: false, announce: false });
	}

	// Al abrir: paso según data-auth-view del botón que lo abrió y foco en el título
	dialog.addEventListener('dialog:open', (event) => {
		// Con sesión iniciada no hace falta el modal: directo al portal
		if (hasSession() && !openedFromUrl) {
			dialog.close();
			window.location.assign(state.next);
			return;
		}

		const trigger = (event as CustomEvent<{ trigger?: HTMLElement }>).detail?.trigger;
		const view = trigger?.closest<HTMLElement>('[data-auth-view]')?.dataset.authView ?? '';
		updateGoogleLinks();
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

	// ----------------------------------------------------------------------
	// Abrir desde la URL (?login=1&next=…&auth_error=…)
	// ----------------------------------------------------------------------

	const params = new URLSearchParams(window.location.search);
	const loginParam = params.get('login');
	if (loginParam !== null) {
		const errorMessage = AUTH_ERRORS[params.get('auth_error') ?? ''];
		const next = safePath(params.get('next'), portalUrl);

		// Limpia la URL para que recargar la página no vuelva a abrir el modal
		['login', 'next', 'auth_error'].forEach((key) => params.delete(key));
		const query = params.toString();
		window.history.replaceState(
			null,
			'',
			`${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
		);

		openedFromUrl = true;
		openDialog(DIALOG_ID);
		openedFromUrl = false;
		state.next = next;
		updateGoogleLinks();
		const step = VIEWS[loginParam] ?? DEFAULT_STEP;
		showStep(step, { announce: false });
		if (errorMessage) setAlert(step, errorMessage);
	}
}
