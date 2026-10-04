# Peruana en Rusia — Sitio web

> **Tu futuro, sin fronteras.**

Front-end del sitio web de **Peruana en Rusia**, construido a partir del diseño de Figma ([PeRu Web Design](https://www.figma.com/design/KjxgrXFxhRc4pLNSO0o5Fe/PeRu-Web-Design?node-id=223-2)) y respetando el **Manual de marca** (logotipos, colores corporativos, líneas planas, estrellas y formas de la marca).

---

## Requisitos

- [Node.js](https://nodejs.org/) **22.12 o superior**
- npm (incluido con Node.js)

## Inicio rápido

```bash
npm install
npm run dev
```

Abre <http://localhost:4321> en el navegador.

| Comando           | Qué hace                                       |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con recarga automática  |
| `npm run build`   | Genera el sitio estático optimizado en `dist/` |
| `npm run preview` | Sirve localmente la carpeta `dist/`            |
| `npm run check`   | Revisa tipos y errores en los componentes      |
| `npm run format`  | Formatea el código (tabulaciones, Prettier)    |

---

## Páginas

<!-- ROUTES:START -->

| Ruta                          | Página (Figma)                                       |
| ----------------------------- | ---------------------------------------------------- |
| `/`                           | Home                                                 |
| `/universidades/`             | Casas de estudio                                     |
| `/universidades/{slug}/`      | Universidad Single (ficha de universidad)            |
| `/blog/`                      | Nuestro Blog                                         |
| `/blog/{slug}/`               | Single Article Text / Single Article Video           |
| `/portal/pago/`               | Portal · Pago                                        |
| `/portal/pago/enviado/`       | Portal · Solicitud de pago enviada                   |
| `/portal/pago/rechazado/`     | Portal · Transacción rechazada                       |
| `/portal/mi-proceso/`         | Portal · Mi proceso (resumen)                        |
| `/portal/mi-proceso/detalle/` | Portal · Mi proceso (todos los estados de cada paso) |

<!-- ROUTES:END -->

Elementos globales: header con menú, menú lateral, footer, botón flotante de WhatsApp, modal de inicio de sesión/registro (6 pasos), selector de idioma y aviso de cookies.

### En construcción

Estas piezas del diseño aún no están implementadas (sus archivos existen como base con un `TODO`):

- Home: “¿Por qué elegir Peruana en Rusia?”, “¿Qué tengo que hacer?”, “¿Quieres iniciar tu proceso ahora?”, “Mira cómo estamos revolucionando vidas”, “Una comunidad que cambia vidas” y “Preguntas frecuentes” (`src/components/sections/home/`).
- Página de caso de éxito `/casos-de-exito/{slug}/` (ya existen sus primeras secciones en `src/components/sections/testimony/`).
- `/legales/`, `/libro-de-reclamaciones/` y la página 404.

---

## Tecnología

- **[Astro](https://astro.build)**: componentes `.astro` con sintaxis muy cercana a HTML; genera HTML estático (rápido y bueno para SEO).
- **CSS con design tokens** (`src/styles/tokens.css`): sin frameworks CSS; cada componente trae sus estilos.
- **TypeScript** en datos y scripts.
- **Imágenes optimizadas** automáticamente (WebP y varios tamaños) con `astro:assets`.
- **Poppins** autoalojada con `@fontsource` (sin dependencias externas en tiempo de ejecución).

## Estructura

```text
src/
├── assets/        logos, íconos, gráficos de marca e imágenes
├── components/    ui · cards · layout · overlays · portal · sections/<página>
├── data/          contenido editable (textos, listas, enlaces, contacto)
├── layouts/       BaseLayout · SiteLayout · PortalLayout
├── pages/         rutas del sitio
├── scripts/       comportamiento en el navegador (carrusel, modales…)
├── styles/        tokens, base y utilidades
└── utils/         funciones de ayuda
```

📘 **La guía completa para trabajar y agregar módulos está en [`docs/GUIA-DESARROLLO.md`](docs/GUIA-DESARROLLO.md).**

---

## Marca

| Elemento                          | Implementación                                                                                                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colores corporativos              | `src/styles/tokens.css` (`--color-blue` #007AFC, `--color-red` #FF1A30, `--color-white` #F4F4F4 y secundarios)                                                                                       |
| Logotipo                          | SVG vectoriales generados desde los archivos oficiales `.ai` → `src/assets/brand/` y componente `<Logo />` (vertical, horizontal, compacto “PeRu” y símbolo)                                         |
| Líneas planas, estrellas y formas | `src/assets/graphics/`                                                                                                                                                                               |
| Tipografía                        | Poppins (fuente del diseño web). El Manual define **Aeonik**: si se adquiere su licencia web, se cambia en una sola línea (`--font-family-base` en `tokens.css`) agregando sus archivos `@font-face` |

---

## Antes de publicar el sitio

El proyecto incluye **contenido de ejemplo** tomado del diseño. Reemplázalo por el definitivo:

- [ ] Testimonios reales y autorizados → `src/data/testimonials.ts`
- [ ] Lista de universidades, fotos y logos → `src/data/universities.ts`
- [ ] Videos (títulos, fechas, miniaturas e ID de YouTube) → `src/data/videos.ts`
- [ ] URLs de redes sociales, teléfono y correo → `src/data/site.ts`
- [ ] Video de presentación del Home → `videoSrc` en `src/components/sections/home/HomeHero.astro`
- [ ] Textos legales → `src/data/legal.ts`
- [ ] Dominio definitivo → `site` en `astro.config.mjs`

Integraciones de backend pendientes (marcadas con `TODO` en el código): inicio de sesión/registro, envío del Libro de reclamaciones, carga de archivos y datos reales del portal del estudiante.

## Despliegue

`npm run build` genera archivos estáticos en `dist/`, que se pueden publicar en cualquier hosting estático (Netlify, Vercel, Cloudflare Pages, GitHub Pages, un servidor Apache/Nginx, etc.).
