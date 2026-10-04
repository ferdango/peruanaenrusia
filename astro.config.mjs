// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Configuración de Astro.
 * Documentación: https://docs.astro.build/en/reference/configuration-reference/
 */
export default defineConfig({
	// URL pública del sitio (se usa para URLs canónicas y metadatos Open Graph).
	// Cámbiala por el dominio definitivo antes de publicar.
	site: 'https://peruanaenrusia.pe',

	// Todas las rutas terminan en "/" (ej. /blog/) para mantener URLs consistentes.
	trailingSlash: 'always',

	// Precarga las páginas al pasar el cursor por un enlace → navegación más rápida.
	prefetch: {
		prefetchAll: false,
		defaultStrategy: 'hover',
	},
});
