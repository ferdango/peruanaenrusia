/**
 * ¿Se indexa el sitio en buscadores?
 * --------------------------------------------------------------------------
 * La dirección temporal de GitHub Pages (*.github.io) no se indexa: el sitio
 * oficial es el dominio propio y así no compite con él en Google. Al publicar
 * en el dominio propio (en GitHub Pages o en otro hosting), las páginas se
 * indexan sin cambiar nada.
 */
export function isIndexable(site: URL | undefined): boolean {
	return !site?.hostname.endsWith('.github.io');
}
