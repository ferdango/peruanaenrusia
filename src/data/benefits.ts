/**
 * Beneficios ("¿Por qué elegir Peruana en Rusia?")
 * --------------------------------------------------------------------------
 * Fuente de datos de:
 *   - Home → "¿Por qué elegir Peruana en Rusia?" (carrusel de tarjetas)
 *
 * Para agregar un beneficio: añade un objeto con su título, texto e imagen.
 * La imagen va en src/assets/images/home/ y se muestra en un recuadro de
 * 366 × 248 px (expórtala a 732 × 496 px para pantallas de alta densidad).
 *
 * En `title` puedes usar "\n" para forzar un salto de línea (como en Figma).
 */
import type { ImageMetadata } from 'astro';

import imageStudents from '@assets/images/home/why-us-students.jpg';
import imageAdvisory from '@assets/images/home/why-us-advisory.jpg';
import imageSupport from '@assets/images/home/why-us-support.jpg';
import avatar1 from '@assets/images/home/why-us-avatar-1.png';
import avatar2 from '@assets/images/home/why-us-avatar-2.png';
import avatar3 from '@assets/images/home/why-us-avatar-3.png';
import avatar4 from '@assets/images/home/why-us-avatar-4.png';

export interface Benefit {
	title: string;
	text: string;
	/** Foto de la tarjeta (366 × 248 px; composición de la marca con la persona) */
	image: ImageMetadata;
}

/**
 * Fotos de estudiantes junto a "+100 estudiantes cambiaron sus vidas".
 * Círculos de 48 px con el borde celeste incluido en la imagen (PNG de 96 × 96 px).
 */
export const studentAvatars: ImageMetadata[] = [avatar1, avatar2, avatar3, avatar4];

export const benefits: Benefit[] = [
	{
		title: 'De estudiantes\npara estudiantes',
		text: 'Te acompañamos en cada paso para ganar tu beca y vivir la experiencia que transformará tu vida.',
		image: imageStudents,
	},
	{
		title: 'Asesorías personalizadas',
		text: 'Te acompañamos en cada paso para ganar tu beca y vivir la experiencia que transformará tu vida.',
		image: imageAdvisory,
	},
	{
		title: 'Acompañamiento completo',
		text: 'Te acompañamos en cada paso para ganar tu beca y vivir la experiencia que transformará tu vida.',
		image: imageSupport,
	},
];
