/**
 * Brochure de cada universidad ("Descargar brochure" de la ficha)
 * --------------------------------------------------------------------------
 * Orden de preferencia:
 *   1. El PDF oficial de la universidad (`brochure` en src/data/universities.ts
 *      o en WordPress).
 *   2. El PDF que genera el sitio con los datos de la ficha:
 *      public/brochures/{slug}.pdf (se crea con `npm run brochures`, ver
 *      scripts/brochures.mjs).
 *   3. Si ese PDF todavía no existe, la versión para imprimir del brochure
 *      (/universidades/{slug}/brochure/), que se puede guardar como PDF.
 *
 * Se resuelve al compilar (las fichas son páginas estáticas).
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { detailRoutes } from '@data/navigation';
import type { University } from '@data/universities';
import { withBase } from '@utils/url';

export interface BrochureLink {
	href: string;
	/** true = el enlace descarga un PDF (si no, abre la versión para imprimir) */
	pdf: boolean;
	/** Nombre sugerido del archivo al descargar */
	fileName?: string;
}

/** Ruta del PDF generado, relativa a public/ */
export const generatedBrochure = (slug: string) => `brochures/${slug}.pdf`;

export function universityBrochure(university: University): BrochureLink {
	if (university.brochure) return { href: university.brochure, pdf: true };

	const file = generatedBrochure(university.slug);
	if (existsSync(join(process.cwd(), 'public', file))) {
		return { href: withBase(`/${file}`), pdf: true, fileName: `brochure-${university.slug}.pdf` };
	}

	return { href: detailRoutes.universityBrochure(university.slug), pdf: false };
}
