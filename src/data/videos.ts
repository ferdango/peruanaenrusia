/**
 * Videos (historias y videoblogs)
 * --------------------------------------------------------------------------
 * Fuente de datos de:
 *   - Home → "Más historias"
 *   - Blog → secciones de video
 *   - /blog/[slug]/ → página de cada video
 *
 * Para agregar un video: copia un objeto, cambia `slug`, `title`, `date`
 * (formato AAAA-MM-DD) y `youtubeId` (el código que aparece en la URL de
 * YouTube: https://www.youtube.com/watch?v=CODIGO).
 *
 * ⚠️ CONTENIDO DE EJEMPLO: títulos, fechas y miniatura son de referencia
 * (la miniatura viene del diseño). Reemplázalos por los videos reales.
 */
import type { ImageMetadata } from 'astro';

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
}

export const videos: Video[] = [
	{ slug: 'ep1-conoce-peru', title: 'EP1: Conoce PeRu', date: '2025-05-07', thumbnail: thumbnailEp1 },
	{ slug: 'ep2-conoce-peru', title: 'EP2: Conoce PeRu', date: '2025-05-14', thumbnail: thumbnailEp1 },
	{ slug: 'ep3-conoce-peru', title: 'EP3: Conoce PeRu', date: '2025-05-21', thumbnail: thumbnailEp1 },
	{ slug: 'ep4-conoce-peru', title: 'EP4: Conoce PeRu', date: '2025-05-28', thumbnail: thumbnailEp1 },
	{ slug: 'ep5-conoce-peru', title: 'EP5: Conoce PeRu', date: '2025-06-04', thumbnail: thumbnailEp1 },
];

/** Busca un video por su slug */
export function getVideo(slug: string): Video | undefined {
	return videos.find((video) => video.slug === slug);
}
