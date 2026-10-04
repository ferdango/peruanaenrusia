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
 * ⚠️ CONTENIDO DE EJEMPLO: por ahora la lista repite el caso de ejemplo del
 * diseño ("Alexis Rojas"). Reemplázalo por testimonios reales y autorizados
 * por cada estudiante antes de publicar el sitio.
 */
import type { ImageMetadata } from 'astro';

import type { CountryCode } from '@data/countries';

import avatarExample from '@assets/images/testimonials/avatar-alexis-rojas.png';
import avatarExampleHighlighted from '@assets/images/testimonials/avatar-student-2.png';

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
}

/** Caso de ejemplo tomado del diseño */
const exampleCase: Omit<Testimonial, 'slug'> = {
	name: 'Alexis Rojas',
	role: 'Estudiante de Medicina en la Universidad de Moscú',
	country: 'pe',
	avatar: avatarExample,
	quote: 'Te acompañamos en cada paso para ganar tu beca y vivir la experiencia que transformará tu vida.',
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
