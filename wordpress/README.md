# Plugin de WordPress: peru-headless

Crea en WordPress el modelo de contenido que lee el sitio de Peruana en Rusia (Astro):

- Tipos de contenido: **Universidades**, **Casos de éxito**, **Preguntas frecuentes** y **Libro de reclamaciones** (privado).
- Campos de cada tipo (formularios de ACF si está instalado) y campos de video/clásico para las entradas del blog.
- Campo REST `peru` con los datos normalizados que consume `src/lib/content/wordpress.ts`.
- Rutas privadas `peru/v1/students` y `peru/v1/complaints` para el servidor del sitio.
- Rol **Estudiante** para las cuentas del portal.
- Recompilación automática del sitio al publicar (`PERU_DEPLOY_HOOK_URL`).

Instalación: copia la carpeta `peru-headless/` a `wp-content/plugins/` y actívala. Guía completa: [docs/WORDPRESS.md](../docs/WORDPRESS.md).
