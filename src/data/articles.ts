/**
 * Artículos del blog (publicaciones de texto)
 * --------------------------------------------------------------------------
 * Fuente de datos de:
 *   - Blog → "Clásicos" (artículos con `classic: true`)
 *   - Blog → "Novedades" (artículos y videos con `featured: true`)
 *   - /blog/[slug]/ → página de cada artículo (diseño "Single Article Text")
 *
 * ¿Por qué un archivo .ts y no Markdown? Así todo el contenido del sitio vive
 * en src/data/ con el mismo formato, con tipos que avisan si falta un campo.
 * Si el blog crece mucho, se puede migrar a una colección de contenido de
 * Astro (src/content/) sin cambiar el diseño: solo cambia de dónde salen los
 * datos (ver src/data/blog.ts).
 *
 * Para agregar un artículo: copia un objeto de la lista y cambia sus datos.
 *   - slug:     identificador en la URL (/blog/{slug}/), en minúsculas, sin
 *               tildes y con guiones. No puede repetirse con el de un video.
 *   - date:     fecha de publicación (AAAA-MM-DD).
 *   - author:   autor de src/data/authors.ts (ej. authors['jose-quinteros']).
 *   - excerpt:  bajada que aparece bajo el título.
 *   - image:    foto principal (src/assets/images/blog/), mínimo 1536 px de
 *               ancho. `imageAlt` describe la foto para lectores de pantalla.
 *   - body:     contenido, como una lista de bloques:
 *                 { type: 'paragraph', text: '…' }   → párrafo
 *                 { type: 'heading', text: '…' }     → subtítulo (h2)
 *                 { type: 'list', items: ['…', '…'] } → lista con viñetas
 *
 * ⚠️ CONTENIDO DE EJEMPLO: todos los artículos de esta lista vienen del
 * diseño de Figma (textos, fechas, autor y fotos). Reemplázalos por los
 * artículos reales antes de publicar el sitio.
 */
import type { ImageSource } from '@lib/content/images';

import { authors, type Author } from './authors';
import imageFraud from '@assets/images/blog/fraude-financiero.jpg';
import imageOurPath from '@assets/images/blog/como-encontrar-nuestro-camino.jpg';

/** Bloque de contenido del cuerpo de un artículo */
export type ArticleBlock =
	| { type: 'paragraph'; text: string }
	| { type: 'heading'; text: string }
	| { type: 'list'; items: string[] }
	/** HTML ya saneado (contenido que llega de WordPress) */
	| { type: 'html'; html: string };

export interface Article {
	/** Identificador único, se usa en la URL: /blog/{slug}/ */
	slug: string;
	title: string;
	/** Categoría: se muestra sobre el título como enlace de regreso al blog */
	category: string;
	/** Fecha de publicación (AAAA-MM-DD) */
	date: string;
	/** Autor (nombre y foto) */
	author?: Author;
	/** Bajada: resumen corto bajo el título (también se usa para buscadores) */
	excerpt: string;
	/** Foto principal (también se usa como miniatura en las tarjetas) */
	image: ImageSource;
	/** Descripción de la foto para lectores de pantalla */
	imageAlt: string;
	body: ArticleBlock[];
	/** true = aparece en "Novedades" (portada del blog) */
	featured?: boolean;
	/** true = aparece en "Clásicos" (portada del blog) */
	classic?: boolean;
}

// ----- Texto provisional de los artículos de ejemplo "Cómo encontrar nuestro camino" -----
const placeholderBody: ArticleBlock[] = [
	{
		type: 'paragraph',
		text: 'Lorem ipsum dolor sit amet consectetur. Risus sodales elit metus gravida consectetur. Amet adipiscing accumsan id in ullamcorper lectus. Id tortor magna neque sit nulla suspendisse nunc sit rhoncus.',
	},
	{
		type: 'paragraph',
		text: 'Vel nibh semper senectus phasellus libero sed. Integer id in pellentesque nisi cras. Molestie aliquet sit vitae praesent. Nunc consequat vitae et cras.',
	},
	{ type: 'heading', text: 'Lorem ipsum dolor sit amet' },
	{
		type: 'paragraph',
		text: 'Elit maecenas sapien amet lectus quis. Tincidunt turpis commodo amet purus ullamcorper pellentesque quis ultricies. Sit hendrerit aliquam sed sit vitae est id aenean tempor.',
	},
];

/** Crea un artículo de ejemplo "Cómo encontrar nuestro camino" (como en el diseño) */
function ourPathExample(slug: string): Article {
	return {
		slug,
		title: 'Cómo encontrar nuestro camino',
		category: 'Vida en Rusia',
		date: '2025-05-07',
		author: authors['jose-quinteros'],
		excerpt:
			'Lorem ipsum dolor sit amet consectetur. Risus sodales elit metus gravida consectetur. Amet adipiscing accumsan id in ullamcorper lectus.',
		image: imageOurPath,
		imageAlt: 'Dos personas conversando en el set de una entrevista',
		body: placeholderBody,
		classic: true,
	};
}

export const articles: Article[] = [
	{
		slug: 'fraude-financiero-que-es-tipos-y-como-prevenirlo',
		title: 'Fraude financiero: qué es, tipos y cómo prevenirlo',
		category: 'Transformación Digital',
		date: '2023-07-04',
		author: authors['jose-quinteros'],
		excerpt:
			'Conoce cómo el fraude financiero impacta a personas y empresas y cómo un sistema tecnológico puede mitigar este riesgo efectivamente en tu negocio.',
		image: imageFraud,
		imageAlt: 'Teléfono inteligente sobre una mesa con la pantalla de inicio llena de aplicaciones',
		featured: true,
		body: [
			{
				type: 'paragraph',
				text: 'Sin lugar a dudas, el fraude financiero es una práctica que amenaza las organizaciones bancarias desde hace décadas y, sin embargo, evoluciona constantemente obligando a las empresas a desarrollarse con ellas para fortalecer las vulnerabilidades, procesos e, incluso la fuerza humana para sobrellevar estos riesgos.',
			},
			{
				type: 'paragraph',
				text: 'Ahora bien, si no sabes a detalle qué es el fraude financiero, cómo funciona o cuáles son los principales tipos, ¡este es el post para ti!',
			},
			{ type: 'heading', text: 'Autofraude' },
			{
				type: 'paragraph',
				text: 'Ocurre cuando el propio cliente simula haber sido víctima de una estafa para obtener beneficios indebidos, como reembolsos o cancelaciones de deuda.',
			},
			{
				type: 'paragraph',
				text: 'Es una práctica fraudulenta que perjudica a las instituciones financieras y suele ser difícil de detectar sin un sistema de monitoreo avanzado.',
			},
		],
	},
	ourPathExample('como-encontrar-nuestro-camino'),
	ourPathExample('como-encontrar-nuestro-camino-2'),
	ourPathExample('como-encontrar-nuestro-camino-3'),
	ourPathExample('como-encontrar-nuestro-camino-4'),
	ourPathExample('como-encontrar-nuestro-camino-5'),
	ourPathExample('como-encontrar-nuestro-camino-6'),
	ourPathExample('como-encontrar-nuestro-camino-7'),
	ourPathExample('como-encontrar-nuestro-camino-8'),
];
