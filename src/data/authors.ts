/**
 * Autores del blog
 * --------------------------------------------------------------------------
 * Los artículos (src/data/articles.ts) y los videos (src/data/videos.ts)
 * indican su autor con la clave de este objeto, por ejemplo
 * `author: 'jose-quinteros'`.
 *
 * Para agregar un autor: copia un objeto, cambia la clave (en minúsculas y
 * con guiones), el nombre y la foto (cuadrada, mínimo 48 × 48 px, en
 * src/assets/images/blog/).
 *
 * ⚠️ CONTENIDO DE EJEMPLO: "José Quinteros" y su foto vienen del diseño de
 * Figma. Reemplázalos por los autores reales.
 */
import type { ImageMetadata } from 'astro';

import avatarJoseQuinteros from '@assets/images/blog/author-jose-quinteros.png';

export interface Author {
	name: string;
	/** Foto de perfil (se muestra en un círculo de 24 px) */
	avatar?: ImageMetadata;
}

export const authors = {
	'jose-quinteros': { name: 'José Quinteros', avatar: avatarJoseQuinteros },
} satisfies Record<string, Author>;

/** Clave de un autor (ej. 'jose-quinteros') */
export type AuthorId = keyof typeof authors;

/** Devuelve los datos de un autor a partir de su clave */
export function getAuthor(id: AuthorId | undefined): Author | undefined {
	return id ? authors[id] : undefined;
}
