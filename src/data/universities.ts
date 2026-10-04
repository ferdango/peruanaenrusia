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
 * La ficha (/universidades/[slug]/) muestra solo los campos que existan:
 * los campos opcionales de "Contenido de la ficha" (cover, gallery,
 * description, highlights, faculties, rankings, studentLife, tips) pueden
 * omitirse y la sección correspondiente no se dibuja.
 *
 * ⚠️ CONTENIDO DE EJEMPLO: la lista, fotos y logos son de referencia (las
 * imágenes vienen del diseño). Confirma las universidades con las que trabaja
 * Peruana en Rusia y reemplaza las imágenes por las de cada una.
 */
import type { ImageMetadata } from 'astro';

import campusPhoto from '@assets/images/universities/lomonosov-campus.jpg';
import lomonosovLogo from '@assets/images/universities/lomonosov-logo.png';
import coverLibrary from '@assets/images/universities/university-cover-library.jpg';
import galleryBrickBuilding from '@assets/images/universities/university-gallery-brick-building.jpg';
import galleryIvyBuilding from '@assets/images/universities/university-gallery-ivy-building.jpg';

/** Colores de acento disponibles para la forma de color de la tarjeta */
export type UniversityAccent = 'skyblue' | 'green' | 'yellow' | 'blue';

/** Foto con su texto alternativo (describe lo que se ve en la imagen) */
export interface UniversityPhoto {
	src: ImageMetadata;
	alt: string;
}

/** Facultad o área de estudio (acordeón de la ficha) */
export interface UniversityFaculty {
	name: string;
	/** Texto que se muestra al desplegar la facultad */
	description?: string;
}

export interface University {
	/** Identificador único, se usa en la URL: /universidades/{slug}/ */
	slug: string;
	name: string;
	city: string;
	/** Logo de la universidad (PNG con fondo transparente) */
	logo: ImageMetadata;
	/** Foto principal (tarjeta y, si no hay `cover`, cabecera de la ficha) */
	image: ImageMetadata;
	/** Aparece en "Universidades destacadas" de la página de inicio */
	featured?: boolean;
	/** Sitio web oficial (botón "Ir al sitio web" de la ficha) */
	website?: string;
	/** Resumen corto: primer párrafo de la ficha y descripción para buscadores */
	summary?: string;

	// ----- Contenido de la ficha (todo opcional) -----

	/** Foto grande de la cabecera de la ficha */
	cover?: UniversityPhoto;
	/** Fotos que se muestran lado a lado debajo del resumen (2 en el diseño) */
	gallery?: UniversityPhoto[];
	/** Descripción general (un elemento por párrafo) */
	description?: string[];
	/** Lista "La universidad cuenta con:" */
	highlights?: string[];
	/** Acordeón "Las áreas de estudio incluyen:" */
	faculties?: UniversityFaculty[];
	/** Sección "Reputación y rankings": párrafo + lista de rankings */
	rankings?: {
		intro?: string;
		items: string[];
	};
	/** Sección "Vida estudiantil e internacionalización" (un elemento por párrafo) */
	studentLife?: string[];
	/** Sección "Consejos": una tarjeta por consejo */
	tips?: string[];
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

		// Contenido de la ficha (textos del diseño de Figma)
		cover: {
			src: coverLibrary,
			alt: 'Estanterías de madera de una biblioteca llenas de libros antiguos',
		},
		gallery: [
			{
				src: galleryBrickBuilding,
				alt: 'Edificio universitario de ladrillo rojo al final de una avenida con árboles',
			},
			{
				src: galleryIvyBuilding,
				alt: 'Fachada de piedra de un edificio universitario cubierta de hiedra',
			},
		],
		description: [
			'La Universidad Estatal de Moscú M. V. Lomonósov (en ruso: Московский государственный университет имени М. В. Ломоносова) es una universidad pública de investigación ubicada en Moscú, Rusia. Es la institución educativa más antigua, grande y prestigiosa de Rusia y una de las más reconocidas a nivel mundial.',
		],
		highlights: [
			'43 facultades que cubren todas las áreas del conocimiento.',
			'15 institutos de investigación.',
			'Más de 300 departamentos académicos.',
			'Programas tanto de pregrado como de posgrado en ciencias, humanidades, ciencias sociales, ingeniería, arte y más.',
		],
		// TODO: el diseño repite "Facultad de Ingeniería" como texto de relleno.
		// Confirma con el equipo las facultades y descripciones definitivas.
		faculties: [
			{
				name: 'Facultad de Medicina Fundamental',
				description: 'Forma médicos generales, farmacéuticos y especialistas en ciencias biomédicas.',
			},
			{
				name: 'Facultad de Matemática Computacional y Cibernética',
				description:
					'Programas de matemática aplicada, informática, programación y ciencia de datos.',
			},
			{
				name: 'Facultad de Física',
				description:
					'Física teórica y experimental, astronomía y geofísica, con laboratorios de investigación propios.',
			},
			{
				name: 'Facultad de Economía',
				description:
					'Economía, gestión y finanzas, con un fuerte enfoque en investigación y análisis cuantitativo.',
			},
		],
		rankings: {
			intro: 'MSU es considerada la principal universidad de Rusia y figura consistentemente en los rankings globales:',
			items: [
				'QS World University Rankings: alrededor de #105 en el mundo.',
				'Academic Ranking of World Universities: posicionada entre las 100–150 mejores.',
			],
		},
		studentLife: [
			'La vida en MSU combina educación rigurosa con actividades culturales, deportivas y científicas. Recibe anualmente a miles de estudiantes internacionales.',
			'Cuenta con instalaciones modernas, residencias estudiantiles y servicios de apoyo para estudiantes extranjeros.',
		],
		tips: [
			'Dominar el idioma ruso te ahorrará problemas con profesores, trámites, bibliografía y convivencia.',
			'El invierno es duro y la cultura puede parecer fría al inicio. No lo tomes personal: con el tiempo, la gente es cercana y solidaria.',
			'No te quedes solo con gente de tu país. Relacionarte con estudiantes rusos te ayuda a integrarte, mejorar el idioma y entender la cultura académica.',
			// (texto del diseño: se refiere a las residencias estudiantiles)
			'Son económicas y prácticas, pero no lujosas. Comparte espacios, respeta normas internas y sé flexible. Es parte de la experiencia.',
		],
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
