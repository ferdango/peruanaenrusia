/**
 * Blog — publicaciones (videos + artículos)
 * --------------------------------------------------------------------------
 * Une los videos (src/data/videos.ts) y los artículos (src/data/articles.ts)
 * en una sola lista de "publicaciones" para:
 *   - Portada del blog → "Novedades" (publicaciones con `featured: true`)
 *   - /blog/[slug]/    → una página por publicación
 *   - "Temas relacionados" al final de cada publicación
 *
 * Para agregar contenido no se edita este archivo: agrega el video o el
 * artículo en su archivo de datos y aparece aquí automáticamente.
 */
import type { ImageMetadata } from 'astro';

import { articles, type Article } from './articles';
import { routes } from './navigation';
import { videos, type Video } from './videos';

/** Anclas (id) de las secciones de la portada del blog */
export const blogSectionIds = {
	news: 'novedades',
	videoblogs: 'videoblogs',
	classics: 'clasicos',
} as const;

/** Categoría de los videos: enlace "← VideoBlogs" en la página de cada video */
export const videoCategory = {
	label: 'VideoBlogs',
	href: `${routes.blog}#${blogSectionIds.videoblogs}`,
};

interface BlogPostBase {
	slug: string;
	title: string;
	/** Fecha de publicación (AAAA-MM-DD) */
	date: string;
	/** Imagen de la tarjeta (miniatura del video o foto del artículo) */
	image: ImageMetadata;
	/** Etiqueta de la categoría (se muestra en "Temas relacionados") */
	category: string;
}

/** Publicación del blog: un video o un artículo, con los datos comunes de las tarjetas */
export type BlogPost =
	(BlogPostBase & { type: 'video'; video: Video }) | (BlogPostBase & { type: 'article'; article: Article });

const fromVideo = (video: Video): BlogPost => ({
	type: 'video',
	slug: video.slug,
	title: video.title,
	date: video.date,
	image: video.thumbnail,
	category: videoCategory.label,
	video,
});

const fromArticle = (article: Article): BlogPost => ({
	type: 'article',
	slug: article.slug,
	title: article.title,
	date: article.date,
	image: article.image,
	category: article.category,
	article,
});

/** Todas las publicaciones, de la más reciente a la más antigua */
export const blogPosts: BlogPost[] = [...videos.map(fromVideo), ...articles.map(fromArticle)].sort((a, b) =>
	b.date.localeCompare(a.date),
);

// Un video y un artículo no pueden compartir slug (tendrían la misma URL)
const repeatedSlugs = blogPosts
	.map((post) => post.slug)
	.filter((slug, index, slugs) => slugs.indexOf(slug) !== index);

if (repeatedSlugs.length > 0) {
	throw new Error(
		`[blog] Hay publicaciones con el mismo slug: ${repeatedSlugs.join(', ')}. ` +
			'Cambia el slug en src/data/videos.ts o src/data/articles.ts.',
	);
}

/** ¿La publicación está marcada como destacada? */
const isFeatured = (post: BlogPost) => (post.type === 'video' ? post.video.featured : post.article.featured);

/**
 * Publicaciones de "Novedades": las marcadas con `featured: true`.
 * Si ninguna está marcada, se muestran las 6 más recientes.
 */
export function getFeaturedPosts(): BlogPost[] {
	const featured = blogPosts.filter(isFeatured);
	return featured.length > 0 ? featured : blogPosts.slice(0, 6);
}

/** Artículos de "Clásicos" (`classic: true`), en el orden de src/data/articles.ts */
export function getClassicArticles(): Article[] {
	return articles.filter((article) => article.classic);
}

/** "Temas relacionados": las publicaciones más recientes, sin la actual */
export function getRelatedPosts(currentSlug: string, limit = 6): BlogPost[] {
	return blogPosts.filter((post) => post.slug !== currentSlug).slice(0, limit);
}
