/**
 * Rutas internas y subcarpeta de publicación
 * --------------------------------------------------------------------------
 * El sitio puede publicarse en la raíz de un dominio (https://peruanaenrusia.pe/)
 * o dentro de una subcarpeta (https://ferdango.github.io/peruanaenrusia/ en
 * GitHub Pages, ver BASE_PATH en docs/DESPLIEGUE.md).
 *
 * Las rutas se escriben desde la raíz del sitio ('/blog/') y pasan por
 * withBase() para agregar la subcarpeta. Las de uso común ya están listas en
 * src/data/navigation.ts (routes) y src/data/portal.ts (portalRoutes).
 */

/** Subcarpeta sin barra final: '' en la raíz del dominio, '/peruanaenrusia' en GitHub Pages */
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** '/blog/' → '/peruanaenrusia/blog/'. No modifica URLs externas ni anclas ('#…') */
export function withBase(path: string): string {
	if (!path.startsWith('/') || path.startsWith('//')) return path;
	return `${BASE_PATH}${path}`;
}

/** '/peruanaenrusia/blog/' → '/blog/' (para comparar rutas sin importar la subcarpeta) */
export function withoutBase(pathname: string): string {
	if (!BASE_PATH) return pathname;
	if (pathname === BASE_PATH) return '/';
	return pathname.startsWith(`${BASE_PATH}/`) ? pathname.slice(BASE_PATH.length) : pathname;
}

/**
 * Código de un video de YouTube a partir de su URL (watch?v=, youtu.be/,
 * shorts/, embed/ o live/). Si la URL no es de un video de YouTube, undefined.
 *   'https://www.youtube.com/watch?v=A_tz23sIFXk' → 'A_tz23sIFXk'
 */
export function youtubeIdFromUrl(url: string | undefined): string | undefined {
	return url?.match(
		/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/,
	)?.[1];
}

/**
 * Número de un video de TikTok a partir de su URL (…/video/NÚMERO o
 * …/embed/v2/NÚMERO). Si la URL no es de un video de TikTok, undefined.
 *   'https://www.tiktok.com/@peruanaenrusia/video/7635277713447767317' → '7635277713447767317'
 */
export function tiktokIdFromUrl(url: string | undefined): string | undefined {
	return url?.match(/tiktok\.com\/(?:@[\w.-]+\/video|embed(?:\/v2)?)\/(\d+)/)?.[1];
}
