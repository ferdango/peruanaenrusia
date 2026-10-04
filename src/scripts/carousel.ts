/**
 * Carrusel
 * --------------------------------------------------------------------------
 * Da vida a los componentes <Carousel> (src/components/ui/Carousel.astro):
 *   - Flechas "anterior / siguiente".
 *   - Puntos de navegación (uno por cada posición posible de desplazamiento).
 *   - Deshabilita las flechas al inicio y al final.
 *   - Oculta los controles si todas las tarjetas caben en pantalla.
 *
 * El desplazamiento es nativo (scroll + scroll-snap), así que también funciona
 * con gestos táctiles, trackpad y teclado.
 */

const INITIALIZED = 'carouselReady';

export function initCarousels(root: ParentNode = document): void {
	root.querySelectorAll<HTMLElement>('[data-carousel]').forEach((carousel) => {
		if (carousel.dataset[INITIALIZED]) return;
		carousel.dataset[INITIALIZED] = 'true';
		setupCarousel(carousel);
	});
}

function setupCarousel(carousel: HTMLElement): void {
	const track = carousel.querySelector<HTMLElement>('[data-carousel-track]');
	const controls = carousel.querySelector<HTMLElement>('[data-carousel-controls]');
	const prevButton = carousel.querySelector<HTMLButtonElement>('[data-carousel-prev]');
	const nextButton = carousel.querySelector<HTMLButtonElement>('[data-carousel-next]');
	const dotsContainer = carousel.querySelector<HTMLElement>('[data-carousel-dots]');

	if (!track) return;

	/** Posiciones (en px) a las que puede desplazarse el carrusel */
	let positions: number[] = [];
	let activeIndex = 0;

	/** Calcula las posiciones de desplazamiento a partir de cada tarjeta */
	function computePositions(): void {
		const slides = Array.from(track!.children) as HTMLElement[];
		const maxScroll = track!.scrollWidth - track!.clientWidth;
		const paddingStart = parseFloat(getComputedStyle(track!).paddingInlineStart) || 0;

		const raw = slides.map((slide) => Math.min(Math.max(slide.offsetLeft - paddingStart, 0), maxScroll));
		// Quitamos posiciones repetidas (las últimas tarjetas comparten el "final")
		positions = raw.filter((value, index) => index === 0 || Math.abs(value - raw[index - 1]) > 2);
	}

	/** Dibuja un punto por cada posición */
	function renderDots(): void {
		if (!dotsContainer) return;
		dotsContainer.replaceChildren(
			...positions.map((_, index) => {
				const dot = document.createElement('button');
				dot.type = 'button';
				dot.className = 'carousel__dot';
				dot.setAttribute('aria-label', `Ir a la posición ${index + 1} de ${positions.length}`);
				dot.addEventListener('click', () => goTo(index));
				return dot;
			}),
		);
	}

	/** Actualiza el punto activo y el estado de las flechas */
	function updateState(): void {
		const current = track!.scrollLeft;
		activeIndex = positions.reduce(
			(closest, position, index) =>
				Math.abs(position - current) < Math.abs(positions[closest] - current) ? index : closest,
			0,
		);

		dotsContainer?.querySelectorAll('.carousel__dot').forEach((dot, index) => {
			dot.setAttribute('aria-current', String(index === activeIndex));
		});

		if (prevButton) prevButton.disabled = activeIndex === 0;
		if (nextButton) nextButton.disabled = activeIndex === positions.length - 1;
	}

	function goTo(index: number): void {
		const target = positions[Math.max(0, Math.min(index, positions.length - 1))];
		track!.scrollTo({ left: target, behavior: 'smooth' });
	}

	function refresh(): void {
		computePositions();
		renderDots();
		if (controls) controls.hidden = positions.length <= 1;
		updateState();
	}

	prevButton?.addEventListener('click', () => goTo(activeIndex - 1));
	nextButton?.addEventListener('click', () => goTo(activeIndex + 1));

	// Actualiza el estado al desplazar (una vez por frame)
	let ticking = false;
	track.addEventListener(
		'scroll',
		() => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				updateState();
				ticking = false;
			});
		},
		{ passive: true },
	);

	// Recalcula si cambia el tamaño de la pantalla o del carrusel
	new ResizeObserver(refresh).observe(track);
	refresh();
}
