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
 *   - author:   autor de src/data/authors.ts (ej. authors['grecia-kristal']).
 *   - excerpt:  bajada que aparece bajo el título.
 *   - image:    foto principal (src/assets/images/blog/), mínimo 1536 px de
 *               ancho. `imageAlt` describe la foto para lectores de pantalla.
 *   - body:     contenido, como una lista de bloques:
 *                 { type: 'paragraph', text: '…' }   → párrafo
 *                 { type: 'heading', text: '…' }     → subtítulo (h2)
 *                 { type: 'list', items: ['…', '…'] } → lista con viñetas
 *
 * Por ahora no hay artículos: los de ejemplo del diseño (textos provisionales
 * y fotos de referencia) se retiraron. Mientras la lista esté vacía, el blog
 * muestra solo los videos y la sección "Clásicos" no aparece; vuelve sola en
 * cuanto haya artículos (aquí o desde WordPress).
 */
import type { ImageSource } from '@lib/content/images';

import type { Author } from './authors';

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

/** Artículos (vacío por ahora; ver arriba cómo agregarlos) */
export const articles: Article[] = [];
