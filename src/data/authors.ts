/**
 * Autores del blog
 * --------------------------------------------------------------------------
 * Los artículos (src/data/articles.ts) y los videos (src/data/videos.ts)
 * indican su autor con un objeto de esta lista, por ejemplo
 * `author: authors['grecia-kristal']`. (Con WordPress, el autor llega con
 * cada publicación y no hace falta esta lista.)
 *
 * Para agregar un autor: copia un objeto, cambia la clave (en minúsculas y
 * con guiones), el nombre y la foto (cuadrada, mínimo 48 × 48 px, en
 * src/assets/images/blog/).
 *
 * "Grecia Kristal" (fundadora, autora de los videos del canal) usa la foto de
 * perfil oficial de la marca.
 */
import type { ImageSource } from '@lib/content/images';

import avatarGreciaKristal from '@assets/images/social/tiktok-avatar.jpg';

export interface Author {
	name: string;
	/** Foto de perfil (se muestra en un círculo de 24 px) */
	avatar?: ImageSource;
}

export const authors = {
	'grecia-kristal': { name: 'Grecia Kristal', avatar: avatarGreciaKristal },
} satisfies Record<string, Author>;
