/**
 * Cursos gratuitos
 * --------------------------------------------------------------------------
 * Fuente de datos de:
 *   - Home → "Cursos gratuitos" (HomeCourses)
 *
 * Para agregar un curso: añade un objeto a la lista `freeCourses`. Si el
 * curso es un video de YouTube, basta con su código (`youtubeId`): de ahí
 * salen el enlace y la miniatura. "Ver curso" siempre abre en una pestaña
 * nueva.
 */
import type { RemoteImage } from '@lib/content/images';
import { site } from './site';

export interface FreeCourse {
	title: string;
	description: string;
	/** Formato del curso (por ahora todos son en video) */
	format: 'video';
	/** Código del video en YouTube (el de su URL: youtube.com/watch?v=CODIGO) */
	youtubeId?: string;
	/** Enlace del curso cuando no es un video de YouTube */
	href?: string;
	/** Duración que se muestra en la tarjeta (ej. "45 min", opcional) */
	duration?: string;
}

/** Canal de YouTube de la marca (enlace de respaldo) */
const youtubeChannel =
	site.socials.find((social) => social.icon === 'youtube')?.href ?? 'https://www.youtube.com/';

export const freeCourses: FreeCourse[] = [
	{
		// TODO: reemplazar por el nombre real del curso y su `youtubeId`; mientras
		// tanto, "Ver curso" abre el canal de YouTube de la marca.
		title: 'Curso gratuito en video',
		description:
			'Míralo completo en nuestro canal de YouTube, a tu ritmo y desde donde estés. Es gratis y no necesitas registrarte.',
		format: 'video',
	},
];

/** Enlace del curso: su video de YouTube, su enlace o el canal de la marca */
export function courseUrl(course: FreeCourse): string {
	if (course.youtubeId) return `https://www.youtube.com/watch?v=${course.youtubeId}`;
	return course.href ?? youtubeChannel;
}

/**
 * Miniatura del video de YouTube del curso (si tiene `youtubeId`). Es 4:3 con
 * franjas negras: en el recuadro 16:9 de la tarjeta (object-fit: cover)
 * quedan fuera.
 */
export function courseThumbnail(course: FreeCourse): RemoteImage | undefined {
	if (!course.youtubeId) return undefined;
	return { src: `https://i.ytimg.com/vi/${course.youtubeId}/hqdefault.jpg`, width: 480, height: 360 };
}
