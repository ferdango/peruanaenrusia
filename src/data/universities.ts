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
 * Brochure: cada ficha ofrece "Descargar brochure". Si la universidad tiene
 * `brochure` (URL de un PDF oficial) se descarga ese; si no, el PDF que genera
 * el sitio con los datos de la ficha (public/brochures/{slug}.pdf, ver
 * scripts/brochures.mjs y docs/GUIA-DESARROLLO.md).
 *
 * ⚠️ CONTENIDO DE EJEMPLO: la lista, fotos y logos son de referencia (las
 * imágenes vienen del diseño). Confirma las universidades con las que trabaja
 * Peruana en Rusia y reemplaza las imágenes por las de cada una. Los años de
 * fundación y los resúmenes son datos generales públicos de cada universidad:
 * revísalos con el equipo antes de publicar.
 */
import type { ImageSource } from '@lib/content/images';

import campusPhoto from '@assets/images/universities/lomonosov-campus.jpg';
import lomonosovLogo from '@assets/images/universities/lomonosov-logo.png';
import coverLibrary from '@assets/images/universities/university-cover-library.jpg';
import galleryBrickBuilding from '@assets/images/universities/university-gallery-brick-building.jpg';
import galleryIvyBuilding from '@assets/images/universities/university-gallery-ivy-building.jpg';
// Foto real de la visita de Kristal a la URFU (miniatura de su video en YouTube)
import urfuPhoto from '@assets/images/videos/visita-universidad-federal-de-los-urales.jpg';

/** Colores de acento disponibles para la forma de color de la tarjeta */
export type UniversityAccent = 'skyblue' | 'green' | 'yellow' | 'blue';

/** Foto con su texto alternativo (describe lo que se ve en la imagen) */
export interface UniversityPhoto {
	src: ImageSource;
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
	logo: ImageSource;
	/** Foto principal (tarjeta y, si no hay `cover`, cabecera de la ficha) */
	image: ImageSource;
	/** Aparece en "Universidades destacadas" de la página de inicio */
	featured?: boolean;
	/** Sitio web oficial (botón "Ir al sitio web" de la ficha) */
	website?: string;
	/** Resumen corto: primer párrafo de la ficha y descripción para buscadores */
	summary?: string;
	/** Año de fundación (dato de la portada de la ficha) */
	founded?: number;
	/** Tipo de universidad, ej. "Pública" */
	kind?: string;
	/** PDF oficial de la universidad (si no hay, se usa el brochure que genera el sitio) */
	brochure?: string;

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
		founded: 1755,
		kind: 'Pública',
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
		founded: 1960,
		kind: 'Pública',
		summary:
			'La Universidad Rusa de la Amistad de los Pueblos nació en Moscú en 1960 para formar a estudiantes de todo el mundo. Hoy es una de las universidades más internacionales de Rusia.',
	},
	{
		slug: 'universidad-estatal-de-san-petersburgo',
		name: 'Universidad Estatal de San Petersburgo',
		city: 'San Petersburgo',
		logo: lomonosovLogo,
		image: campusPhoto,
		featured: true,
		founded: 1724,
		kind: 'Pública',
		summary:
			'Fundada en 1724 por decreto de Pedro el Grande, es una de las universidades más antiguas y prestigiosas de Rusia, en el corazón histórico de San Petersburgo.',
	},
	{
		slug: 'universidad-federal-de-kazan',
		name: 'Universidad Federal de Kazán',
		city: 'Kazán',
		logo: lomonosovLogo,
		image: campusPhoto,
		featured: true,
		founded: 1804,
		kind: 'Pública',
		summary:
			'Fundada en 1804, es una de las universidades más antiguas de Rusia. El matemático Nikolái Lobachevski fue su rector y hoy recibe a estudiantes de decenas de países.',
	},
	{
		slug: 'universidad-medica-sechenov',
		name: 'Universidad Médica Sechenov',
		city: 'Moscú',
		logo: lomonosovLogo,
		image: campusPhoto,
		founded: 1758,
		kind: 'Pública',
		summary:
			'Sus orígenes se remontan a 1758, como Facultad de Medicina de la Universidad de Moscú. Es la universidad médica más antigua y reconocida de Rusia.',
	},
	{
		slug: 'universidad-politecnica-de-tomsk',
		name: 'Universidad Politécnica de Tomsk',
		city: 'Tomsk',
		logo: lomonosovLogo,
		image: campusPhoto,
		founded: 1896,
		kind: 'Pública',
		summary:
			'Fundada en 1896, fue la primera universidad técnica de la Rusia asiática. Es referente en ingeniería, energía y ciencias aplicadas.',
	},
	{
		slug: 'universidad-federal-de-los-urales',
		name: 'Universidad Federal de los Urales',
		city: 'Ekaterimburgo',
		logo: lomonosovLogo,
		image: urfuPhoto,
		featured: true,
		founded: 1920,
		kind: 'Pública',
		summary:
			'Una de las universidades más grandes y reconocidas de Rusia. Kristal la recorrió completa en un video de nuestro canal.',
	},
	{
		slug: 'escuela-superior-de-economia',
		name: 'Escuela Superior de Economía',
		city: 'Moscú',
		logo: lomonosovLogo,
		image: campusPhoto,
		founded: 1992,
		kind: 'Pública',
		summary:
			'Fundada en 1992, es una de las universidades de investigación más dinámicas de Rusia, especializada en economía, ciencias sociales, informática y humanidades.',
	},
	{
		slug: 'universidad-federal-de-siberia',
		name: 'Universidad Federal de Siberia',
		city: 'Krasnoyarsk',
		logo: lomonosovLogo,
		image: campusPhoto,
		founded: 2006,
		kind: 'Pública',
		summary:
			'Creada en 2006 en Krasnoyarsk a partir de la unión de varias universidades de la ciudad, es uno de los principales centros de estudio de Siberia.',
	},
];
