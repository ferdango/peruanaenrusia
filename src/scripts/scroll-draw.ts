/**
 * Dibujo ligado al scroll (data-scroll-draw)
 * --------------------------------------------------------------------------
 * Escribe en cada elemento con data-scroll-draw la variable CSS --draw, de 0 a
 * 1 según avanza por la pantalla: las líneas de la marca se dibujan siguiendo
 * su trazo al bajar y se "desdibujan" al subir. Cada componente decide en su
 * CSS qué hace con --draw (stroke-dashoffset de las líneas, figuras que
 * aparecen…).
 *
 *   <section data-scroll-draw="0.85 0.3">
 *
 * Los dos números son la altura de la pantalla (0 = arriba, 1 = abajo) en la
 * que está el centro del elemento cuando el dibujo empieza (--draw: 0) y
 * cuando termina (--draw: 1). Por defecto "0.85 0.35". Si el elemento está al
 * final de la página (ej. el footer) y su centro nunca llega tan arriba, el
 * dibujo termina justo al llegar al final del scroll.
 *
 * Sin JavaScript o con "reducir movimiento" no se escribe nada: el CSS usa
 * var(--draw, 1) y todo se ve completo.
 *
 * Usado por: StartCta (src/components/sections/shared/StartCta.astro) y
 * SiteFooter (src/components/layout/SiteFooter.astro).
 */

const DEFAULT_RANGE: [number, number] = [0.85, 0.35];

let ready = false;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function readRange(element: HTMLElement): [number, number] {
	const [start, end] = (element.dataset.scrollDraw ?? '').trim().split(/\s+/).map(Number);
	return [Number.isFinite(start) ? start : DEFAULT_RANGE[0], Number.isFinite(end) ? end : DEFAULT_RANGE[1]];
}

export function initScrollDraw(): void {
	if (ready) return;
	ready = true;

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-draw]'));
	if (elements.length === 0) return;

	const visible = new Set<HTMLElement>();

	const update = () => {
		const viewportHeight = window.innerHeight;
		const maxScroll = document.documentElement.scrollHeight - viewportHeight;

		for (const element of visible) {
			const rect = element.getBoundingClientRect();
			const [start, end] = readRange(element);
			const center = rect.top + rect.height / 2;
			// Lo más arriba que puede llegar el centro (con el scroll al máximo)
			const highest = center - (maxScroll - window.scrollY);
			const startY = viewportHeight * start;
			const endY = Math.min(startY - 80, Math.max(viewportHeight * end, highest + 1));
			const progress = clamp((startY - center) / (startY - endY), 0, 1);
			element.style.setProperty('--draw', progress.toFixed(3));
		}
	};

	let queued = false;
	const queue = () => {
		if (queued) return;
		queued = true;
		window.requestAnimationFrame(() => {
			queued = false;
			update();
		});
	};

	// Solo se calcula lo que está cerca de la pantalla
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const element = entry.target as HTMLElement;
				if (entry.isIntersecting) visible.add(element);
				else visible.delete(element);
			}
			queue();
		},
		{ rootMargin: '15% 0px' },
	);

	// Primer cálculo inmediato (sin esperar al observador): nada aparece dibujado de golpe
	elements.forEach((element) => {
		visible.add(element);
		observer.observe(element);
	});
	update();
	visible.clear();

	window.addEventListener('scroll', queue, { passive: true });
	window.addEventListener('resize', queue, { passive: true });
}
