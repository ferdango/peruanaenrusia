/**
 * Cabeceras de seguridad HTTP
 * --------------------------------------------------------------------------
 * Una sola lista para todo el sitio. La usan:
 *   - server.mjs          → todas las respuestas en producción (páginas,
 *                           imágenes, CSS, JS y API).
 *   - src/middleware.ts   → las rutas bajo demanda (también en desarrollo).
 *   - public/.htaccess y public/_headers → si se publica la carpeta estática
 *     en Apache/LiteSpeed (Hostinger), Netlify o Cloudflare Pages.
 *
 * La política de contenido (CSP) de scripts y estilos la genera Astro en un
 * <meta> de cada página (astro.config.mjs → security.csp). Aquí se agregan
 * las directivas que solo funcionan como cabecera (frame-ancestors).
 *
 * Referencia: https://owasp.org/www-project-secure-headers/
 */

/** @type {Record<string, string>} */
export const securityHeaders = {
	// Fuerza HTTPS durante 2 años (los navegadores la ignoran en HTTP)
	'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
	// Evita que el navegador "adivine" el tipo de archivo
	'X-Content-Type-Options': 'nosniff',
	// Nadie puede mostrar el sitio dentro de un iframe (clickjacking)
	'X-Frame-Options': 'DENY',
	'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
	// Envía solo el dominio (no la URL completa) a otros sitios
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	// Desactiva funciones del navegador que el sitio no usa
	'Permissions-Policy':
		'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), browsing-topics=()',
	// Aísla la ventana del sitio de las ventanas que abre (pestañas nuevas, redes sociales)
	'Cross-Origin-Opener-Policy': 'same-origin',
	// Los recursos del sitio solo se cargan desde el mismo sitio
	'Cross-Origin-Resource-Policy': 'same-site',
	'X-Permitted-Cross-Domain-Policies': 'none',
};

/** Cabeceras extra de las respuestas de la API (JSON): nunca se guardan en caché */
export const apiHeaders = {
	'Cache-Control': 'no-store',
	'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
};
