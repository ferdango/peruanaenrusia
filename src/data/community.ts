/**
 * Comunidad (fotos de los estudiantes)
 * --------------------------------------------------------------------------
 * Fuente de datos de:
 *   - Home → "Mira cómo estamos revolucionando vidas" (`communityGridPhotos`)
 *   - Home → "Una comunidad que cambia vidas" (`communityGalleryPhotos`)
 *
 * Para agregar una foto: guárdala en src/assets/images/home/, impórtala aquí
 * y añade un objeto con la imagen (`image`) y su descripción (`alt`).
 *
 * ⚠️ CONTENIDO DE EJEMPLO: el diseño repite las mismas fotos. Reemplázalas por
 * fotos reales de la comunidad (con autorización de las personas que aparecen).
 */
import type { ImageMetadata } from 'astro';

import arrivalPhoto from '@assets/images/home/community-grid-arrival.jpg';
import kremlinPhoto from '@assets/images/home/community-kremlin.jpg';
import spiefPhoto from '@assets/images/home/community-spief.jpg';

export interface CommunityPhoto {
	image: ImageMetadata;
	/** Descripción de la foto para lectores de pantalla */
	alt: string;
	/** Enlace opcional (ej. la publicación o el reel de Instagram). Si existe, la foto es clicable */
	href?: string;
	/** Muestra el ícono de Instagram sobre la foto (como la primera foto del diseño) */
	instagram?: boolean;
	/** true = la publicación es un video (reel): en móvil se muestra el botón ▶ */
	video?: boolean;
}

// ----- Fotos de ejemplo (tomadas del diseño) -----

const arrival: CommunityPhoto = {
	image: arrivalPhoto,
	alt: 'Grupo de estudiantes con la bandera de Peruana en Rusia a su llegada al aeropuerto',
};

const spief: CommunityPhoto = {
	image: spiefPhoto,
	alt: 'Estudiante junto al letrero del Foro Económico Internacional de San Petersburgo (SPIEF 2024)',
};

const kremlin: CommunityPhoto = {
	image: kremlinPhoto,
	alt: 'Estudiante en el centro histórico de Moscú, junto al Kremlin',
};

/**
 * "Mira cómo estamos revolucionando vidas".
 * Las fotos se agrupan de 2 en 2 en columnas (una alta y una baja, alternadas).
 * Con 14 fotos hay 7 columnas: en desktop se ven 4 a la vez.
 */
export const communityGridPhotos: CommunityPhoto[] = Array.from({ length: 14 }, () => arrival);

/** "Una comunidad que cambia vidas": fotos verticales en carrusel */
export const communityGalleryPhotos: CommunityPhoto[] = [
	{ ...spief, instagram: true },
	{ ...kremlin, video: true },
	spief,
	{ ...kremlin, video: true },
	spief,
	{ ...kremlin, video: true },
	spief,
];
