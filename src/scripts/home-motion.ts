/**
 * Movimiento de la portada (solo Home)
 * --------------------------------------------------------------------------
 * Da vida al Home sin librerías externas:
 *
 *   1. (El header transparente sobre el hero es solo CSS: src/styles/home.css.)
 *   2. Hero: parallax con el puntero (--px / --py) y con el scroll (--hero-scroll).
 *   3. Apariciones al hacer scroll (REVEALS): títulos palabra por palabra,
 *      textos y tarjetas que entran en cascada.
 *   4. Parallax de decorados (PARALLAX): ondas a distinta velocidad.
 *   5. Tarjetas con inclinación 3D y brillo que sigue al cursor (TILT).
 *   6. Botones "magnéticos" (atributo data-magnetic).
 *   7. Franjas de lemas empujadas por el scroll (--marquee-shift).
 *   8. Sliders que avanzan con el scroll (data-scroll-slider): "¿Qué tengo que
 *      hacer?" pasa las tarjetas una por una y "¿Por qué elegir…?" las desliza.
 *
 * Todo se configura en las listas de abajo (selectores de cada sección), sin
 * tocar los componentes. Estilos: src/styles/home.css.
 *
 * Accesibilidad y rendimiento:
 *   - Con "reducir movimiento" no se activa nada: el contenido se ve completo y
 *     quieto.
 *   - Sin JavaScript nada queda oculto: los estados iniciales dependen de la
 *     clase .reveal-ready que agrega este script.
 *   - Solo se animan transform/opacity/clip-path; el scroll pasa por
 *     requestAnimationFrame y IntersectionObserver evita trabajar con lo que no
 *     está en pantalla.
 *   - Inclinación e imán solo con mouse (no en pantallas táctiles).
 */

type RevealEffect = 'up' | 'fade' | 'left' | 'scale' | 'pop' | 'clip' | 'words';

interface RevealRule {
	selector: string;
	effect: RevealEffect;
	/** Retraso fijo (ms) */
	delay?: number;
	/** Retraso entre elementos que aparecen juntos (ms): efecto cascada */
	stagger?: number;
}

/* ==========================================================================
   Coreografía de cada sección (en orden de aparición)
   ========================================================================== */

const REVEALS: RevealRule[] = [
	// Te acompañamos en cada paso
	{ selector: '.home-intro__title', effect: 'words' },
	{ selector: '.home-intro__text', effect: 'up', delay: 150 },
	{ selector: '.intro-video', effect: 'clip', delay: 150 },
	// Soy Grecia Kristal
	{ selector: '.founder-photo', effect: 'up', stagger: 160 },
	{ selector: '.home-founder__star', effect: 'pop', delay: 200 },
	{ selector: '.home-founder__title', effect: 'words' },
	{ selector: '.home-founder__text > p', effect: 'up', stagger: 120, delay: 200 },
	// ¿Por qué elegir Peruana en Rusia?
	{ selector: '.home-why__title', effect: 'words' },
	{ selector: '.home-why__avatars > li', effect: 'pop', stagger: 70, delay: 250 },
	{ selector: '.home-why__proof-text', effect: 'fade', delay: 450 },
	{ selector: '.benefit-card', effect: 'up', stagger: 110 },
	// ¿Qué tengo que hacer?
	{ selector: '.home-steps__title', effect: 'words' },
	{ selector: '.home-steps__text', effect: 'up', delay: 150 },
	{ selector: '.step-card', effect: 'up', stagger: 110 },
	// ¿Quieres iniciar tu proceso ahora?
	{ selector: '.start-cta__title', effect: 'words' },
	{ selector: '.start-cta__text', effect: 'up', delay: 150 },
	{ selector: '.start-cta__button', effect: 'up', delay: 260 },
	{ selector: '.start-cta__person', effect: 'up', stagger: 180 },
	// Universidades destacadas
	{ selector: '.home-universities__title', effect: 'words' },
	{ selector: '.home-universities__subtitle', effect: 'up', delay: 150 },
	{ selector: '.university-card', effect: 'up', stagger: 110 },
	// Reserva tu llamada / Resuelve tus dudas
	{ selector: '.contact-split__panel', effect: 'left' },
	{ selector: '.contact-split__media', effect: 'scale', delay: 120 },
	// Casos de éxito
	{ selector: '.home-cases__title', effect: 'words' },
	{ selector: '.home-cases__subtitle', effect: 'up', delay: 150 },
	{ selector: '.testimonial-card', effect: 'scale', stagger: 80 },
	// Comunidad
	{ selector: '.home-community__title', effect: 'words' },
	{ selector: '.community-photo', effect: 'clip', stagger: 90 },
	{ selector: '.home-gallery__title', effect: 'words' },
	{ selector: '.gallery-photo', effect: 'up', stagger: 100 },
	// Más historias
	{ selector: '.home-stories__title', effect: 'words' },
	{ selector: '.video-card', effect: 'up', stagger: 100 },
	// Preguntas frecuentes
	{ selector: '.home-faq__title', effect: 'words' },
	{ selector: '.faq-video', effect: 'up', delay: 150 },
	{ selector: '.faq-item', effect: 'up', stagger: 80 },
	// Flechas y puntos de todos los carruseles
	{ selector: '#contenido .carousel__controls', effect: 'fade', delay: 250 },
];

/** Desplazamiento máximo de los decorados (px): nunca se alejan de su sitio en el diseño */
const PARALLAX_MAX = 48;

/** Decorados que se desplazan más lento o más rápido que el scroll (velocidad) */
const PARALLAX: { selector: string; speed: number }[] = [
	{ selector: '.home-founder__decor', speed: 0.12 },
	{ selector: '.start-cta__waves', speed: 0.08 },
	{ selector: '.home-universities__wave--orange', speed: 0.16 },
	{ selector: '.home-universities__wave--blue', speed: -0.1 },
	{ selector: '.home-faq__wave--red', speed: 0.12 },
	{ selector: '.home-faq__wave--blue', speed: -0.08 },
];

/** Tarjetas con inclinación 3D y brillo */
const TILT = [
	'.intro-video',
	'.benefit-card',
	'.step-card__inner',
	'.university-card',
	'.testimonial-card',
	'.community-photo',
	'.gallery-photo',
	'.video-card',
].join(', ');

/* ==========================================================================
   Scroll compartido (una sola escucha, sincronizada con el refresco)
   ========================================================================== */

const scrollTasks: (() => void)[] = [];
let scrollQueued = false;

function onScroll(task: () => void): void {
	scrollTasks.push(task);
	if (scrollTasks.length === 1) {
		const run = () => {
			scrollQueued = false;
			scrollTasks.forEach((scrollTask) => scrollTask());
		};
		const queue = () => {
			if (scrollQueued) return;
			scrollQueued = true;
			window.requestAnimationFrame(run);
		};
		window.addEventListener('scroll', queue, { passive: true });
		window.addEventListener('resize', queue, { passive: true });
	}
	task();
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/* ==========================================================================
   2. Hero
   ========================================================================== */

function initHero(finePointer: boolean): void {
	const hero = document.querySelector<HTMLElement>('[data-hero]');
	const scene = hero?.querySelector<HTMLElement>('[data-hero-scene]');
	if (!hero || !scene) return;

	// Scroll: 0 arriba → 1 cuando el hero ya salió de la pantalla
	let heroVisible = true;
	new IntersectionObserver(([entry]) => {
		heroVisible = entry.isIntersecting;
	}).observe(hero);

	onScroll(() => {
		if (!heroVisible) return;
		const progress = clamp(window.scrollY / (hero.offsetHeight * 0.85), 0, 1);
		hero.style.setProperty('--hero-scroll', progress.toFixed(3));
	});

	if (!finePointer) return;

	// Puntero: cada capa se desplaza según su profundidad (movimiento suavizado)
	let targetX = 0;
	let targetY = 0;
	let x = 0;
	let y = 0;
	let frame = 0;

	const animate = () => {
		x += (targetX - x) * 0.08;
		y += (targetY - y) * 0.08;
		scene.style.setProperty('--px', x.toFixed(2));
		scene.style.setProperty('--py', y.toFixed(2));
		const moving = Math.abs(targetX - x) > 0.05 || Math.abs(targetY - y) > 0.05;
		frame = moving ? window.requestAnimationFrame(animate) : 0;
	};

	const queue = () => {
		if (!frame) frame = window.requestAnimationFrame(animate);
	};

	hero.addEventListener('pointermove', (event) => {
		if (event.pointerType !== 'mouse') return;
		targetX = (event.clientX / window.innerWidth - 0.5) * 36;
		targetY = (event.clientY / window.innerHeight - 0.5) * 24;
		queue();
	});

	hero.addEventListener('pointerleave', () => {
		targetX = 0;
		targetY = 0;
		queue();
	});
}

/* ==========================================================================
   3. Apariciones al hacer scroll
   ========================================================================== */

/**
 * Envuelve cada palabra del título en <span> para animarlas una por una.
 * El título conserva su texto completo en aria-label (los lectores de
 * pantalla lo leen de corrido) y las palabras sueltas se ocultan para ellos.
 */
function splitWords(element: HTMLElement): void {
	const text = element.textContent?.replace(/\s+/g, ' ').trim();
	if (!text || element.dataset.split === 'true') return;
	element.dataset.split = 'true';
	element.setAttribute('aria-label', text);

	let index = 0;
	Array.from(element.childNodes).forEach((node) => {
		if (node.nodeType === Node.TEXT_NODE) {
			const fragment = document.createDocumentFragment();
			for (const part of (node.textContent ?? '').split(/(\s+)/)) {
				if (!part) continue;
				if (/^\s+$/.test(part)) {
					fragment.append(' ');
					continue;
				}
				const word = document.createElement('span');
				word.className = 'reveal-word';
				word.setAttribute('aria-hidden', 'true');
				const inner = document.createElement('span');
				inner.className = 'reveal-word__inner';
				inner.style.setProperty('--w', String(index++));
				inner.textContent = part;
				word.append(inner);
				fragment.append(word);
			}
			node.replaceWith(fragment);
		} else if (node instanceof HTMLElement && node.tagName !== 'BR') {
			// Elementos internos (ej. textos alternativos de móvil): se animan como una palabra
			node.setAttribute('aria-hidden', 'true');
			node.classList.add('reveal-word__inner');
			node.style.setProperty('--w', String(index++));
		}
	});
}

function initReveals(): void {
	const viewportHeight = window.innerHeight;
	const pending: HTMLElement[] = [];

	REVEALS.forEach((rule, group) => {
		document.querySelectorAll<HTMLElement>(rule.selector).forEach((element) => {
			if (element.dataset.reveal) return;

			// Lo que ya está en pantalla al cargar se deja como está (sin parpadeos)
			const rect = element.getBoundingClientRect();
			if (rect.width > 0 && rect.top < viewportHeight && rect.bottom > 0) return;

			if (rule.effect === 'words') splitWords(element);
			element.dataset.reveal = rule.effect;
			element.dataset.revealGroup = String(group);
			if (rule.delay) element.dataset.revealDelay = String(rule.delay);
			if (rule.stagger) element.dataset.revealStagger = String(rule.stagger);
			pending.push(element);
		});
	});

	document.documentElement.classList.add('reveal-ready');

	const observer = new IntersectionObserver(
		(entries) => {
			const visible = entries
				.filter((entry) => entry.isIntersecting)
				.map((entry) => ({ element: entry.target as HTMLElement, rect: entry.boundingClientRect }))
				// Cascada en orden de lectura: arriba → abajo, izquierda → derecha
				.sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left);

			const order = new Map<string, number>();
			for (const { element } of visible) {
				const group = element.dataset.revealGroup ?? '';
				const position = order.get(group) ?? 0;
				order.set(group, position + 1);

				const delay =
					Number(element.dataset.revealDelay ?? 0) +
					position * Number(element.dataset.revealStagger ?? 0);
				element.style.setProperty('--reveal-delay', `${delay}ms`);
				element.classList.add('is-revealed');
				observer.unobserve(element);
			}
		},
		{ rootMargin: '0px 0px -8% 0px', threshold: 0.15 },
	);

	pending.forEach((element) => observer.observe(element));
}

/* ==========================================================================
   4. Parallax de decorados
   ========================================================================== */

function initParallax(): void {
	const items = PARALLAX.flatMap(({ selector, speed }) =>
		Array.from(document.querySelectorAll<HTMLElement>(selector), (element) => ({
			element,
			speed,
			offset: 0,
		})),
	);
	if (items.length === 0) return;

	const visible = new Set<(typeof items)[number]>();
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const item = items.find(({ element }) => element === entry.target);
				if (!item) continue;
				if (entry.isIntersecting) visible.add(item);
				else visible.delete(item);
			}
		},
		{ rootMargin: '25% 0px' },
	);

	items.forEach((item) => {
		item.element.dataset.parallax = '';
		observer.observe(item.element);
	});

	onScroll(() => {
		const center = window.innerHeight / 2;
		for (const item of visible) {
			const rect = item.element.getBoundingClientRect();
			// Se descuenta el desplazamiento ya aplicado (evita que el cálculo "rebote")
			const distance = rect.top - item.offset + rect.height / 2 - center;
			item.offset = clamp(-distance * item.speed, -PARALLAX_MAX, PARALLAX_MAX);
			item.element.style.setProperty('--parallax', `${item.offset.toFixed(1)}px`);
		}
	});
}

/* ==========================================================================
   5. Tarjetas con inclinación 3D y brillo
   ========================================================================== */

function initTilt(): void {
	document.querySelectorAll<HTMLElement>(TILT).forEach((card) => {
		if (card.dataset.tilt !== undefined) return;
		card.dataset.tilt = '';

		const glare = document.createElement('span');
		glare.className = 'tilt-glare';
		glare.setAttribute('aria-hidden', 'true');
		card.append(glare);
		if (getComputedStyle(card).position === 'static') card.style.position = 'relative';

		let frame = 0;

		card.addEventListener('pointermove', (event) => {
			if (event.pointerType !== 'mouse') return;
			const rect = card.getBoundingClientRect();
			const x = (event.clientX - rect.left) / rect.width;
			const y = (event.clientY - rect.top) / rect.height;
			// Las tarjetas grandes se inclinan menos
			const strength = Math.min(1, 420 / rect.width);

			window.cancelAnimationFrame(frame);
			frame = window.requestAnimationFrame(() => {
				card.classList.add('is-tilting');
				card.style.setProperty('--tilt-x', `${((0.5 - y) * 10 * strength).toFixed(2)}deg`);
				card.style.setProperty('--tilt-y', `${((x - 0.5) * 12 * strength).toFixed(2)}deg`);
				card.style.setProperty('--glare-x', `${(x * 100).toFixed(1)}%`);
				card.style.setProperty('--glare-y', `${(y * 100).toFixed(1)}%`);
			});
		});

		card.addEventListener('pointerleave', () => {
			window.cancelAnimationFrame(frame);
			card.classList.remove('is-tilting');
			card.style.removeProperty('--tilt-x');
			card.style.removeProperty('--tilt-y');
		});
	});
}

/* ==========================================================================
   6. Botones magnéticos
   ========================================================================== */

function initMagnetic(): void {
	document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((element) => {
		element.addEventListener('pointermove', (event) => {
			if (event.pointerType !== 'mouse') return;
			const rect = element.getBoundingClientRect();
			const x = event.clientX - (rect.left + rect.width / 2);
			const y = event.clientY - (rect.top + rect.height / 2);
			element.style.setProperty('--magnet-x', `${(x * 0.22).toFixed(1)}px`);
			element.style.setProperty('--magnet-y', `${(y * 0.3).toFixed(1)}px`);
		});

		element.addEventListener('pointerleave', () => {
			element.style.removeProperty('--magnet-x');
			element.style.removeProperty('--magnet-y');
		});
	});
}

/* ==========================================================================
   7. Franjas de lemas
   ========================================================================== */

function initMarquee(): void {
	const marquee = document.querySelector<HTMLElement>('[data-marquee]');
	if (!marquee) return;

	onScroll(() => {
		const rect = marquee.getBoundingClientRect();
		if (rect.bottom < 0 || rect.top > window.innerHeight) return;
		// 0 cuando entra por abajo → 1 cuando sale por arriba
		const progress = clamp(1 - (rect.top + rect.height / 2) / window.innerHeight, 0, 1);
		const maxShift = Math.min(140, window.innerWidth * 0.2);
		marquee.style.setProperty('--marquee-shift', ((progress - 0.5) * 2 * maxShift).toFixed(1));
	});
}

/* ==========================================================================
   8. Sliders que avanzan con el scroll (data-scroll-slider)
   --------------------------------------------------------------------------
   Marcado: [data-scroll-slider="pin" | "drift"] › [data-slider-viewport] ›
   [data-slider-track] › [data-slider-item]… (+ [data-slider-bar] y
   [data-slider-current], opcionales). Los estilos viven en cada sección.

     pin   → la sección queda fija y el scroll vertical pasa las tarjetas una
             por una: cada una se detiene un momento antes de dar paso a la
             siguiente ("¿Qué tengo que hacer?").
     drift → sin fijar: la fila se desliza mientras la sección cruza la
             pantalla ("¿Por qué elegir…?").

   Solo se activa (clase .is-scroll-slider) si las tarjetas no caben en el
   ancho disponible; si no, quedan quietas.
   ========================================================================== */

interface ScrollSlider {
	section: HTMLElement;
	mode: 'pin' | 'drift';
	viewport: HTMLElement;
	track: HTMLElement;
	items: HTMLElement[];
	bar: HTMLElement | null;
	current: HTMLElement | null;
	/** Desplazamiento del riel en el que cada tarjeta queda en su lugar (px) */
	stops: number[];
	/** Cuánto sobra el riel respecto del ancho visible (px) */
	maxShift: number;
	/** Recorrido de scroll mientras la sección está fija (px, solo "pin") */
	length: number;
	active: number;
}

/** Fracción de cada tramo en que la tarjeta queda quieta antes y después de moverse */
const SLIDER_HOLD = 0.18;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function initScrollSliders(): void {
	const sliders: ScrollSlider[] = [];

	document.querySelectorAll<HTMLElement>('[data-scroll-slider]').forEach((section) => {
		const viewport = section.querySelector<HTMLElement>('[data-slider-viewport]');
		const track = section.querySelector<HTMLElement>('[data-slider-track]');
		const items = Array.from(section.querySelectorAll<HTMLElement>('[data-slider-item]'));
		if (!viewport || !track || items.length < 2) return;
		sliders.push({
			section,
			mode: section.dataset.scrollSlider === 'pin' ? 'pin' : 'drift',
			viewport,
			track,
			items,
			bar: section.querySelector<HTMLElement>('[data-slider-bar]'),
			current: section.querySelector<HTMLElement>('[data-slider-current]'),
			stops: [],
			maxShift: 0,
			length: 0,
			active: -1,
		});
	});
	if (sliders.length === 0) return;

	const header = document.querySelector<HTMLElement>('.site-header');

	/** Medidas (se repiten al cambiar el tamaño de la ventana) */
	const measure = () => {
		for (const slider of sliders) {
			const { section, viewport, track, items } = slider;
			// offsetWidth/offsetLeft no cambian con transform: medidas estables
			const paddingLeft = parseFloat(getComputedStyle(viewport).paddingLeft) || 0;
			slider.maxShift = Math.max(0, paddingLeft + track.offsetWidth - viewport.clientWidth);
			const first = items[0].offsetLeft;
			slider.stops = items.map((item) => Math.min(item.offsetLeft - first, slider.maxShift));

			const enabled = slider.maxShift > 1;
			section.classList.toggle('is-scroll-slider', enabled);
			if (slider.mode === 'pin') {
				const step = clamp(window.innerHeight * 0.45, 260, 460);
				slider.length = enabled ? (items.length - 1) * step : 0;
				section.style.setProperty('--slider-length', `${Math.round(slider.length)}px`);
			}
		}
	};

	const update = () => {
		const viewportHeight = window.innerHeight;
		const headerOffset = header?.offsetHeight ?? 0;

		for (const slider of sliders) {
			if (slider.maxShift <= 1) continue;
			const rect = slider.section.getBoundingClientRect();
			if (rect.bottom < 0 || rect.top > viewportHeight) continue;

			const last = slider.items.length - 1;
			let shift: number;
			let progress: number;
			let active: number;

			if (slider.mode === 'pin') {
				// 0 cuando la sección llega bajo el header → 1 al terminar el recorrido
				progress = slider.length ? clamp((headerOffset - rect.top) / slider.length, 0, 1) : 0;
				const position = progress * last;
				const index = Math.min(Math.floor(position), last - 1);
				// Pausa al inicio y al final de cada tramo: "una por una"
				const local = clamp((position - index - SLIDER_HOLD) / (1 - 2 * SLIDER_HOLD), 0, 1);
				const from = slider.stops[index];
				shift = from + (slider.stops[index + 1] - from) * easeInOutCubic(local);
				active = Math.round(position);
			} else {
				// 0 cuando la sección asoma por abajo → 1 cuando sale por arriba
				const travel = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);
				progress = clamp((travel - 0.2) / 0.55, 0, 1);
				shift = easeInOutCubic(progress) * slider.maxShift;
				active = slider.stops.reduce(
					(best, stop, index) =>
						Math.abs(stop - shift) < Math.abs(slider.stops[best] - shift) ? index : best,
					0,
				);
			}

			slider.track.style.setProperty('--slider-x', `${(-shift).toFixed(1)}px`);
			slider.bar?.style.setProperty('--slider-progress', progress.toFixed(3));

			if (active !== slider.active) {
				slider.active = active;
				slider.items.forEach((item, index) => item.classList.toggle('is-active', index === active));
				if (slider.current) slider.current.textContent = String(active + 1).padStart(2, '0');
			}
		}
	};

	measure();
	onScroll(update);

	const refresh = () => {
		measure();
		update();
	};
	window.addEventListener('resize', refresh, { passive: true });
	window.addEventListener('load', refresh, { once: true });
}

/* ==========================================================================
   Inicio
   ========================================================================== */

export function initHomeMotion(): void {
	const root = document.documentElement;
	if (root.dataset.homeMotion === 'ready') return;
	root.dataset.homeMotion = 'ready';

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	initHero(finePointer);
	initMarquee();
	initReveals();
	initScrollSliders();
	initParallax();
	if (finePointer) {
		initTilt();
		initMagnetic();
	}
}
