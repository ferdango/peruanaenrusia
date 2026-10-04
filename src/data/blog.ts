/**
 * Blog — publicaciones (videos + artículos)
 * --------------------------------------------------------------------------
 * Une los videos y los artículos en una sola lista de "publicaciones" para:
 *   - Portada del blog → "Novedades" (publicaciones destacadas)
 *   - /blog/[slug]/    → una página por publicación
 *   - "Temas relacionados" al final de cada publicación
 *
 * Los videos y artículos vienen de la capa de contenido (src/lib/content/):
 * de WordPress si está configurado o, si no, de src/data/videos.ts y
 * src/data/articles.ts. Para agregar contenido no se edita este archivo.
 */
import type { ImageSource } from '@lib/content/images';

import type { Article } from './articles';
import { routes } from './navigation';
import type { Video } from './videos';

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
	image: ImageSource;
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

/**
 * Une videos y artículos en publicaciones, de la más reciente a la más antigua.
 * Falla si dos publicaciones comparten slug (tendrían la misma URL).
 */
export function buildBlogPosts(videos: Video[], articles: Article[]): BlogPost[] {
	const posts = [...videos.map(fromVideo), ...articles.map(fromArticle)].sort((a, b) =>
		b.date.localeCompare(a.date),
	);

	const repeatedSlugs = posts
		.map((post) => post.slug)
		.filter((slug, index, slugs) => slugs.indexOf(slug) !== index);

	if (repeatedSlugs.length > 0) {
		throw new Error(
			`[blog] Hay publicaciones con el mismo slug: ${repeatedSlugs.join(', ')}. ` +
				'Cambia el slug del video o del artículo.',
		);
	}

	return posts;
}

/** ¿La publicación está marcada como destacada? */
const isFeatured = (post: BlogPost) => (post.type === 'video' ? post.video.featured : post.article.featured);

/**
 * Publicaciones de "Novedades": las destacadas.
 * Si ninguna está marcada, se muestran las 6 más recientes.
 */
export function selectFeaturedPosts(posts: BlogPost[]): BlogPost[] {
	const featured = posts.filter(isFeatured);
	return featured.length > 0 ? featured : posts.slice(0, 6);
}

/** "Temas relacionados": las publicaciones más recientes, sin la actual */
export function selectRelatedPosts(posts: BlogPost[], currentSlug: string, limit = 6): BlogPost[] {
	return posts.filter((post) => post.slug !== currentSlug).slice(0, limit);
}
