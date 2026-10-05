/**
 * Comunidad (fotos de los estudiantes)
 * --------------------------------------------------------------------------
 * Fuente de datos de:
 *   - Home → "Mira cómo estamos revolucionando vidas" (`communityMoments`)
 *
 * Para agregar un momento: guarda la foto en src/assets/images/, impórtala
 * aquí y añade un objeto con la imagen (`image`), su descripción (`alt`), el
 * texto sobre la foto (`caption`), la casilla del mosaico (`area`) y, si es un
 * video del canal, su `youtubeId`. Usa fotos con autorización de las personas
 * que aparecen.
 */
import type { ImageMetadata } from 'astro';

import arrivalPhoto from '@assets/images/home/community-grid-arrival.jpg';
import caucasusPhoto from '@assets/images/videos/visita-universidad-federal-del-caucaso.jpg';
import uralsPhoto from '@assets/images/videos/visita-universidad-federal-de-los-urales.jpg';
import russianHousePhoto from '@assets/images/videos/becas-rusas-casa-rusa.jpg';
import redSquarePhoto from '@assets/images/videos/como-estudiar-en-rusia-2026.jpg';
import kazanPhoto from '@assets/images/videos/manual-como-estudiar-en-rusia-becado.jpg';

export interface CommunityPhoto {
	image: ImageMetadata;
	/** Descripción de la foto para lectores de pantalla */
	alt: string;
}

// ----- Foto de la llegada (tomada del diseño) -----

const arrival: CommunityPhoto = {
	image: arrivalPhoto,
	alt: 'Grupo de estudiantes con la bandera de Peruana en Rusia a su llegada al aeropuerto',
};

/** Momento del mosaico "Mira cómo estamos revolucionando vidas" */
export interface CommunityMoment extends CommunityPhoto {
	/** Dónde o qué pasó (se muestra sobre la foto) */
	caption: string;
	/** Video de YouTube del momento: la foto lo reproduce en el modal del sitio */
	youtubeId?: string;
	/** Casilla del mosaico en desktop (ver HomeCommunityGrid) */
	area: 'hero' | 'tall' | 'a' | 'b' | 'c' | 'd';
}

/**
 * "Mira cómo estamos revolucionando vidas": momentos reales de la comunidad.
 * Las fotos de las visitas y charlas son miniaturas de los videos del canal
 * oficial de YouTube (al pulsarlas se reproduce el video).
 */
export const communityMoments: CommunityMoment[] = [
	{ ...arrival, caption: 'Llegada de nuestros becados a Rusia', area: 'hero' },
	{
		image: uralsPhoto,
		alt: 'Kristal con la bandera de Peruana en Rusia frente a la Universidad Federal de los Urales',
		caption: 'Universidad Federal de los Urales',
		youtubeId: 'TRUwNVqd7jU',
		area: 'tall',
	},
	{
		image: caucasusPhoto,
		alt: 'Kristal con la bandera de Peruana en Rusia frente a la Universidad Federal del Cáucaso',
		caption: 'Universidad Federal del Cáucaso',
		youtubeId: 'jH2ytfxZMXw',
		area: 'a',
	},
	{
		image: russianHousePhoto,
		alt: 'Kristal y la directora de la Casa Rusa junto a las banderas de Rusia y del Perú',
		caption: 'Charla de becas en la Casa Rusa',
		youtubeId: 'Rdpxv0K8g3Q',
		area: 'b',
	},
	{
		image: redSquarePhoto,
		alt: 'Kristal en la Plaza Roja nevada, frente a la Catedral de San Basilio',
		caption: 'Invierno en la Plaza Roja',
		youtubeId: '_yIierlvxvQ',
		area: 'c',
	},
	{
		image: kazanPhoto,
		alt: 'Conferencia de prensa en Kazán con Kristal en el panel',
		caption: 'Conferencia en Kazán',
		youtubeId: 'FOO3oyM2PMc',
		area: 'd',
	},
];
