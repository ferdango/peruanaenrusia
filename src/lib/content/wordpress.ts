/**
 * Cliente de WordPress (REST API)
 * --------------------------------------------------------------------------
 * Lee el contenido publicado en WordPress y lo convierte al formato que usan
 * los componentes del sitio (los mismos tipos de src/data/).
 *
 * Se activa definiendo WORDPRESS_URL (ej. https://cms.peruanaenrusia.pe).
 * El modelo de contenido (tipos de entrada y campos) lo crea el plugin
 * wordpress/peru-headless/ incluido en este repositorio. Detalle completo:
 * docs/WORDPRESS.md.
 *
 *   Contenido            Ruta REST                         Origen en WordPress
 *   ───────────────────  ────────────────────────────────  ───────────────────────────────
 *   Artículos y videos   /wp/v2/posts                      Entradas (videos: campo YouTube)
 *   Universidades        /wp/v2/universidades              Tipo "Universidad"
 *   Casos de éxito       /wp/v2/casos-de-exito             Tipo "Caso de éxito"
 *   Preguntas frecuentes /wp/v2/preguntas-frecuentes       Tipo "Pregunta frecuente"
 *   Legales              /wp/v2/pages?slug=legales         Página "Legales"
 *
 * Cada tipo personalizado expone un campo `peru` con sus datos ya
 * normalizados (lo arma el plugin a partir de los campos de ACF).
 *
 * Errores: si WordPress no responde, la compilación falla con un mensaje
 * claro (es preferible a publicar el sitio sin contenido). Las entradas
 * individuales con datos incompletos se omiten con una advertencia.
 */
import { WORDPRESS_URL } from 'astro:env/server';

import type { Article } from '@data/articles';
import type { Author } from '@data/authors';
import { isCountryCode } from '@data/countries';
import type { Faq } from '@data/faqs';
import type {
	Testimonial,
	TestimonialGalleryItem,
	TestimonialPhoto,
	TestimonialStoryBlock,
	TestimonialStoryTile,
} from '@data/testimonials';
import type { University, UniversityPhoto } from '@data/universities';
import type { Video } from '@data/videos';

import type { RemoteImage } from './images';
import type { LegalPage } from './types';
import { decodeEntities, sanitizeContent, toPlainText } from './sanitize';

// ---------------------------------------------------------------------------
// Petición base
// ---------------------------------------------------------------------------

/** Tiempo máximo de espera por petición */
const TIMEOUT_MS = 20_000;
/** Máximo de páginas de 100 elementos por consulta (protege contra bucles) */
const MAX_PAGES = 20;
/** Tiempo que se reutiliza una respuesta (en el servidor) */
const CACHE_TTL_MS = 60_000;

const cache = new Map<string, { expires: number; value: Promise<unknown> }>();

function apiBase(): string {
	if (!WORDPRESS_URL) throw new Error('[WordPress] Falta la variable WORDPRESS_URL.');
	return `${WORDPRESS_URL.replace(/\/+$/, '')}/wp-json`;
}

interface WpResponse<T> {
	data: T;
	totalPages: number;
}

async function request<T>(
	path: string,
	params: Record<string, string | number> = {},
): Promise<WpResponse<T>> {
	const url = new URL(`${apiBase()}${path}`);
	for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));

	const key = url.href;
	const cached = cache.get(key);
	if (cached && cached.expires > Date.now()) return cached.value as Promise<WpResponse<T>>;

	const value = (async () => {
		let response: Response;
		try {
			response = await fetch(url, {
				headers: { Accept: 'application/json' },
				signal: AbortSignal.timeout(TIMEOUT_MS),
			});
		} catch (error) {
			throw new Error(`[WordPress] No se pudo conectar con ${url.origin}: ${(error as Error).message}`);
		}

		if (!response.ok) {
			throw new Error(`[WordPress] ${response.status} ${response.statusText} al pedir ${url.pathname}`);
		}

		const data = (await response.json()) as T;
		const totalPages = Number(response.headers.get('X-WP-TotalPages') ?? '1') || 1;
		return { data, totalPages };
	})();

	cache.set(key, { expires: Date.now() + CACHE_TTL_MS, value });
	value.catch(() => cache.delete(key));
	return value;
}

/** Pide todas las páginas de una colección (100 elementos por página) */
async function requestAll<T>(path: string, params: Record<string, string | number> = {}): Promise<T[]> {
	const first = await request<T[]>(path, { ...params, per_page: 100, page: 1 });
	const pages = Math.min(first.totalPages, MAX_PAGES);
	const rest = await Promise.all(
		Array.from({ length: pages - 1 }, (_, index) =>
			request<T[]>(path, { ...params, per_page: 100, page: index + 2 }),
		),
	);
	return [first.data, ...rest.map((page) => page.data)].flat();
}

// ---------------------------------------------------------------------------
// Tipos de la REST API (solo los campos que se usan)
// ---------------------------------------------------------------------------

interface WpRendered {
	rendered: string;
}

/** Imagen normalizada por el plugin (campo `peru`) */
interface WpImage {
	src?: string;
	width?: number;
	height?: number;
	alt?: string;
}

interface WpEmbedded {
	author?: Array<{ name?: string; avatar_urls?: Record<string, string> }>;
	'wp:featuredmedia'?: Array<{
		source_url?: string;
		alt_text?: string;
		media_details?: { width?: number; height?: number };
	}>;
	'wp:term'?: Array<Array<{ taxonomy?: string; name?: string; slug?: string }>>;
}

interface WpEntry<Fields = unknown> {
	id: number;
	slug: string;
	date: string;
	title: WpRendered;
	excerpt?: WpRendered;
	content?: WpRendered;
	sticky?: boolean;
	peru?: Fields;
	_embedded?: WpEmbedded;
}

// ---------------------------------------------------------------------------
// Utilidades de conversión
// ---------------------------------------------------------------------------

const warn = (type: string, slug: string, reason: string) =>
	console.warn(`[WordPress] Se omite ${type} "${slug}": ${reason}`);

const text = (value: unknown): string | undefined =>
	typeof value === 'string' && value.trim() ? value.trim() : undefined;

const lines = (value: unknown): string[] =>
	Array.isArray(value) ? value.map(text).filter((item): item is string => Boolean(item)) : [];

/** Imagen del plugin → imagen remota (o undefined si está incompleta) */
function toImage(value: unknown): RemoteImage | undefined {
	const image = value as WpImage | null | undefined;
	if (!image?.src || !image.width || !image.height) return undefined;
	return { src: image.src, width: image.width, height: image.height };
}

function toPhoto(value: unknown, fallbackAlt = ''): TestimonialPhoto | undefined {
	const image = toImage(value);
	if (!image) return undefined;
	return { src: image, alt: text((value as WpImage).alt) ?? fallbackAlt };
}

/** Imagen destacada embebida (?_embed) */
function featuredImage(entry: WpEntry<unknown>): { image?: RemoteImage; alt: string } {
	const media = entry._embedded?.['wp:featuredmedia']?.[0];
	const width = media?.media_details?.width;
	const height = media?.media_details?.height;
	if (!media?.source_url || !width || !height) return { alt: '' };
	return { image: { src: media.source_url, width, height }, alt: media.alt_text ?? '' };
}

function embeddedAuthor(entry: WpEntry<unknown>): Author | undefined {
	const author = entry._embedded?.author?.[0];
	if (!author?.name) return undefined;
	const avatarUrl = author.avatar_urls?.['96'];
	return {
		name: author.name,
		avatar: avatarUrl ? { src: avatarUrl, width: 96, height: 96 } : undefined,
	};
}

function terms(entry: WpEntry<unknown>, taxonomy: string) {
	return (entry._embedded?.['wp:term'] ?? []).flat().filter((term) => term.taxonomy === taxonomy);
}

/** "2025-05-07T10:00:00" → "2025-05-07" */
const day = (date: string) => date.slice(0, 10);

// ---------------------------------------------------------------------------
// Blog: artículos y videos (entradas)
// ---------------------------------------------------------------------------

interface WpPostFields {
	/** Código del video de YouTube: si existe, la entrada es un video */
	youtube_id?: string;
	/** Aparece en "Clásicos" */
	classic?: boolean;
}

/** Categoría que marca una entrada como video aunque aún no tenga el código */
const VIDEO_CATEGORY = 'videoblogs';

async function fetchPosts(): Promise<WpEntry<WpPostFields>[]> {
	return requestAll<WpEntry<WpPostFields>>('/wp/v2/posts', {
		_embed: 'author,wp:featuredmedia,wp:term',
		orderby: 'date',
		order: 'desc',
	});
}

const isVideoPost = (post: WpEntry<WpPostFields>) =>
	Boolean(text(post.peru?.youtube_id)) ||
	terms(post, 'category').some((term) => term.slug === VIDEO_CATEGORY);

export async function fetchArticles(): Promise<Article[]> {
	const posts = await fetchPosts();
	return posts
		.filter((post) => !isVideoPost(post))
		.flatMap((post): Article[] => {
			const { image, alt } = featuredImage(post);
			if (!image) {
				warn('el artículo', post.slug, 'no tiene imagen destacada');
				return [];
			}
			const category = terms(post, 'category')[0]?.name;
			const tags = terms(post, 'post_tag').map((tag) => tag.slug);
			return [
				{
					slug: post.slug,
					title: decodeEntities(post.title.rendered),
					category: category ? decodeEntities(category) : 'Blog',
					date: day(post.date),
					author: embeddedAuthor(post),
					excerpt: toPlainText(post.excerpt?.rendered),
					image,
					imageAlt: alt,
					body: [{ type: 'html', html: sanitizeContent(post.content?.rendered) }],
					featured: Boolean(post.sticky),
					classic: Boolean(post.peru?.classic) || tags.includes('clasico'),
				},
			];
		});
}

export async function fetchVideos(): Promise<Video[]> {
	const posts = await fetchPosts();
	return posts.filter(isVideoPost).flatMap((post): Video[] => {
		const youtubeId = text(post.peru?.youtube_id);
		const { image } = featuredImage(post);
		// Sin imagen destacada se usa la miniatura de YouTube
		const thumbnail =
			image ??
			(youtubeId
				? {
						src: `https://i.ytimg.com/vi/${encodeURIComponent(youtubeId)}/hqdefault.jpg`,
						width: 480,
						height: 360,
					}
				: undefined);

		if (!thumbnail) {
			warn('el video', post.slug, 'no tiene imagen destacada ni código de YouTube');
			return [];
		}

		return [
			{
				slug: post.slug,
				title: decodeEntities(post.title.rendered),
				date: day(post.date),
				thumbnail,
				youtubeId,
				author: embeddedAuthor(post),
				description: toPlainText(post.excerpt?.rendered) || undefined,
				featured: Boolean(post.sticky),
			},
		];
	});
}

// ---------------------------------------------------------------------------
// Preguntas frecuentes
// ---------------------------------------------------------------------------

export async function fetchFaqs(): Promise<Faq[]> {
	const entries = await requestAll<WpEntry>('/wp/v2/preguntas-frecuentes', {
		orderby: 'menu_order',
		order: 'asc',
	});
	return entries.map((entry) => ({
		question: decodeEntities(entry.title.rendered),
		answer: toPlainText(entry.content?.rendered),
		answerHtml: sanitizeContent(entry.content?.rendered),
	}));
}

// ---------------------------------------------------------------------------
// Universidades
// ---------------------------------------------------------------------------

interface WpUniversityFields {
	city?: string;
	featured?: boolean;
	website?: string;
	summary?: string;
	logo?: WpImage;
	cover?: WpImage;
	gallery?: WpImage[];
	description?: string[];
	highlights?: string[];
	faculties?: Array<{ name?: string; description?: string }>;
	rankings?: { intro?: string; items?: string[] } | null;
	student_life?: string[];
	tips?: string[];
}

export async function fetchUniversities(): Promise<University[]> {
	const entries = await requestAll<WpEntry<WpUniversityFields>>('/wp/v2/universidades', {
		_embed: 'wp:featuredmedia',
		orderby: 'menu_order',
		order: 'asc',
	});

	return entries.flatMap((entry): University[] => {
		const fields = entry.peru ?? {};
		const name = decodeEntities(entry.title.rendered);
		const { image } = featuredImage(entry);
		const logo = toImage(fields.logo);

		if (!image || !logo) {
			warn('la universidad', entry.slug, 'falta la imagen destacada o el logo');
			return [];
		}

		const cover = toPhoto(fields.cover, '') as UniversityPhoto | undefined;
		const gallery = (fields.gallery ?? [])
			.map((photo) => toPhoto(photo))
			.filter((photo): photo is UniversityPhoto => Boolean(photo));
		const rankingItems = lines(fields.rankings?.items);

		return [
			{
				slug: entry.slug,
				name,
				city: text(fields.city) ?? 'Rusia',
				logo,
				image,
				featured: Boolean(fields.featured),
				website: text(fields.website),
				summary: text(fields.summary) ?? (toPlainText(entry.excerpt?.rendered) || undefined),
				cover,
				gallery: gallery.length ? gallery : undefined,
				description: lines(fields.description).length ? lines(fields.description) : undefined,
				highlights: lines(fields.highlights).length ? lines(fields.highlights) : undefined,
				faculties: (fields.faculties ?? [])
					.filter((faculty) => text(faculty.name))
					.map((faculty) => ({
						name: text(faculty.name)!,
						description: text(faculty.description),
					})),
				rankings: rankingItems.length
					? { intro: text(fields.rankings?.intro), items: rankingItems }
					: undefined,
				studentLife: lines(fields.student_life).length ? lines(fields.student_life) : undefined,
				tips: lines(fields.tips).length ? lines(fields.tips) : undefined,
			},
		];
	});
}

// ---------------------------------------------------------------------------
// Casos de éxito
// ---------------------------------------------------------------------------

interface WpTestimonialFields {
	role?: string;
	country?: string;
	quote?: string;
	avatar?: WpImage;
	headline?: string;
	portrait?: WpImage;
	video?: { poster?: WpImage; url?: string } | null;
	highlight?: string;
	story?: Array<{
		photo?: WpImage;
		tiles?: Array<{ title?: string; text?: string; photo?: WpImage }>;
	}>;
	gallery?: Array<WpImage & { href?: string; album?: boolean }>;
	closing?: { quote?: string; text?: string } | null;
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
	const entries = await requestAll<WpEntry<WpTestimonialFields>>('/wp/v2/casos-de-exito', {
		orderby: 'menu_order',
		order: 'asc',
	});

	return entries.flatMap((entry): Testimonial[] => {
		const fields = entry.peru ?? {};
		const name = decodeEntities(entry.title.rendered);
		const avatar = toImage(fields.avatar);
		const quote = text(fields.quote);
		const role = text(fields.role);

		if (!avatar || !quote || !role || !isCountryCode(fields.country)) {
			warn('el caso de éxito', entry.slug, 'faltan la foto, la frase, la carrera o un país válido');
			return [];
		}

		const story = (fields.story ?? []).flatMap((block): TestimonialStoryBlock[] => {
			const photo = toPhoto(block.photo, `Foto de ${name}`);
			const tiles = (block.tiles ?? []).flatMap((tile): TestimonialStoryTile[] => {
				const tilePhoto = toPhoto(tile.photo, `Foto de ${name}`);
				if (tilePhoto) return [{ photo: tilePhoto }];
				const title = text(tile.title);
				const tileText = text(tile.text);
				return title && tileText ? [{ title, text: tileText }] : [];
			});
			return photo && tiles.length === 4 ? [{ photo, tiles }] : [];
		});

		const gallery = (fields.gallery ?? []).flatMap((item): TestimonialGalleryItem[] => {
			const photo = toPhoto(item, `Publicación de ${name}`);
			return photo ? [{ ...photo, href: text(item.href), album: Boolean(item.album) }] : [];
		});

		const poster = toPhoto(fields.video?.poster, `Video de ${name}`);
		const closingQuote = text(fields.closing?.quote);
		const closingText = text(fields.closing?.text);

		return [
			{
				slug: entry.slug,
				name,
				role,
				country: fields.country,
				avatar,
				quote,
				headline: text(fields.headline),
				portrait: toPhoto(fields.portrait, `Foto de ${name}`),
				video: poster ? { poster, url: text(fields.video?.url) } : undefined,
				highlight: text(fields.highlight),
				story: story.length ? story : undefined,
				gallery: gallery.length ? gallery : undefined,
				closing: closingQuote && closingText ? { quote: closingQuote, text: closingText } : undefined,
			},
		];
	});
}

// ---------------------------------------------------------------------------
// Página "Legales"
// ---------------------------------------------------------------------------

export async function fetchLegalPage(): Promise<LegalPage | undefined> {
	const { data } = await request<WpEntry[]>('/wp/v2/pages', { slug: 'legales' });
	const page = data[0];
	if (!page) return undefined;
	return {
		title: decodeEntities(page.title.rendered),
		subtitle: toPlainText(page.excerpt?.rendered) || undefined,
		html: sanitizeContent(page.content?.rendered),
	};
}
