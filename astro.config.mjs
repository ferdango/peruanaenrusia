// @ts-check
import { defineConfig, envField, sessionDrivers } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

/**
 * Configuración de Astro.
 * Documentación: https://docs.astro.build/en/reference/configuration-reference/
 *
 * Modelo de despliegue (ver docs/DESPLIEGUE.md):
 *   - Todas las páginas públicas se generan como HTML estático al compilar
 *     (rápidas y óptimas para SEO).
 *   - Solo las rutas que necesitan un servidor se ejecutan bajo demanda:
 *     /api/* (inicio de sesión con Google y por correo, Libro de
 *     reclamaciones) y /portal/* (protegido por sesión).
 *   - Se ejecuta con Node.js: `npm run build` y luego `npm start` (server.mjs).
 *
 * Versión estática (DEPLOY_TARGET=static): solo HTML, CSS, JavaScript e
 * imágenes en dist/client, para hostings sin servidor como GitHub Pages. El
 * portal se genera con datos de ejemplo, el inicio de sesión del modal es una
 * demostración y el Libro de reclamaciones indica cómo reclamar por correo.
 */

// Variables de entorno disponibles al compilar (archivo .env o del hosting)
const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

/** true al ejecutar `astro dev` (las cookies seguras exigen HTTPS en producción) */
const isDev = process.argv.includes('dev');

/** true = versión estática sin servidor (GitHub Pages) */
const isStatic = env.DEPLOY_TARGET === 'static';

/**
 * Subcarpeta donde se publica el sitio ('/' en la raíz del dominio).
 * GitHub Pages sin dominio propio publica en /<repositorio> (ej. /peruanaenrusia).
 */
const base = `/${(env.BASE_PATH ?? '').replace(/^\/+|\/+$/g, '')}`;
/** Prefijo para las rutas escritas en esta configuración ('' en la raíz del dominio) */
const basePrefix = base === '/' ? '' : base;

/** Origen del WordPress (gestor de contenidos), si está configurado */
const wordpressOrigin = (() => {
	try {
		return env.WORDPRESS_URL ? new URL(env.WORDPRESS_URL).origin : undefined;
	} catch {
		throw new Error(`[config] WORDPRESS_URL no es una URL válida: "${env.WORDPRESS_URL}"`);
	}
})();

/** Orígenes externos de imágenes (se optimizan al compilar con astro:assets) */
const imageOrigins = [wordpressOrigin, 'https://i.ytimg.com', 'https://secure.gravatar.com'].filter(
	/** @returns {origin is string} */ (origin) => Boolean(origin),
);

// Directivas CSP que dependen de la configuración
/** @type {`img-src${string}`} */
const imgSrc = `img-src 'self' data: blob: ${imageOrigins.join(' ')}`;
/** @type {`media-src${string}`} */
const mediaSrc = wordpressOrigin ? `media-src 'self' ${wordpressOrigin}` : "media-src 'self'";

/**
 * Ajustes de la versión estática.
 * @type {import('astro').AstroIntegration}
 */
const staticSite = {
	name: 'peru-static-site',
	hooks: {
		// El adaptador de Node deja las redirecciones al servidor: aquí se generan como HTML
		'astro:config:setup': ({ updateConfig }) => {
			updateConfig({ build: { redirects: true } });
		},
		// El portal (bajo demanda en el servidor) se genera como páginas con datos de ejemplo
		'astro:route:setup': ({ route }) => {
			if (route.component.startsWith('src/pages/portal/')) route.prerender = true;
		},
	},
};

export default defineConfig({
	// URL pública del sitio (URLs canónicas, sitemap y metadatos Open Graph).
	// Se puede cambiar con la variable SITE_URL sin tocar este archivo.
	site: env.SITE_URL || 'https://peruanaenrusia.pe',

	// Subcarpeta de publicación (variable BASE_PATH). Las rutas internas la
	// agregan con withBase() o usando `routes` (ver src/utils/url.ts).
	base,

	// Todas las rutas terminan en "/" (ej. /blog/) para mantener URLs consistentes.
	trailingSlash: 'always',

	// Servidor Node.js (modo standalone) para las rutas bajo demanda.
	adapter: node({ mode: 'standalone' }),

	// Sesiones del servidor (inicio de sesión del portal). Se guardan en archivos
	// dentro de .data/sessions (carpeta privada, fuera de git). Para varios
	// servidores, cambia el driver por uno compartido (ej. Redis).
	session: {
		driver: sessionDrivers.fs({ base: './.data/sessions' }),
		// La cookie siempre es HttpOnly (JavaScript no puede leerla)
		cookie: { name: 'peru_session', sameSite: 'lax', secure: !isDev },
		ttl: 60 * 60 * 24 * 7, // 7 días
	},

	// /casos-de-exito/ no tiene página propia: lleva a la sección del Home
	redirects: {
		'/casos-de-exito': `${basePrefix}/#casos-de-exito`,
	},

	// Precarga las páginas al pasar el cursor por un enlace → navegación más rápida.
	prefetch: {
		prefetchAll: false,
		defaultStrategy: 'hover',
	},

	integrations: [
		// sitemap-index.xml con todas las páginas públicas (sin portal, API ni 404)
		sitemap({
			filter: (page) => !/\/(portal|api|404)(\/|$)/.test(new URL(page).pathname),
			changefreq: 'weekly',
			priority: 0.7,
		}),
		...(isStatic ? [staticSite] : []),
	],

	// Sin resaltado de código (Shiki usa estilos en línea incompatibles con la CSP)
	markdown: {
		syntaxHighlight: false,
	},

	image: {
		// Imágenes remotas permitidas (WordPress, miniaturas de YouTube, avatares)
		remotePatterns: imageOrigins.map((origin) => {
			const url = new URL(origin);
			return { protocol: url.protocol.replace(':', ''), hostname: url.hostname };
		}),
	},

	// Variables de entorno tipadas (astro:env). Plantilla: .env.example
	// Salvo DEPLOY_TARGET, todas son de servidor y se leen al ejecutar
	// (access: 'secret'): nunca llegan al navegador y se pueden cambiar en el
	// hosting sin recompilar. (WORDPRESS_URL se lee además al compilar: el
	// contenido estático sale de ahí.)
	env: {
		schema: {
			// ----- Publicación -----
			// 'static' = versión sin servidor para GitHub Pages (se fija al compilar)
			DEPLOY_TARGET: envField.enum({
				context: 'client',
				access: 'public',
				values: ['server', 'static'],
				default: 'server',
			}),

			// ----- Gestor de contenidos (WordPress headless) -----
			WORDPRESS_URL: envField.string({
				context: 'server',
				access: 'secret',
				optional: true,
				url: true,
			}),
			WORDPRESS_USER: envField.string({ context: 'server', access: 'secret', optional: true }),
			WORDPRESS_APP_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),

			// ----- Inicio de sesión -----
			GOOGLE_CLIENT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
			GOOGLE_CLIENT_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
			SESSION_SECRET: envField.string({ context: 'server', access: 'secret', optional: true, min: 32 }),

			// ----- Correo (códigos de acceso y Libro de reclamaciones) -----
			MAIL_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
			COMPLAINTS_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
			RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
			SMTP_HOST: envField.string({ context: 'server', access: 'secret', optional: true }),
			SMTP_PORT: envField.number({ context: 'server', access: 'secret', optional: true }),
			SMTP_USER: envField.string({ context: 'server', access: 'secret', optional: true }),
			SMTP_PASS: envField.string({ context: 'server', access: 'secret', optional: true }),

			// ----- Almacenamiento local (si no hay WordPress) -----
			DATA_DIR: envField.string({ context: 'server', access: 'secret', optional: true }),

			// ----- Servidor -----
			// true si el sitio está detrás de un proxy (Hostinger, Nginx…) que envía X-Forwarded-For
			TRUST_PROXY: envField.boolean({ context: 'server', access: 'secret', default: false }),
			// true = el portal se puede ver sin iniciar sesión (solo para revisar el diseño)
			PORTAL_DEMO: envField.boolean({ context: 'server', access: 'secret', default: false }),
		},
	},

	security: {
		// Rechaza envíos de formularios desde otros dominios (CSRF) en las rutas bajo demanda
		checkOrigin: true,

		// Content Security Policy: Astro calcula los hashes de sus scripts y estilos
		// y agrega la política en un <meta> de cada página. Las cabeceras que no
		// pueden ir en un <meta> (frame-ancestors, HSTS…) las envía server.mjs.
		csp: {
			directives: [
				"default-src 'self'",
				imgSrc,
				"font-src 'self'",
				mediaSrc,
				"connect-src 'self'",
				'frame-src https://www.youtube-nocookie.com https://www.tiktok.com',
				"object-src 'none'",
				"base-uri 'self'",
				"form-action 'self' https://accounts.google.com",
				"manifest-src 'self'",
				"worker-src 'self'",
				'upgrade-insecure-requests',
			],
			styleDirective: {
				// Algunos componentes usan variables CSS en el atributo style
				// (ej. máscaras de imágenes): se permiten solo en atributos.
				resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }],
			},
		},
	},
});
