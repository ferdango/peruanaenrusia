/**
 * Videos (historias y videoblogs)
 * --------------------------------------------------------------------------
 * Fuente de datos de:
 *   - Home → "Más historias"
 *   - Blog → "Novedades" (videos y artículos con `featured: true`) y
 *     "Videoblogs" (todos los videos, del más reciente al más antiguo)
 *   - /blog/[slug]/ → página de cada video
 *
 * Son los videos del canal oficial de YouTube "Kristal | Peruana en Rusia"
 * (https://www.youtube.com/@peruanaenrusia), con su miniatura oficial
 * (src/assets/images/videos/, 1280 × 720). Con WordPress llegan desde el CMS
 * y esta lista queda como respaldo.
 *
 * Para agregar un video: copia un objeto, cambia `slug`, `title`, `date`
 * (formato AAAA-MM-DD), `duration` y `youtubeId` (el código que aparece en la
 * URL de YouTube: https://www.youtube.com/watch?v=CODIGO). La miniatura se
 * descarga de https://i.ytimg.com/vi/CODIGO/maxresdefault.jpg.
 *
 * Mientras un video no tenga `youtubeId`, su página muestra la miniatura y
 * el botón ▶ abre el canal de YouTube de la marca (src/data/site.ts).
 *
 * El `slug` no puede repetirse con el de un artículo (src/data/articles.ts):
 * ambos comparten la ruta /blog/{slug}/.
 */
import type { ImageSource } from '@lib/content/images';

import { authors, type Author } from './authors';
import thumbStudyInRussia from '@assets/images/videos/como-estudiar-en-rusia-2026.jpg';
import thumbCaucasus from '@assets/images/videos/visita-universidad-federal-del-caucaso.jpg';
import thumbUrals from '@assets/images/videos/visita-universidad-federal-de-los-urales.jpg';
import thumbSuccessCase from '@assets/images/videos/caso-de-exito-becado-en-rusia.jpg';
import thumbThisIsRussia from '@assets/images/videos/esto-es-rusia.jpg';
import thumbRussianScholarships from '@assets/images/videos/becas-rusas-casa-rusa.jpg';
import thumbScholarshipGuide from '@assets/images/videos/manual-como-estudiar-en-rusia-becado.jpg';
import thumbMother from '@assets/images/videos/mama-de-peruana-becada-en-rusia.jpg';
import featuredVideoCover from '@assets/images/home/featured-video-cover.jpg';

export interface Video {
	/** Identificador único, se usa en la URL: /blog/{slug}/ */
	slug: string;
	title: string;
	/** Fecha de publicación (AAAA-MM-DD) */
	date: string;
	thumbnail: ImageSource;
	/** Código del video en YouTube (opcional mientras no esté publicado) */
	youtubeId?: string;
	/** Duración que se muestra sobre la miniatura (ej. "8:31", opcional) */
	duration?: string;
	/** Autor (nombre y foto). Si se omite, no se muestra */
	author?: Author;
	/** Resumen corto para buscadores y redes sociales (opcional) */
	description?: string;
	/** true = aparece en "Novedades" (portada del blog) */
	featured?: boolean;
}

export const videos: Video[] = [
	{
		slug: 'visita-universidad-federal-del-caucaso',
		title: 'Mi visita a la Universidad Federal del Cáucaso',
		date: '2026-07-06',
		duration: '8:31',
		thumbnail: thumbCaucasus,
		youtubeId: 'jH2ytfxZMXw',
		author: authors['grecia-kristal'],
		description:
			'Te llevo a conocer una de las universidades rusas y te muestro cómo es realmente estudiar allí.',
		featured: true,
	},
	{
		slug: 'visita-universidad-federal-de-los-urales',
		title: 'Mi visita a la Universidad Federal de los Urales (URFU)',
		date: '2026-02-13',
		duration: '7:57',
		thumbnail: thumbUrals,
		youtubeId: 'TRUwNVqd7jU',
		author: authors['grecia-kristal'],
		description:
			'¿Cómo es estudiar en Rusia? Un tour completo por la URFU, una de las universidades más importantes del país.',
	},
	{
		slug: 'caso-de-exito-becado-en-rusia',
		title: 'Caso de éxito: becado en Rusia gracias a Peruana en Rusia',
		date: '2026-01-22',
		duration: '1:21',
		thumbnail: thumbSuccessCase,
		youtubeId: 'A_tz23sIFXk',
		author: authors['grecia-kristal'],
		description: 'Así ganó la beca para estudiar en el extranjero uno de nuestros estudiantes.',
	},
	{
		slug: 'como-estudiar-en-rusia-2026',
		title: '¿Cómo estudiar en Rusia? 2026',
		date: '2026-01-16',
		duration: '2:19',
		thumbnail: thumbStudyInRussia,
		youtubeId: '_yIierlvxvQ',
		author: authors['grecia-kristal'],
		description:
			'Cómo estudiar en Rusia y viajar siendo latino: mi experiencia como estudiante en el extranjero.',
		featured: true,
	},
	{
		slug: 'esto-es-rusia',
		title: 'Esto es Rusia… lo demás es mentira',
		date: '2025-12-22',
		duration: '8:00',
		thumbnail: thumbThisIsRussia,
		youtubeId: 'Cfkx6RNB_2I',
		author: authors['grecia-kristal'],
		description: 'La Rusia real, sin mitos: así se vive en el país donde estudiamos.',
	},
	{
		slug: 'becas-rusas-casa-rusa',
		title: 'Becas rusas: la directora de la Casa Rusa nos explica todo',
		date: '2025-03-24',
		duration: '7:51',
		thumbnail: thumbRussianScholarships,
		youtubeId: 'Rdpxv0K8g3Q',
		author: authors['grecia-kristal'],
		description: 'La directora de la Casa Rusa nos cuenta todo sobre las becas rusas en Perú.',
		featured: true,
	},
	{
		slug: 'mama-de-peruana-becada-en-rusia',
		title: 'Mamá de peruana becada en Rusia: «No le cortes las alas a tu hijo»',
		date: '2025-03-11',
		duration: '12:58',
		thumbnail: thumbMother,
		youtubeId: 'U4zZhsLtsn0',
		author: authors['grecia-kristal'],
		description: 'Mi mamá cuenta qué se siente tener una hija que estudia en el extranjero.',
	},
	{
		slug: 'manual-como-estudiar-en-rusia-becado',
		title: 'Manual de cómo estudiar en Rusia becado',
		date: '2025-02-13',
		duration: '12:55',
		thumbnail: thumbScholarshipGuide,
		youtubeId: 'FOO3oyM2PMc',
		author: authors['grecia-kristal'],
		description: 'Todo lo que necesitas saber para estudiar en Rusia con beca.',
	},
];

/**
 * Video destacado del Home
 * --------------------------------------------------------------------------
 * Lo reproducen el botón "Ver video" y la tarjeta flotante del hero, y la
 * sección "Te acompañamos". Se abre en el modal con mini reproductor
 * (src/components/overlays/VideoModal.astro): se puede minimizar y seguir
 * navegando mientras se ve.
 *
 * Para cambiarlo: escribe el código de YouTube del nuevo video en `youtubeId`
 * (https://www.youtube.com/watch?v=CODIGO), su título y duración, y reemplaza
 * la portada (src/assets/images/home/featured-video-cover.jpg, 1280 × 720).
 */
export const featuredVideo = {
	title: '¿Cómo estudiar en Rusia? 2026',
	youtubeId: '_yIierlvxvQ',
	channel: 'Kristal | Peruana en Rusia',
	duration: '2:19',
	cover: featuredVideoCover,
	/** Enlace de respaldo (sin JavaScript se abre YouTube) */
	get url() {
		return `https://www.youtube.com/watch?v=${this.youtubeId}`;
	},
};
