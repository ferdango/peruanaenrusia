/**
 * robots.txt ( /robots.txt )
 * --------------------------------------------------------------------------
 * Indica a los buscadores qué pueden rastrear y dónde está el mapa del sitio.
 * El portal del estudiante y la API no se indexan.
 */
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
	const sitemapUrl = new URL('/sitemap-index.xml', site).href;

	const body = [
		'User-agent: *',
		'Allow: /',
		'Disallow: /portal/',
		'Disallow: /api/',
		'',
		`Sitemap: ${sitemapUrl}`,
		'',
	].join('\n');

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
