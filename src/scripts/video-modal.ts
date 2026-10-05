/**
 * Modal de video con mini reproductor
 * --------------------------------------------------------------------------
 * Marcado y estilos: src/components/overlays/VideoModal.astro.
 *
 * Cualquier elemento con data-video-open abre el video indicado en
 * data-video-youtube (código de YouTube), data-video-tiktok (número del video
 * de TikTok; se ve en vertical) o data-video-src (archivo propio).
 * Si no tiene una fuente válida, el enlace funciona como siempre (YouTube o
 * TikTok en una pestaña nueva).
 *
 *   ampliado ──(Seguir navegando / clic fuera)──► minimizado
 *       ▲                                            │
 *       └──────────────(Ampliar)─────────────────────┘
 *   (X o Esc: cerrar y detener el video)
 *
 * El reproductor nunca se mueve en el DOM al cambiar de estado (solo cambian
 * los estilos), así que el video sigue sin cortes al minimizar o ampliar.
 */

type VideoState = 'closed' | 'expanded' | 'mini';

const YOUTUBE_EMBED = 'https://www.youtube-nocookie.com/embed/';
/** Reproductor oficial de TikTok para insertar (https://developers.tiktok.com/doc/embed-player) */
const TIKTOK_EMBED = 'https://www.tiktok.com/player/v1/';

/** Duración de la animación de apertura (debe coincidir con el CSS) */
const ENTER_MS = 500;

export function initVideoModal(): void {
	const modal = document.querySelector<HTMLElement>('[data-video-modal]');
	if (!modal || modal.dataset.ready === 'true') return;
	modal.dataset.ready = 'true';

	// Directo en <body>: así el resto de la página se puede desactivar (inert)
	if (modal.parentElement !== document.body) document.body.append(modal);

	const windowElement = modal.querySelector<HTMLElement>('.video-modal__window');
	const frame = modal.querySelector<HTMLElement>('[data-video-frame]');
	const title = modal.querySelector<HTMLElement>('[data-video-title]');
	const minimizeButton = modal.querySelector<HTMLButtonElement>('button[data-video-minimize]');
	const expandButton = modal.querySelector<HTMLButtonElement>('[data-video-expand]');
	const closeButton = modal.querySelector<HTMLButtonElement>('[data-video-close]');
	const externalLink = modal.querySelector<HTMLAnchorElement>('[data-video-external]');
	if (!windowElement || !frame || !title || !minimizeButton || !expandButton || !closeButton) return;

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	/** Elementos que este script desactivó (se restauran al minimizar o cerrar) */
	const disabled = new Set<HTMLElement>();

	let state: VideoState = 'closed';
	let source = '';
	let trigger: HTMLElement | null = null;

	/** Con el video ampliado, el resto de la página no recibe foco ni clics */
	function setPageInert(inert: boolean): void {
		if (inert) {
			for (const element of Array.from(document.body.children)) {
				if (element === modal || !(element instanceof HTMLElement) || element.inert) continue;
				element.inert = true;
				disabled.add(element);
			}
		} else {
			disabled.forEach((element) => (element.inert = false));
			disabled.clear();
		}
	}

	function render(next: VideoState): void {
		state = next;
		modal!.dataset.state = next;
		modal!.hidden = next === 'closed';
		windowElement!.setAttribute('aria-modal', String(next === 'expanded'));
		minimizeButton!.hidden = next !== 'expanded';
		expandButton!.hidden = next !== 'mini';
		document.documentElement.classList.toggle('video-modal-open', next === 'expanded');
		setPageInert(next === 'expanded');
	}

	/**
	 * Cambia de estado; entre ampliado y minimizado la ventana se desliza
	 * (View Transitions). La promesa se cumple cuando el DOM ya cambió: el
	 * foco se mueve recién entonces (antes, los botones aún están ocultos).
	 */
	function setState(next: VideoState): Promise<void> {
		const morph =
			state !== 'closed' &&
			next !== 'closed' &&
			!reduceMotion.matches &&
			typeof document.startViewTransition === 'function';
		if (morph) {
			const transition = document.startViewTransition(() => render(next));
			// Si el navegador cancela la animación (pestaña oculta, cambio de tamaño…)
			// el cambio de estado igual se aplica: solo se ignora el aviso
			transition.ready.catch(() => {});
			transition.finished.catch(() => {});
			return transition.updateCallbackDone.catch(() => render(next));
		}
		render(next);
		return Promise.resolve();
	}

	function createPlayer(element: HTMLElement): HTMLElement | null {
		const { videoYoutube, videoTiktok, videoSrc, videoPoster } = element.dataset;
		const label = element.dataset.videoTitle ?? 'Video';

		if (videoTiktok && /^\d{8,25}$/.test(videoTiktok)) {
			const iframe = document.createElement('iframe');
			iframe.src = `${TIKTOK_EMBED}${videoTiktok}?autoplay=1&music_info=1&description=1&rel=0`;
			iframe.title = label;
			iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
			iframe.referrerPolicy = 'strict-origin-when-cross-origin';
			return iframe;
		}

		if (videoYoutube && /^[\w-]{11}$/.test(videoYoutube)) {
			const iframe = document.createElement('iframe');
			iframe.src = `${YOUTUBE_EMBED}${videoYoutube}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
			iframe.title = label;
			iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
			// YouTube exige el origen del sitio para reproducir videos insertados
			iframe.referrerPolicy = 'strict-origin-when-cross-origin';
			return iframe;
		}

		if (videoSrc) {
			const video = document.createElement('video');
			video.src = videoSrc;
			video.controls = true;
			video.autoplay = true;
			video.playsInline = true;
			if (videoPoster) video.poster = videoPoster;
			return video;
		}

		return null;
	}

	/** Abre (o vuelve a ampliar) el video del elemento. false = no tiene una fuente válida */
	function open(element: HTMLElement): boolean {
		const { videoYoutube, videoTiktok, videoSrc } = element.dataset;
		const key = videoYoutube || videoTiktok || videoSrc || '';
		if (key !== source) {
			const player = createPlayer(element);
			if (!player) return false;
			frame!.replaceChildren(player);
			source = key;
			// TikTok (y los videos marcados con data-video-ratio="portrait") se ven en vertical
			modal!.dataset.ratio =
				videoTiktok || element.dataset.videoRatio === 'portrait' ? 'portrait' : 'landscape';
			// Con TikTok, enlace para verlo allá (por si el navegador bloquea el reproductor insertado)
			if (externalLink) {
				const href = element instanceof HTMLAnchorElement ? element.href : '';
				externalLink.hidden = !(videoTiktok && href);
				if (href) externalLink.href = href;
			}
		}

		title!.textContent = element.dataset.videoTitle ?? 'Video';
		trigger = element;

		if (state === 'closed') {
			modal!.dataset.entering = '';
			window.setTimeout(() => delete modal!.dataset.entering, ENTER_MS);
		}
		void setState('expanded').then(() => minimizeButton!.focus({ preventScroll: true }));
		return true;
	}

	function close(): void {
		frame!.replaceChildren();
		source = '';
		render('closed');
		trigger?.focus({ preventScroll: true });
	}

	function minimize(): void {
		void setState('mini').then(() => expandButton!.focus({ preventScroll: true }));
	}

	function expand(): void {
		void setState('expanded').then(() => minimizeButton!.focus({ preventScroll: true }));
	}

	document.addEventListener('click', (event) => {
		const element = (event.target as Element | null)?.closest<HTMLElement>('[data-video-open]');
		if (!element || modal.contains(element)) return;
		if (open(element)) event.preventDefault();
	});

	modal.addEventListener('click', (event) => {
		const target = event.target as Element;
		if (target.closest('[data-video-close]')) close();
		else if (target.closest('[data-video-expand]')) expand();
		else if (target.closest('[data-video-minimize]')) minimize();
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && state === 'expanded') {
			event.preventDefault();
			close();
		}
	});
}
