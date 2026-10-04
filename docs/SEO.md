# SEO

Qué incluye el sitio para posicionar en buscadores y verse bien al compartir en redes.

## 1. En todas las páginas (`src/layouts/BaseLayout.astro`)

- `<title>` único (`Título | Peruana en Rusia`) y **meta descripción** (cada página define la suya).
- **URL canónica**, `lang="es-PE"` y `hreflang` (`es-PE` y `x-default`).
- **Robots**: `index, follow, max-image-preview:large` en el sitio público; `noindex` en el portal, la 404 y la API.
- **Open Graph y Twitter Card** con imagen de **1200 × 630** generada automáticamente (de la foto de cada página o, si no tiene, la portada del Home).
- **Datos estructurados (JSON-LD, schema.org)**: `EducationalOrganization` (con RUC, contacto y redes) y `WebSite`.
- Favicon SVG, ícono para iOS, **manifiesto web** e íconos de 192/512 px.

## 2. Datos estructurados por página (`src/lib/seo/schema.ts`)

| Página                                         | Tipo                                     |
| ---------------------------------------------- | ---------------------------------------- |
| Home                                           | `FAQPage` (preguntas frecuentes)         |
| Artículo del blog                              | `BlogPosting` + `BreadcrumbList`         |
| Video del blog                                 | `VideoObject` + `BreadcrumbList`         |
| Ficha de universidad                           | `CollegeOrUniversity` + `BreadcrumbList` |
| Caso de éxito, Legales, Libro de reclamaciones | `BreadcrumbList`                         |

Valida con la [Prueba de resultados enriquecidos](https://search.google.com/test/rich-results).

## 3. Rastreo

- **Sitemap**: `/sitemap-index.xml` (todas las páginas públicas; se genera al compilar).
- **robots.txt**: `/robots.txt` (bloquea `/portal/` y `/api/`, apunta al sitemap).
- **RSS del blog**: `/rss.xml`.
- URLs limpias y consistentes con barra final (`/blog/mi-articulo/`); `/casos-de-exito/` redirige (308) a la sección del Home.
- **Dirección temporal de GitHub Pages** (`*.github.io`): todas las páginas llevan `noindex` y `robots.txt` bloquea el rastreo, para que la vista previa no compita con el dominio oficial (ver `src/lib/seo/indexing.ts`). Con un dominio propio se indexa normalmente.

## 4. Rendimiento (Core Web Vitals)

- HTML estático, sin frameworks de JavaScript en el navegador.
- Imágenes en **WebP** con varios tamaños (`srcset`), carga diferida y dimensiones explícitas (sin saltos de diseño).
- Fuente Poppins **autoalojada** (sin peticiones a Google Fonts).
- Precarga de páginas al pasar el cursor por los enlaces.

## 5. Buenas prácticas al cargar contenido

- Un `h1` por página; títulos en orden (`h2`, `h3`…).
- Texto alternativo en todas las fotos con contenido (describe lo que se ve).
- Extractos de 120–160 caracteres (se usan como meta descripción).
- Slugs cortos, en minúsculas y sin tildes.
- Enviar el sitemap a **Google Search Console** y **Bing Webmaster Tools** al publicar.
