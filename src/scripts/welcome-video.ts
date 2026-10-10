/**
 * Video de bienvenida del Home
 * --------------------------------------------------------------------------
 * Marcado y estilos: src/components/overlays/WelcomeVideo.astro (<dialog>).
 *
 * - Se abre solo al entrar al Home, una vez por sesión del navegador
 *   (sessionStorage). No se abre si la página trae un ancla (#…) o el inicio
 *   de sesión (?login=…), ni si ya hay otro modal abierto.
 * - El reproductor de YouTube se carga recién al pulsar ▶ (la página carga
 *   más rápido y el video suena porque lo inicia la persona).
 * - Al terminar el video aparece el botón "Reserva una llamada gratis". El
 *   final se detecta con los mensajes del reproductor (enablejsapi=1), sin
 *   cargar la API completa de YouTube.
 * - Al cerrar el modal se quita el reproductor (el video se detiene).
 */
import { initDialogs, openDialog } from './dialog';

const SEEN_KEY = 'peru-welcome-video';
const YOUTUBE_EMBED = 'https://www.youtube-nocookie.com/embed/';
/** Espera después de cargar la página antes de abrir el modal (se ve el hero) */
const OPEN_DELAY = 1200;
/** Estado "terminado" del reproductor de YouTube */
const YOUTUBE_ENDED = 0;

export function initWelcomeVideo(): void {
	const dialog = document.querySelector<HTMLDialogElement>('dialog[data-welcome-video]');
	const frame = dialog?.querySelector<HTMLElement>('[data-welcome-frame]');
	const poster = dialog?.querySelector<HTMLButtonElement>('[data-welcome-play]');
	const hint = dialog?.querySelector<HTMLElement>('[data-welcome-hint]');
	const cta = dialog?.querySelector<HTMLElement>('[data-welcome-cta]');
	const youtubeId = dialog?.dataset.youtube ?? '';
	if (!dialog || !frame || !poster || !cta || !/^[\w-]{11}$/.test(youtubeId)) return;

	initDialogs();
	let stopWatching: (() => void) | null = null;

	const showCta = () => {
		if (!cta.hidden) return;
		cta.hidden = false;
		if (hint) hint.hidden = true;
		dialog.classList.add('is-ended');
	};

	poster.addEventListener('click', () => {
		const params = new URLSearchParams({
			autoplay: '1',
			rel: '0',
			playsinline: '1',
			modestbranding: '1',
			enablejsapi: '1',
			origin: window.location.origin,
		});
		const iframe = document.createElement('iframe');
		iframe.src = `${YOUTUBE_EMBED}${youtubeId}?${params}`;
		iframe.title = dialog.dataset.title ?? 'Video';
		iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
		// YouTube exige el origen del sitio para reproducir videos insertados
		iframe.referrerPolicy = 'strict-origin-when-cross-origin';
		iframe.className = 'welcome-video__player';
		stopWatching = onYouTubeEnd(iframe, showCta);
		frame.replaceChildren(iframe);
	});

	// Al cerrar, el video se detiene y vuelve la portada (el botón, si ya apareció, queda)
	dialog.addEventListener('close', () => {
		stopWatching?.();
		stopWatching = null;
		frame.replaceChildren(poster);
	});

	if (!shouldOpen()) return;
	const openLater = () =>
		window.setTimeout(() => {
			// Otro modal abierto (inicio de sesión, menú…): no se interrumpe
			if (document.querySelector('dialog[open]')) return;
			markSeen();
			openDialog(dialog.id);
		}, OPEN_DELAY);
	if (document.readyState === 'complete') openLater();
	else window.addEventListener('load', openLater, { once: true });
}

/** Primera visita al Home en esta sesión, sin ancla ni inicio de sesión en la URL */
function shouldOpen(): boolean {
	const url = new URL(window.location.href);
	if (url.hash || url.searchParams.has('login')) return false;
	try {
		return sessionStorage.getItem(SEEN_KEY) !== 'seen';
	} catch {
		return true;
	}
}

function markSeen(): void {
	try {
		sessionStorage.setItem(SEEN_KEY, 'seen');
	} catch {
		// Sin almacenamiento (modo privado estricto): se abrirá en cada visita
	}
}

/**
 * Avisa cuando termina un video de YouTube insertado, con los mensajes del
 * reproductor (el iframe debe llevar enablejsapi=1 y origin). Devuelve una
 * función para dejar de escuchar.
 */
function onYouTubeEnd(iframe: HTMLIFrameElement, onEnd: () => void): () => void {
	const playerOrigin = new URL(iframe.src).origin;
	const post = (message: Record<string, unknown>) =>
		iframe.contentWindow?.postMessage(
			JSON.stringify({ ...message, id: 'welcome-video', channel: 'widget' }),
			playerOrigin,
		);
	// Pide al reproductor que avise sus cambios de estado
	const subscribe = () => {
		post({ event: 'listening' });
		post({ event: 'command', func: 'addEventListener', args: ['onStateChange'] });
	};

	// Si el reproductor tarda en responder, se insiste unos segundos
	let answered = false;
	let tries = 0;
	const retry = window.setInterval(() => {
		if (answered || ++tries > 15) window.clearInterval(retry);
		else subscribe();
	}, 1000);

	const handleMessage = (event: MessageEvent) => {
		if (event.origin !== playerOrigin || event.source !== iframe.contentWindow) return;
		let data: { event?: string; info?: unknown };
		try {
			data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
		} catch {
			return;
		}
		answered = true;
		const state =
			data?.event === 'onStateChange'
				? data.info
				: data?.event === 'infoDelivery'
					? (data.info as { playerState?: number } | null)?.playerState
					: undefined;
		if (state === YOUTUBE_ENDED) onEnd();
	};

	window.addEventListener('message', handleMessage);
	iframe.addEventListener('load', subscribe);

	return () => {
		window.clearInterval(retry);
		window.removeEventListener('message', handleMessage);
	};
}
