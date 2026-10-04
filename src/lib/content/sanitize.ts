/**
 * Saneamiento del HTML que llega del gestor de contenidos
 * --------------------------------------------------------------------------
 * El contenido de WordPress (cuerpo de artículos, respuestas, textos legales)
 * llega como HTML. Antes de insertarlo en la página (set:html) se filtra con
 * una lista blanca de etiquetas y atributos: se eliminan scripts, estilos,
 * eventos (onclick…), iframes no permitidos y enlaces "javascript:".
 *
 * Esto se ejecuta al compilar (o en el servidor), nunca en el navegador.
 */
import sanitizeHtml from 'sanitize-html';

/** Dominios de video que se pueden insertar (siempre se sirven sin cookies) */
const VIDEO_HOSTS = ['www.youtube-nocookie.com', 'www.youtube.com', 'youtube.com'];

const OPTIONS: sanitizeHtml.IOptions = {
	allowedTags: [
		'p',
		'br',
		'strong',
		'b',
		'em',
		'i',
		'u',
		's',
		'a',
		'ul',
		'ol',
		'li',
		'h2',
		'h3',
		'h4',
		'blockquote',
		'figure',
		'figcaption',
		'img',
		'hr',
		'table',
		'thead',
		'tbody',
		'tr',
		'th',
		'td',
		'code',
		'pre',
		'iframe',
	],
	allowedAttributes: {
		a: ['href', 'title', 'target', 'rel'],
		img: ['src', 'srcset', 'sizes', 'alt', 'width', 'height', 'loading', 'decoding'],
		th: ['colspan', 'rowspan', 'scope'],
		td: ['colspan', 'rowspan'],
		iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen', 'loading'],
	},
	allowedSchemes: ['http', 'https', 'mailto', 'tel'],
	allowedSchemesByTag: { img: ['http', 'https'] },
	allowedIframeHostnames: VIDEO_HOSTS,
	allowProtocolRelative: false,
	transformTags: {
		// Enlaces externos: pestaña nueva y sin acceso a window.opener ni referer
		a: (tagName, attribs) => {
			const href = attribs.href ?? '';
			const external = /^https?:\/\//i.test(href);
			return {
				tagName,
				attribs: external ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' } : attribs,
			};
		},
		// Imágenes: carga diferida
		img: (tagName, attribs) => ({
			tagName,
			attribs: { ...attribs, loading: 'lazy', decoding: 'async' },
		}),
		// Videos de YouTube: siempre desde youtube-nocookie.com (permitido por la CSP)
		iframe: (tagName, attribs) => ({
			tagName,
			attribs: {
				...attribs,
				src: (attribs.src ?? '').replace(
					/^https:\/\/(www\.)?youtube\.com\/embed\//i,
					'https://www.youtube-nocookie.com/embed/',
				),
				loading: 'lazy',
			},
		}),
	},
};

/** Devuelve HTML seguro para insertar con set:html */
export function sanitizeContent(html: string | undefined | null): string {
	if (!html) return '';
	return sanitizeHtml(html, OPTIONS).trim();
}

/** Quita todas las etiquetas y deja texto plano (ej. el resumen de un artículo) */
export function toPlainText(html: string | undefined | null): string {
	if (!html) return '';
	const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
	return decodeEntities(text).replace(/\s+/g, ' ').trim();
}

const NAMED_ENTITIES: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	hellip: '…',
	ndash: '–',
	mdash: '—',
	laquo: '«',
	raquo: '»',
	lsquo: '‘',
	rsquo: '’',
	ldquo: '“',
	rdquo: '”',
	iexcl: '¡',
	iquest: '¿',
};

/** Convierte entidades HTML (&#8217;, &amp;…) en caracteres (títulos de WordPress) */
export function decodeEntities(text: string): string {
	return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
		if (entity[0] === '#') {
			const code =
				entity[1].toLowerCase() === 'x'
					? parseInt(entity.slice(2), 16)
					: parseInt(entity.slice(1), 10);
			return Number.isFinite(code) ? String.fromCodePoint(code) : match;
		}
		return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
	});
}
