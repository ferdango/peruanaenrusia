/**
 * Videos (historias y videoblogs)
 * --------------------------------------------------------------------------
 * Fuente de datos de:
 *   - Home → "Más historias"
 *   - Blog → "Novedades" (videos y artículos con `featured: true`) y
 *     "Videoblogs" (todos los videos, del más reciente al más antiguo)
 *   - /blog/[slug]/ → página de cada video
 *
 * Para agregar un video: copia un objeto, cambia `slug`, `title`, `date`
 * (formato AAAA-MM-DD) y `youtubeId` (el código que aparece en la URL de
 * YouTube: https://www.youtube.com/watch?v=CODIGO).
 *
 * Mientras un video no tenga `youtubeId`, su página muestra la miniatura y
 * el botón ▶ abre el canal de YouTube de la marca (src/data/site.ts).
 *
 * El `slug` no puede repetirse con el de un artículo (src/data/articles.ts):
 * ambos comparten la ruta /blog/{slug}/.
 *
 * ⚠️ CONTENIDO DE EJEMPLO: títulos, fechas, autor y miniatura son de
 * referencia (la miniatura viene del diseño). Reemplázalos por los videos
 * reales.
 */
import type { ImageMetadata } from 'astro';

import type { AuthorId } from './authors';
import thumbnailEp1 from '@assets/images/videos/conoce-peru-ep1.jpg';

export interface Video {
	/** Identificador único, se usa en la URL: /blog/{slug}/ */
	slug: string;
	title: string;
	/** Fecha de publicación (AAAA-MM-DD) */
	date: string;
	thumbnail: ImageMetadata;
	/** Código del video en YouTube (opcional mientras no esté publicado) */
	youtubeId?: string;
	/** Autor (clave de src/data/authors.ts). Si se omite, no se muestra */
	author?: AuthorId;
	/** Resumen corto para buscadores y redes sociales (opcional) */
	description?: string;
	/** true = aparece en "Novedades" (portada del blog) */
	featured?: boolean;
}

export const videos: Video[] = [
	{
		slug: 'ep1-conoce-peru',
		title: 'EP1: Conoce PeRu',
		date: '2025-05-07',
		thumbnail: thumbnailEp1,
		author: 'jose-quinteros',
		featured: true,
	},
	{
		slug: 'ep2-conoce-peru',
		title: 'EP2: Conoce PeRu',
		date: '2025-05-14',
		thumbnail: thumbnailEp1,
		author: 'jose-quinteros',
		featured: true,
	},
	{
		slug: 'ep3-conoce-peru',
		title: 'EP3: Conoce PeRu',
		date: '2025-05-21',
		thumbnail: thumbnailEp1,
		author: 'jose-quinteros',
	},
	{
		slug: 'ep4-conoce-peru',
		title: 'EP4: Conoce PeRu',
		date: '2025-05-28',
		thumbnail: thumbnailEp1,
		author: 'jose-quinteros',
	},
	{
		slug: 'ep5-conoce-peru',
		title: 'EP5: Conoce PeRu',
		date: '2025-06-04',
		thumbnail: thumbnailEp1,
		author: 'jose-quinteros',
	},
];

/** Busca un video por su slug */
export function getVideo(slug: string): Video | undefined {
	return videos.find((video) => video.slug === slug);
}

/** Videos ordenados del más reciente al más antiguo */
export function getVideosByDate(): Video[] {
	return [...videos].sort((a, b) => b.date.localeCompare(a.date));
}
