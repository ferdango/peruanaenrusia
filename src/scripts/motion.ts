/**
 * Movimiento de las páginas inmersivas (Home y Blog)
 * --------------------------------------------------------------------------
 * Da vida a las páginas con body.motion sin librerías externas (cada regla
 * actúa solo si encuentra sus elementos en la página):
 *
 *   1. (El header transparente sobre el hero es solo CSS: src/styles/motion.css,
 *      con body.hero-overlay.)
 *   2. Hero: parallax con el puntero (--px / --py) y con el scroll (--hero-scroll).
 *   3. Apariciones al hacer scroll (REVEALS): títulos palabra por palabra,
 *      textos y tarjetas que entran en cascada.
 *   4. Parallax (PARALLAX): ondas, el tubo degradé y las tarjetas de "¿Por qué
 *      elegir…?" (en desktop) a distinta velocidad.
 *   5. Tarjetas con inclinación 3D y brillo que sigue al cursor (TILT).
 *   6. Botones "magnéticos" (atributo data-magnetic).
 *   7. Franjas de lemas empujadas por el scroll (--marquee-shift).
 *   8. Sliders que avanzan con el scroll (data-scroll-slider): "¿Qué tengo que
 *      hacer?" pasa las tarjetas una por una; "¿Por qué elegir…?", "Redes
 *      sociales" y "Universidades" (en móvil) las deslizan.
 *   9. "Soy Grecia Kristal": las fotos suben y se apilan; después, el texto.
 *  10. "Universidades destacadas" (desktop): el panel abierto avanza con el
 *      scroll.
 *
 * Todo se configura en las listas de abajo (selectores de cada sección), sin
 * tocar los componentes. Estilos: src/styles/motion.css.
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
	/** Solo se aplica si se cumple esta media query (al cargar la página) */
	media?: string;
}

/** Desktop con altura suficiente: "Soy Grecia Kristal" queda fija mientras se apilan las fotos */
const FOUNDER_PIN = '(min-width: 1101px) and (min-height: 700px)';
/** Lo contrario: la sección no se fija y el texto aparece al llegar */
const FOUNDER_FLOW = `not all and ${FOUNDER_PIN}`;

/* ==========================================================================
   Coreografía de cada sección (en orden de aparición)
   ========================================================================== */

const REVEALS: RevealRule[] = [
	// Te acompañamos en cada paso
	{ selector: '.home-intro__title', effect: 'words' },
	{ selector: '.home-intro__text', effect: 'up', delay: 150 },
	{ selector: '.intro-video', effect: 'clip', delay: 150 },
	// Soy Grecia Kristal (las fotos y, en desktop, el texto los mueve initFounderStack)
	{ selector: '.home-founder__eyebrow', effect: 'up', media: FOUNDER_FLOW },
	{ selector: '.home-founder__title', effect: 'words', delay: 80, media: FOUNDER_FLOW },
	{ selector: '.home-founder__text > p', effect: 'up', stagger: 120, delay: 200, media: FOUNDER_FLOW },
	{ selector: '.home-founder__fact', effect: 'up', stagger: 90, delay: 300, media: FOUNDER_FLOW },
	// ¿Por qué elegir Peruana en Rusia?
	{ selector: '.home-why__eyebrow', effect: 'up' },
	{ selector: '.home-why__title', effect: 'words', delay: 80 },
	{ selector: '.home-why__avatars > li', effect: 'pop', stagger: 70, delay: 250 },
	{ selector: '.home-why__proof-text', effect: 'fade', delay: 450 },
	// (el tubo y las estrellas tienen su propia animación: aparece el grupo)
	{ selector: '.home-why__art', effect: 'fade', delay: 100 },
	{ selector: '.benefit-card', effect: 'up', stagger: 130 },
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
	{ selector: '.home-universities__eyebrow', effect: 'up' },
	{ selector: '.home-universities__title', effect: 'words', delay: 80 },
	{ selector: '.home-universities__subtitle', effect: 'up', delay: 180 },
	{ selector: '.home-universities__cta', effect: 'fade', delay: 300 },
	{ selector: '.uni-panel', effect: 'up', stagger: 110 },
	// Reserva tu llamada / Resuelve tus dudas
	{ selector: '.contact-split__eyebrow', effect: 'up' },
	{ selector: '.contact-split__title', effect: 'up', delay: 80 },
	{ selector: '.contact-split__text', effect: 'up', delay: 180 },
	{ selector: '.contact-split__point', effect: 'left', stagger: 90, delay: 260 },
	{ selector: '.contact-split__cta', effect: 'fade', delay: 450 },
	{ selector: '.contact-split__media', effect: 'clip' },
	// Casos de éxito
	{ selector: '.home-cases__eyebrow', effect: 'up' },
	{ selector: '.home-cases__title', effect: 'words', delay: 80 },
	{ selector: '.home-cases__subtitle', effect: 'up', delay: 180 },
	{ selector: '.home-cases__stat', effect: 'up', stagger: 100, delay: 260 },
	{ selector: '.case-video', effect: 'clip', stagger: 160 },
	{ selector: '.testimonial-card', effect: 'scale', stagger: 80 },
	// Comunidad (mosaico de momentos)
	{ selector: '.home-community__eyebrow', effect: 'up' },
	{ selector: '.home-community__title', effect: 'words', delay: 80 },
	{ selector: '.home-community__text', effect: 'up', delay: 180 },
	{ selector: '.moment__card', effect: 'clip', stagger: 90 },
	{ selector: '.home-community__join', effect: 'up', delay: 200 },
	{ selector: '.home-gallery__title', effect: 'words' },
	{ selector: '.gallery-photo', effect: 'up', stagger: 100 },
	// Redes sociales (TikTok)
	{ selector: '.home-social__eyebrow', effect: 'up' },
	{ selector: '.home-social__title', effect: 'words', delay: 80 },
	{ selector: '.home-social__text', effect: 'up', delay: 180 },
	{ selector: '.home-social__profile', effect: 'scale', delay: 220 },
	{ selector: '.tiktok-card', effect: 'up', stagger: 90 },
	// Más historias (blog)
	{ selector: '.home-stories__eyebrow', effect: 'up' },
	{ selector: '.home-stories__title', effect: 'words', delay: 80 },
	{ selector: '.home-stories__text', effect: 'up', delay: 180 },
	{ selector: '.story-feature', effect: 'clip', delay: 120 },
	{ selector: '.story-item', effect: 'up', stagger: 100, delay: 200 },
	// Blog: Novedades y Videoblogs (el hero entra con su propia animación al cargar)
	{ selector: '.blog-news__eyebrow', effect: 'up' },
	{ selector: '.blog-news__title', effect: 'words', delay: 80 },
	{ selector: '.blog-news__text', effect: 'up', delay: 180 },
	{ selector: '.post-tile', effect: 'up', stagger: 120 },
	{ selector: '.blog-videoblogs__eyebrow', effect: 'up' },
	{ selector: '.blog-videoblogs__title', effect: 'words', delay: 80 },
	{ selector: '.blog-videoblogs__text', effect: 'up', delay: 180 },
	{ selector: '.blog-videoblogs__cta', effect: 'fade', delay: 300 },
	{ selector: '.video-card', effect: 'up', stagger: 90 },
	// Preguntas frecuentes
	{ selector: '.home-faq__eyebrow', effect: 'up' },
	{ selector: '.home-faq__title', effect: 'words', delay: 80 },
	{ selector: '.home-faq__text', effect: 'up', delay: 180 },
	{ selector: '.faq-item', effect: 'up', stagger: 80 },
	{ selector: '.faq-video', effect: 'up', delay: 120 },
	{ selector: '.faq-help', effect: 'up', delay: 220 },
	// Flechas y puntos de todos los carruseles
	{ selector: '#contenido .carousel__controls', effect: 'fade', delay: 250 },
];

/** Desplazamiento máximo de los decorados (px): nunca se alejan de su sitio en el diseño */
const PARALLAX_MAX = 48;

/** Solo en desktop (en tablet y móvil esas tarjetas van en una fila deslizable) */
const DESKTOP = '(min-width: 1101px)';

/**
 * Elementos que se desplazan más lento o más rápido que el scroll (velocidad).
 * `media`: solo se mueven mientras se cumple esa media query.
 */
const PARALLAX: { selector: string; speed: number; media?: string }[] = [
	{ selector: '.home-why__tube', speed: 0.1 },
	{ selector: '.home-why__item:nth-child(3n + 1)', speed: 0.04, media: DESKTOP },
	{ selector: '.home-why__item:nth-child(3n + 2)', speed: 0.12, media: DESKTOP },
	{ selector: '.home-why__item:nth-child(3n + 3)', speed: 0.08, media: DESKTOP },
	{ selector: '.start-cta__waves--back', speed: 0.05 },
	{ selector: '.start-cta__waves--front', speed: 0.1 },
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
	'.case-video',
	'.moment__card',
	'.gallery-photo',
	'.tiktok-card',
	'.story-feature',
	'.post-tile',
	'.video-card',
	'.blog-hero__feature',
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
		if (rule.media && !window.matchMedia(rule.media).matches) return;
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
	const items = PARALLAX.flatMap(({ selector, speed, media }) => {
		const query = media ? window.matchMedia(media) : null;
		return Array.from(document.querySelectorAll<HTMLElement>(selector), (element) => ({
			element,
			speed,
			query,
			offset: 0,
		}));
	});
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
			if (item.query && !item.query.matches) {
				// Fuera de su media query: en su lugar
				if (item.offset !== 0) {
					item.offset = 0;
					item.element.style.setProperty('--parallax', '0px');
				}
				continue;
			}
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
   9. "Soy Grecia Kristal": las fotos suben y se apilan; después, el texto
   --------------------------------------------------------------------------
   Marcado: [data-founder-stack] › [data-founder-photos] › [data-founder-card]…
   El script escribe en cada foto --in (0 → 1, cuánto subió) y --covered
   (cuánto la tapa la siguiente), y en la sección --founder-p (avance).
   Desktop (FOUNDER_PIN): la sección queda fija (.is-pinned) mientras se
   apilan las fotos; al terminar, .is-text-in muestra el texto.
   Tablet y móvil: sin fijar; las fotos se apilan mientras cruzan la pantalla.
   ========================================================================== */

/** Tramo del avance (0–1) en que sube cada foto: [desde, hasta] */
const FOUNDER_CARDS_PINNED: [number, number][] = [
	[0, 0.24],
	[0.2, 0.44],
	[0.4, 0.64],
];
const FOUNDER_CARDS_FLOW: [number, number][] = [
	[0, 0.4],
	[0.25, 0.65],
	[0.5, 0.9],
];
/** Avance en que aparece el texto (desktop) */
const FOUNDER_TEXT_AT = 0.66;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

function initFounderStack(): void {
	const section = document.querySelector<HTMLElement>('[data-founder-stack]');
	const photos = section?.querySelector<HTMLElement>('[data-founder-photos]');
	if (!section || !photos) return;

	const cards = Array.from(photos.querySelectorAll<HTMLElement>('[data-founder-card]'));
	const title = section.querySelector<HTMLElement>('.home-founder__title');
	const header = document.querySelector<HTMLElement>('.site-header');
	const pinQuery = window.matchMedia(FOUNDER_PIN);
	let pinned = false;
	let length = 0;

	const measure = () => {
		pinned = pinQuery.matches;
		section.classList.toggle('is-pinned', pinned);
		if (pinned && title) splitWords(title);
		// Recorrido mientras la sección está fija
		length = pinned ? Math.round(window.innerHeight * 1.2) : 0;
		section.style.setProperty('--founder-length', `${length}px`);
	};

	const update = () => {
		const viewportHeight = window.innerHeight;
		let progress: number;

		if (pinned) {
			// Empieza cuando la sección llega a la mitad de la pantalla y termina
			// al final del recorrido fijo (la primera foto sube mientras entra)
			const top = section.getBoundingClientRect().top;
			const headerOffset = header?.offsetHeight ?? 0;
			const lead = viewportHeight * 0.5 - headerOffset;
			progress = clamp((viewportHeight * 0.5 - top) / (lead + length), 0, 1);
		} else {
			const rect = photos.getBoundingClientRect();
			progress = clamp((viewportHeight * 0.95 - rect.top) / (viewportHeight * 0.75), 0, 1);
		}

		const ranges = pinned ? FOUNDER_CARDS_PINNED : FOUNDER_CARDS_FLOW;
		const amounts = cards.map((_, index) => {
			const [from, to] = ranges[Math.min(index, ranges.length - 1)];
			return easeOutCubic(clamp((progress - from) / (to - from), 0, 1));
		});
		cards.forEach((card, index) => {
			card.style.setProperty('--in', amounts[index].toFixed(3));
			card.style.setProperty('--covered', (amounts[index + 1] ?? 0).toFixed(3));
		});

		section.style.setProperty('--founder-p', progress.toFixed(3));
		if (pinned) section.classList.toggle('is-text-in', progress >= FOUNDER_TEXT_AT);
	};

	measure();
	onScroll(update);

	const refresh = () => {
		measure();
		update();
	};
	window.addEventListener('resize', refresh, { passive: true });
	pinQuery.addEventListener('change', refresh);
}

/* ==========================================================================
   10. "Universidades destacadas" (desktop): el panel abierto avanza con el scroll
   --------------------------------------------------------------------------
   Marcado: [data-uni-gallery] › [data-uni-panel]… Mientras la galería cruza
   la pantalla se abre un panel tras otro (.is-active). Con el cursor o el
   teclado manda el panel señalado (solo CSS).
   ========================================================================== */

function initUniversityGallery(): void {
	const gallery = document.querySelector<HTMLElement>('[data-uni-gallery]');
	if (!gallery) return;
	const panels = Array.from(gallery.querySelectorAll<HTMLElement>('[data-uni-panel]'));
	if (panels.length < 2) return;

	const desktop = window.matchMedia('(min-width: 1101px)');
	let active = 0;

	onScroll(() => {
		if (!desktop.matches) return;
		const rect = gallery.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		if (rect.bottom < 0 || rect.top > viewportHeight) return;
		// 0 cuando la galería asoma por abajo → 1 cuando su parte de abajo llega arriba
		const progress = clamp(
			(viewportHeight * 0.85 - rect.top) / (viewportHeight * 0.85 + rect.height * 0.25),
			0,
			0.999,
		);
		const index = Math.floor(progress * panels.length);
		if (index === active) return;
		active = index;
		panels.forEach((panel, panelIndex) => panel.classList.toggle('is-active', panelIndex === index));
	});
}

/* ==========================================================================
   Inicio
   ========================================================================== */

export function initMotion(): void {
	const root = document.documentElement;
	if (root.dataset.motion === 'ready') return;
	root.dataset.motion = 'ready';

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	initHero(finePointer);
	initMarquee();
	initReveals();
	initFounderStack();
	initScrollSliders();
	initUniversityGallery();
	initParallax();
	if (finePointer) {
		initTilt();
		initMagnetic();
	}
}
