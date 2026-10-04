/**
 * Universidades ("casas de estudio")
 * --------------------------------------------------------------------------
 * Fuente de datos de:
 *   - Home → "Universidades destacadas" (las que tienen featured: true)
 *   - /universidades/          → listado completo
 *   - /universidades/[slug]/   → ficha de cada universidad
 *
 * Para agregar una universidad: copia un objeto, cambia el `slug` (será la
 * URL) y sus textos/imágenes. Las imágenes van en src/assets/images/universities/.
 *
 * ⚠️ CONTENIDO DE EJEMPLO: la lista, fotos y logos son de referencia (las
 * imágenes vienen del diseño). Confirma las universidades con las que trabaja
 * Peruana en Rusia y reemplaza las imágenes por las de cada una.
 */
import type { ImageMetadata } from 'astro';

import campusPhoto from '@assets/images/universities/lomonosov-campus.jpg';
import lomonosovLogo from '@assets/images/universities/lomonosov-logo.png';

/** Colores de acento disponibles para la forma de color de la tarjeta */
export type UniversityAccent = 'skyblue' | 'green' | 'yellow' | 'blue';

export interface University {
	/** Identificador único, se usa en la URL: /universidades/{slug}/ */
	slug: string;
	name: string;
	city: string;
	/** Logo de la universidad (PNG con fondo transparente) */
	logo: ImageMetadata;
	/** Foto principal (tarjeta y cabecera de la ficha) */
	image: ImageMetadata;
	/** Aparece en "Universidades destacadas" de la página de inicio */
	featured?: boolean;
	/** Sitio web oficial */
	website?: string;
	/** Resumen corto (ficha y buscadores) */
	summary?: string;
}

export const universities: University[] = [
	{
		slug: 'universidad-estatal-de-moscu',
		name: 'Universidad Estatal de Moscú',
		city: 'Moscú',
		logo: lomonosovLogo,
		image: campusPhoto,
		featured: true,
		website: 'https://www.msu.ru/en/',
		summary:
			'Fue fundada oficialmente el 25 de enero de 1755 por el científico Mijaíl Vasílievich Lomonósov y la emperatriz Isabel de Rusia, marcando el inicio de la educación universitaria formal en el país.',
	},
	{
		slug: 'universidad-rudn',
		name: 'Universidad RUDN',
		city: 'Moscú',
		logo: lomonosovLogo,
		image: campusPhoto,
		featured: true,
	},
	{
		slug: 'universidad-estatal-de-san-petersburgo',
		name: 'Universidad Estatal de San Petersburgo',
		city: 'San Petersburgo',
		logo: lomonosovLogo,
		image: campusPhoto,
		featured: true,
	},
	{
		slug: 'universidad-federal-de-kazan',
		name: 'Universidad Federal de Kazán',
		city: 'Kazán',
		logo: lomonosovLogo,
		image: campusPhoto,
		featured: true,
	},
	{
		slug: 'universidad-medica-sechenov',
		name: 'Universidad Médica Sechenov',
		city: 'Moscú',
		logo: lomonosovLogo,
		image: campusPhoto,
	},
	{
		slug: 'universidad-politecnica-de-tomsk',
		name: 'Universidad Politécnica de Tomsk',
		city: 'Tomsk',
		logo: lomonosovLogo,
		image: campusPhoto,
	},
	{
		slug: 'universidad-federal-de-los-urales',
		name: 'Universidad Federal de los Urales',
		city: 'Ekaterimburgo',
		logo: lomonosovLogo,
		image: campusPhoto,
	},
	{
		slug: 'escuela-superior-de-economia',
		name: 'Escuela Superior de Economía',
		city: 'Moscú',
		logo: lomonosovLogo,
		image: campusPhoto,
	},
	{
		slug: 'universidad-federal-de-siberia',
		name: 'Universidad Federal de Siberia',
		city: 'Krasnoyarsk',
		logo: lomonosovLogo,
		image: campusPhoto,
	},
];

/** Universidades marcadas como destacadas (Home) */
export const featuredUniversities = universities.filter((university) => university.featured);

/** Busca una universidad por su slug */
export function getUniversity(slug: string): University | undefined {
	return universities.find((university) => university.slug === slug);
}
