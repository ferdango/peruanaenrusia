/**
 * Casos de éxito (testimonios de estudiantes)
 * --------------------------------------------------------------------------
 * Fuente de datos de:
 *   - Home → "Nuestros casos de éxito"
 *   - /casos-de-exito/[slug]/ → historia completa de cada estudiante
 *
 * Para agregar un testimonio: añade un objeto a la lista `testimonials` con su
 * `slug`, textos e imágenes (en src/assets/images/testimonials/).
 *
 * La página de la historia completa muestra solo las secciones con datos:
 * los campos de "Historia completa" (headline, portrait, video, highlight,
 * story, gallery, closing) son opcionales.
 *
 * ⚠️ CONTENIDO DE EJEMPLO: por ahora la lista repite el caso de ejemplo del
 * diseño ("Alexis Rojas"), con sus fotos y textos de relleno (lorem ipsum).
 * Reemplázalo por testimonios reales y autorizados por cada estudiante antes
 * de publicar el sitio.
 */
import type { ImageMetadata } from 'astro';

import type { CountryCode } from '@data/countries';

import avatarExample from '@assets/images/testimonials/avatar-alexis-rojas.png';
import avatarExampleHighlighted from '@assets/images/testimonials/avatar-student-2.png';
import portraitExample from '@assets/images/testimonials/case-portrait-red-sweater.jpg';
import videoPosterExample from '@assets/images/testimonials/case-video-poster.jpg';
import stepCouple from '@assets/images/testimonials/case-step-couple-campus.jpg';
import stepGirlPhone from '@assets/images/testimonials/case-step-girl-phone.jpg';
import stepPortrait from '@assets/images/testimonials/case-step-portrait-red-sweater.jpg';
import stepStudentPhone from '@assets/images/testimonials/case-step-student-phone.jpg';
import galleryEconomicForum from '@assets/images/testimonials/case-gallery-economic-forum.jpg';
import galleryRedSquare from '@assets/images/testimonials/case-gallery-red-square.jpg';

/** Foto con su texto alternativo (describe lo que se ve en la imagen) */
export interface TestimonialPhoto {
	src: ImageMetadata;
	alt: string;
}

/** Foto de la tira de publicaciones (estilo Instagram) */
export interface TestimonialGalleryItem extends TestimonialPhoto {
	/** Enlace a la publicación (si no hay, se enlaza el perfil de Instagram de la marca) */
	href?: string;
	/** true = publicación con varias fotos (muestra el ícono de "varias fotos") */
	album?: boolean;
}

/** Casilla del mosaico "Cómo lo logré": un texto o una foto */
export type TestimonialStoryTile = { title: string; text: string } | { photo: TestimonialPhoto };

/**
 * Bloque del mosaico "Cómo lo logré: el paso a paso":
 * una foto grande + 4 casillas pequeñas (2 × 2). En el diseño, la foto grande
 * va a la derecha en el primer bloque y a la izquierda en el segundo.
 */
export interface TestimonialStoryBlock {
	photo: TestimonialPhoto;
	/** 4 casillas, en orden de lectura (fila 1: 1-2 · fila 2: 3-4) */
	tiles: TestimonialStoryTile[];
}

export interface Testimonial {
	/** Identificador único, se usa en la URL: /casos-de-exito/{slug}/ */
	slug: string;
	name: string;
	/** Carrera y universidad, ej. "Estudiante de Medicina en la Universidad de Moscú" */
	role: string;
	country: CountryCode;
	avatar: ImageMetadata;
	/** Frase corta que se muestra en la tarjeta */
	quote: string;

	// ----- Historia completa (/casos-de-exito/{slug}/) · todo opcional -----

	/** Frase grande de la portada (sin comillas) */
	headline?: string;
	/** Foto grande de la portada */
	portrait?: TestimonialPhoto;
	/** Video "Conoce mi historia": miniatura + enlace (YouTube). Sin `url`, el botón ▶ abre el canal de YouTube */
	video?: {
		poster: TestimonialPhoto;
		url?: string;
	};
	/** Cita destacada sobre la forma celeste (sin comillas) */
	highlight?: string;
	/** Mosaico "Cómo lo logré: el paso a paso" */
	story?: TestimonialStoryBlock[];
	/** Tira de fotos (publicaciones de Instagram) */
	gallery?: TestimonialGalleryItem[];
	/** Cierre junto al segundo video: cita (sin comillas) + párrafo */
	closing?: {
		quote: string;
		text: string;
	};
}

// ----- Fotos del caso de ejemplo (vienen del diseño) -----

const photos = {
	couple: { src: stepCouple, alt: 'Dos estudiantes conversando frente a un edificio universitario' },
	girlPhone: { src: stepGirlPhone, alt: 'Estudiante con su celular en una plaza de una ciudad rusa' },
	portrait: { src: stepPortrait, alt: 'Estudiante sonriendo en una sala iluminada con una lámpara' },
	studentPhone: { src: stepStudentPhone, alt: 'Estudiante con mochila revisando su celular en el campus' },
	redSquare: {
		src: galleryRedSquare,
		alt: 'Estudiante posando en las escaleras frente a la Plaza Roja de Moscú',
	},
	economicForum: {
		src: galleryEconomicForum,
		alt: 'Estudiante apoyada en el muro del Foro Económico Internacional de San Petersburgo',
	},
} satisfies Record<string, TestimonialPhoto>;

/** Texto de relleno del diseño para las casillas "Mi historia" */
const storyStep = {
	title: 'Mi historia',
	text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis nato deddeded asas assa',
};

/** Caso de ejemplo tomado del diseño */
const exampleCase: Omit<Testimonial, 'slug'> = {
	name: 'Alexis Rojas',
	role: 'Estudiante de Medicina en la Universidad de Moscú',
	country: 'pe',
	avatar: avatarExample,
	quote: 'Te acompañamos en cada paso para ganar tu beca y vivir la experiencia que transformará tu vida.',

	// Historia completa (textos del diseño de Figma)
	headline: 'La vida es una como para no arriesgar',
	portrait: { src: portraitExample, alt: 'Estudiante sonriendo en una sala iluminada con una lámpara' },
	video: {
		poster: { src: videoPosterExample, alt: 'Estudiante conversando con una asesora en una oficina' },
		// url: 'https://www.youtube.com/watch?v=CODIGO',
	},
	highlight: 'Cuando llegué todo era diferente, pero no me sentí solo',
	story: [
		{
			photo: photos.portrait,
			tiles: [storyStep, { photo: photos.couple }, { photo: photos.girlPhone }, storyStep],
		},
		{
			photo: photos.studentPhone,
			tiles: [storyStep, { photo: photos.girlPhone }, storyStep, storyStep],
		},
	],
	gallery: [
		{ ...photos.redSquare, album: true },
		{ ...photos.economicForum },
		{ ...photos.redSquare, album: true },
		{ ...photos.economicForum, album: true },
	],
	closing: {
		quote: 'Es increíble el cambio en mi vida, no me esperaba poder llegar hasta aquí',
		text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur g elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur.',
	},
};

export const testimonials: Testimonial[] = [
	{ ...exampleCase, slug: 'alexis-rojas' },
	{ ...exampleCase, slug: 'caso-de-ejemplo-2' },
	{ ...exampleCase, slug: 'caso-de-ejemplo-3' },
	{ ...exampleCase, slug: 'caso-de-ejemplo-4', avatar: avatarExampleHighlighted },
	{ ...exampleCase, slug: 'caso-de-ejemplo-5' },
	{ ...exampleCase, slug: 'caso-de-ejemplo-6' },
	{ ...exampleCase, slug: 'caso-de-ejemplo-7' },
	{ ...exampleCase, slug: 'caso-de-ejemplo-8' },
];

/** Busca un testimonio por su slug */
export function getTestimonial(slug: string): Testimonial | undefined {
	return testimonials.find((testimonial) => testimonial.slug === slug);
}
