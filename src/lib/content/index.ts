/**
 * Capa de contenido del sitio
 * --------------------------------------------------------------------------
 * Único punto de acceso al contenido editable (blog, universidades, casos de
 * éxito, preguntas frecuentes y textos legales). Los componentes y páginas
 * piden los datos aquí, sin saber de dónde salen:
 *
 *   - Con WORDPRESS_URL definida → se leen de WordPress (src/lib/content/wordpress.ts).
 *   - Sin WORDPRESS_URL          → se usan los datos locales de src/data/.
 *
 * Así el sitio funciona igual con o sin gestor de contenidos, y conectar
 * WordPress no requiere tocar el diseño. Guía: docs/WORDPRESS.md.
 *
 * Uso (en el frontmatter de un componente o página):
 *   import { getFaqs } from '@lib/content';
 *   const faqs = await getFaqs();
 */
import { WORDPRESS_URL } from 'astro:env/server';

import { articles as localArticles, type Article } from '@data/articles';
import { buildBlogPosts, selectFeaturedPosts, selectRelatedPosts, type BlogPost } from '@data/blog';
import { faqs as localFaqs, type Faq } from '@data/faqs';
import { legalPage as localLegalPage } from '@data/legal';
import { testimonials as localTestimonials, type Testimonial } from '@data/testimonials';
import { universities as localUniversities, type University } from '@data/universities';
import { videos as localVideos, type Video } from '@data/videos';

import type { ContentSource, LegalPage } from './types';
import * as wordpress from './wordpress';

export type { LegalPage, ContentSource } from './types';
export type { ImageSource, RemoteImage } from './images';

/** Origen del contenido según la configuración */
export const contentSource: ContentSource = WORDPRESS_URL ? 'wordpress' : 'local';

const fromWordPress = contentSource === 'wordpress';

// ----- Blog -----------------------------------------------------------------

/** Artículos de texto, del más reciente al más antiguo */
export async function getArticles(): Promise<Article[]> {
	const list = fromWordPress ? await wordpress.fetchArticles() : localArticles;
	return [...list].sort((a, b) => b.date.localeCompare(a.date));
}

/** Videos, del más reciente al más antiguo */
export async function getVideos(): Promise<Video[]> {
	const list = fromWordPress ? await wordpress.fetchVideos() : localVideos;
	return [...list].sort((a, b) => b.date.localeCompare(a.date));
}

/** Todas las publicaciones (videos + artículos), de la más reciente a la más antigua */
export async function getBlogPosts(): Promise<BlogPost[]> {
	const [videos, articles] = await Promise.all([getVideos(), getArticles()]);
	return buildBlogPosts(videos, articles);
}

/** "Novedades": publicaciones destacadas (o las 6 más recientes) */
export async function getFeaturedPosts(): Promise<BlogPost[]> {
	return selectFeaturedPosts(await getBlogPosts());
}

/** "Temas relacionados": publicaciones recientes sin la actual */
export async function getRelatedPosts(currentSlug: string, limit = 6): Promise<BlogPost[]> {
	return selectRelatedPosts(await getBlogPosts(), currentSlug, limit);
}

/** "Clásicos": artículos marcados como clásicos */
export async function getClassicArticles(): Promise<Article[]> {
	const list = fromWordPress ? await wordpress.fetchArticles() : localArticles;
	return list.filter((article) => article.classic);
}

// ----- Universidades ---------------------------------------------------------

export async function getUniversities(): Promise<University[]> {
	return fromWordPress ? wordpress.fetchUniversities() : localUniversities;
}

/** "Universidades destacadas" del Home */
export async function getFeaturedUniversities(): Promise<University[]> {
	const list = await getUniversities();
	const featured = list.filter((university) => university.featured);
	return featured.length > 0 ? featured : list.slice(0, 8);
}

// ----- Casos de éxito --------------------------------------------------------

export async function getTestimonials(): Promise<Testimonial[]> {
	return fromWordPress ? wordpress.fetchTestimonials() : localTestimonials;
}

// ----- Preguntas frecuentes --------------------------------------------------

export async function getFaqs(): Promise<Faq[]> {
	return fromWordPress ? wordpress.fetchFaqs() : localFaqs;
}

// ----- Legales ---------------------------------------------------------------

/** Página "Legales" (si WordPress no tiene la página, se usa la local) */
export async function getLegalPage(): Promise<LegalPage> {
	if (fromWordPress) {
		const page = await wordpress.fetchLegalPage();
		if (page) return page;
		console.warn('[WordPress] No existe la página "legales": se usa el texto local (src/data/legal.ts).');
	}
	return localLegalPage;
}
