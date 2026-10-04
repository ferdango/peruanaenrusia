/**
 * Autores del blog
 * --------------------------------------------------------------------------
 * Los artículos (src/data/articles.ts) y los videos (src/data/videos.ts)
 * indican su autor con un objeto de esta lista, por ejemplo
 * `author: authors['jose-quinteros']`. (Con WordPress, el autor llega con
 * cada publicación y no hace falta esta lista.)
 *
 * Para agregar un autor: copia un objeto, cambia la clave (en minúsculas y
 * con guiones), el nombre y la foto (cuadrada, mínimo 48 × 48 px, en
 * src/assets/images/blog/).
 *
 * ⚠️ CONTENIDO DE EJEMPLO: "José Quinteros" y su foto vienen del diseño de
 * Figma. Reemplázalos por los autores reales.
 */
import type { ImageSource } from '@lib/content/images';

import avatarJoseQuinteros from '@assets/images/blog/author-jose-quinteros.png';

export interface Author {
	name: string;
	/** Foto de perfil (se muestra en un círculo de 24 px) */
	avatar?: ImageSource;
}

export const authors = {
	'jose-quinteros': { name: 'José Quinteros', avatar: avatarJoseQuinteros },
} satisfies Record<string, Author>;
