/**
 * Redes sociales — videos de TikTok
 * --------------------------------------------------------------------------
 * Fuente de datos de:
 *   - Home → "Redes sociales" (slider de videos de TikTok, antes de
 *     "Más historias")
 *
 * Son videos reales de la cuenta oficial "Kristal | Peruana en Rusia"
 * (https://www.tiktok.com/@peruanaenrusia). Al pulsar uno se reproduce en el
 * modal del sitio con el reproductor oficial de TikTok; sin JavaScript abre
 * el video en TikTok.
 *
 * Para agregar un video:
 *   1. Copia el número de su URL: tiktok.com/@peruanaenrusia/video/NÚMERO.
 *   2. Guarda su portada en src/assets/images/social/ (vertical 9:16,
 *      540 × 960 px). Se puede descargar desde
 *      https://www.tiktok.com/oembed?url=URL_DEL_VIDEO (campo thumbnail_url).
 *   3. Agrega un objeto a `tiktokPosts` con el número, el texto corto y,
 *      si quieres, las reproducciones tal como las muestra TikTok.
 *
 * Seguidores, "me gusta" y reproducciones son una foto del 2026-10-05:
 * actualízalos de vez en cuando.
 */
import type { ImageMetadata } from 'astro';

import { site } from './site';
import avatar from '@assets/images/social/tiktok-avatar.jpg';
import coverStudyAsLatino from '@assets/images/social/tiktok-7608001559082831124.jpg';
import coverRacism from '@assets/images/social/tiktok-7642922796825496853.jpg';
import coverGraduation from '@assets/images/social/tiktok-7659624932476816661.jpg';
import coverBestAdvice from '@assets/images/social/tiktok-7642922792832519445.jpg';
import coverTruth from '@assets/images/social/tiktok-7626180090266782997.jpg';
import coverSafety from '@assets/images/social/tiktok-7635277713447767317.jpg';
import coverFood from '@assets/images/social/tiktok-7642922810494520596.jpg';
import coverUniversity from '@assets/images/social/tiktok-7661208449019071764.jpg';

export interface TikTokPost {
	/** Número del video (el de su URL: tiktok.com/@cuenta/video/NÚMERO) */
	id: string;
	/** Texto corto del video (sin hashtags) */
	caption: string;
	/** Reproducciones tal como las muestra TikTok (ej. "1,2 M"), opcional */
	views?: string;
	/** Portada vertical 9:16 */
	cover: ImageMetadata;
}

/** Perfil de TikTok (el enlace sale de src/data/site.ts) */
export const tiktokProfile = {
	name: 'Kristal | Peruana en Rusia',
	handle: '@peruanaenrusia',
	url: site.socials.find((social) => social.icon === 'tiktok')?.href ?? 'https://www.tiktok.com/',
	followers: '150,4 mil',
	likes: '1,6 M',
	avatar,
};

/** Enlace de un video de TikTok */
export const tiktokPostUrl = (id: string) => `${tiktokProfile.url.replace(/\/$/, '')}/video/${id}`;

export const tiktokPosts: TikTokPost[] = [
	{
		id: '7608001559082831124',
		caption: '¿Cómo estudiar en Rusia y viajar a Rusia siendo latino?',
		views: '1,2 M',
		cover: coverStudyAsLatino,
	},
	{
		id: '7642922796825496853',
		caption: '¿Hay racismo en Rusia? Te contamos la realidad',
		views: '4,5 M',
		cover: coverRacism,
	},
	{
		id: '7659624932476816661',
		caption: '¡Me gradué en Rusia! Terminé mi carrera universitaria',
		views: '140,1 mil',
		cover: coverGraduation,
	},
	{
		id: '7642922792832519445',
		caption: 'El mejor consejo para estudiar en Rusia',
		views: '208,8 mil',
		cover: coverBestAdvice,
	},
	{
		id: '7626180090266782997',
		caption: 'La verdad sobre Rusia: la vida de las latinas en el extranjero',
		views: '194,5 mil',
		cover: coverTruth,
	},
	{
		id: '7635277713447767317',
		caption: '¿Es seguro estudiar en Rusia? Un alumno cuenta su experiencia',
		views: '93,4 mil',
		cover: coverSafety,
	},
	{
		id: '7642922810494520596',
		caption: '¿Qué comida hay en Rusia?',
		views: '45,6 mil',
		cover: coverFood,
	},
	{
		id: '7661208449019071764',
		caption: '¿Cómo es una universidad en Rusia?',
		views: '9,5 mil',
		cover: coverUniversity,
	},
];
