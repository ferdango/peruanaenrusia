/**
 * Tipos propios de la capa de contenido
 * --------------------------------------------------------------------------
 * (Los tipos de cada contenido —Article, Video, University…— viven junto a
 * sus datos locales en src/data/.)
 */
import type { LegalSection } from '@data/legal';

/**
 * Página "Legales".
 *   - Contenido local (src/data/legal.ts): secciones numeradas.
 *   - WordPress: el HTML de la página "Legales" (ya saneado); cada <h2> se
 *     numera automáticamente con CSS.
 */
export interface LegalPage {
	title: string;
	subtitle?: string;
	/** Fecha de la última actualización (AAAA-MM-DD) */
	updated?: string;
	sections?: LegalSection[];
	html?: string;
}

/** De dónde sale el contenido del sitio */
export type ContentSource = 'local' | 'wordpress';
