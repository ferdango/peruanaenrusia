/**
 * robots.txt ( /robots.txt )
 * --------------------------------------------------------------------------
 * Indica a los buscadores qué pueden rastrear y dónde está el mapa del sitio.
 * El portal del estudiante y la API no se indexan, y en la dirección temporal
 * de GitHub Pages no se rastrea nada (ver src/lib/seo/indexing.ts).
 */
import type { APIRoute } from 'astro';

import { isIndexable } from '@lib/seo/indexing';
import { withBase } from '@utils/url';

export const GET: APIRoute = ({ site }) => {
	const sitemapUrl = new URL(withBase('/sitemap-index.xml'), site).href;
	const rules = isIndexable(site)
		? ['Allow: /', `Disallow: ${withBase('/portal/')}`, `Disallow: ${withBase('/api/')}`]
		: ['Disallow: /'];

	const body = ['User-agent: *', ...rules, '', `Sitemap: ${sitemapUrl}`, ''].join('\n');

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
