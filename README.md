# Peruana en Rusia — Sitio web

> **Tu futuro, sin fronteras.**

Sitio web de **Peruana en Rusia**, construido a partir del diseño de Figma ([PeRu Web Design](https://www.figma.com/design/KjxgrXFxhRc4pLNSO0o5Fe/PeRu-Web-Design?node-id=223-2)) y respetando el **Manual de marca** (logotipos, colores corporativos, líneas planas, estrellas y formas de la marca).

Incluye el sitio público completo, el portal del estudiante, inicio de sesión con **Google** o con código por correo, **Libro de reclamaciones** virtual, integración lista con **WordPress** como gestor de contenidos, **SEO avanzado** y **cabeceras y políticas de seguridad**.

---

## Requisitos

- [Node.js](https://nodejs.org/) **22.12 o superior**
- npm (incluido con Node.js)

## Inicio rápido

```bash
npm install
cp .env.example .env   # opcional: todas las variables son opcionales en desarrollo
npm run dev
```

Abre <http://localhost:4321> en el navegador.

| Comando           | Qué hace                                                            |
| ----------------- | ------------------------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con recarga automática                       |
| `npm run build`   | Compila el sitio en `dist/` (páginas estáticas + rutas de servidor) |
| `npm start`       | Servidor de producción (`server.mjs`, con cabeceras de seguridad)   |
| `npm run preview` | Vista previa de la compilación con el servidor de Astro             |
| `npm run check`   | Revisa tipos y errores en los componentes                           |
| `npm run format`  | Formatea el código (tabulaciones, Prettier)                         |

---

## Páginas

<!-- ROUTES:START -->

| Ruta                          | Página (Figma)                                       | Tipo              |
| ----------------------------- | ---------------------------------------------------- | ----------------- |
| `/`                           | Home                                                 | Estática          |
| `/universidades/`             | Casas de estudio                                     | Estática          |
| `/universidades/{slug}/`      | Universidad Single (ficha de universidad)            | Estática          |
| `/casos-de-exito/{slug}/`     | My testimony (historia completa de un caso de éxito) | Estática          |
| `/blog/`                      | Nuestro Blog                                         | Estática          |
| `/blog/{slug}/`               | Single Article Text / Single Article Video           | Estática          |
| `/legales/`                   | Legales                                              | Estática          |
| `/libro-de-reclamaciones/`    | Libro de reclamaciones                               | Estática + API    |
| `/404`                        | 404                                                  | Estática          |
| `/portal/pago/`               | Portal · Pago                                        | Servidor (sesión) |
| `/portal/pago/enviado/`       | Portal · Solicitud de pago enviada                   | Servidor (sesión) |
| `/portal/pago/rechazado/`     | Portal · Transacción rechazada                       | Servidor (sesión) |
| `/portal/mi-proceso/`         | Portal · Mi proceso (resumen)                        | Servidor (sesión) |
| `/portal/mi-proceso/detalle/` | Portal · Mi proceso (todos los estados de cada paso) | Servidor (sesión) |

<!-- ROUTES:END -->

Elementos globales: header con menú, menú lateral, footer, botón flotante de WhatsApp, modal de inicio de sesión/registro (6 pasos, con Google y código por correo), selector de idioma y aviso de cookies.

Archivos para buscadores: `/sitemap-index.xml`, `/robots.txt`, `/rss.xml`, `/site.webmanifest` y `/.well-known/security.txt`.

### API (servidor)

| Ruta                             | Uso                                          |
| -------------------------------- | -------------------------------------------- |
| `GET /api/auth/google/`          | Inicia sesión con Google (OAuth 2.0 + PKCE)  |
| `GET /api/auth/google/callback/` | Vuelta desde Google                          |
| `POST /api/auth/email/start/`    | Envía el código de acceso por correo         |
| `POST /api/auth/email/verify/`   | Valida el código e inicia la sesión          |
| `POST /api/auth/email/resend/`   | Reenvía el código                            |
| `GET /api/auth/session/`         | Estudiante con sesión iniciada               |
| `POST /api/auth/logout/`         | Cierra la sesión                             |
| `POST /api/reclamaciones/`       | Registra una hoja del Libro de reclamaciones |

---

## Tecnología

- **[Astro 7](https://astro.build)**: páginas estáticas (rápidas y óptimas para SEO) + rutas de servidor con el adaptador **Node.js** solo donde hace falta (inicio de sesión, portal y reclamaciones).
- **CSS con design tokens** (`src/styles/tokens.css`): sin frameworks CSS; cada componente trae sus estilos.
- **TypeScript** en datos, scripts y servidor; variables de entorno tipadas con `astro:env`.
- **Imágenes optimizadas** automáticamente (WebP y varios tamaños) con `astro:assets`, también las de WordPress.
- **Poppins** autoalojada con `@fontsource` (sin dependencias externas en tiempo de ejecución).
- **Sesiones de Astro** en el servidor, **jose** (verificación de tokens de Google), **sanitize-html** (contenido de WordPress) y **nodemailer** (correo SMTP).

## Estructura

```text
src/
├── assets/        logos, íconos, gráficos de marca e imágenes
├── components/    ui · cards · forms · layout · overlays · portal · sections/<página>
├── data/          contenido local editable (textos, listas, enlaces, contacto)
├── layouts/       BaseLayout (SEO) · SiteLayout · PortalLayout
├── lib/
│   ├── content/   capa de contenido: WordPress o datos locales
│   ├── seo/       datos estructurados e imagen para compartir
│   └── server/    inicio de sesión, correo, reclamaciones, seguridad
├── pages/         rutas del sitio (+ pages/api/ para el servidor)
├── scripts/       comportamiento en el navegador (carrusel, modales, formularios…)
├── styles/        tokens, base y utilidades
├── middleware.ts  sesión, portal protegido y cabeceras de seguridad
└── utils/         funciones de ayuda
config/            cabeceras de seguridad (una sola fuente)
wordpress/         plugin "peru-headless" para el WordPress del contenido
server.mjs         servidor de producción
```

📘 **Guías**:

| Guía                                          | Contenido                                                 |
| --------------------------------------------- | --------------------------------------------------------- |
| [GUIA-DESARROLLO.md](docs/GUIA-DESARROLLO.md) | Estructura, convenciones y cómo agregar páginas y módulos |
| [WORDPRESS.md](docs/WORDPRESS.md)             | Conectar WordPress como gestor de contenidos              |
| [AUTENTICACION.md](docs/AUTENTICACION.md)     | Inicio de sesión con Google y por correo                  |
| [DESPLIEGUE.md](docs/DESPLIEGUE.md)           | Publicar en Hostinger u otros hostings                    |
| [SEGURIDAD.md](docs/SEGURIDAD.md)             | Medidas de seguridad y mantenimiento                      |
| [SEO.md](docs/SEO.md)                         | Metadatos, datos estructurados, sitemap y rendimiento     |

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

El proyecto incluye **contenido de ejemplo** tomado del diseño. Reemplázalo por el definitivo (en WordPress o en `src/data/`):

- [ ] Testimonios reales y autorizados → `src/data/testimonials.ts` o _Casos de éxito_ en WordPress
- [ ] Lista de universidades, fotos y logos → `src/data/universities.ts` o _Universidades_
- [ ] Videos y artículos del blog → `src/data/videos.ts`, `src/data/articles.ts` o _Entradas_
- [ ] Respuestas de las preguntas frecuentes (borrador) → `src/data/faqs.ts` o _Preguntas frecuentes_
- [ ] Textos legales (borrador para revisión legal) → `src/data/legal.ts` o la página _Legales_
- [ ] Fotos de la comunidad → `src/data/community.ts`
- [ ] Servicios del Libro de reclamaciones → `src/data/complaints.ts`
- [ ] URLs de redes sociales, teléfono y correo → `src/data/site.ts`
- [ ] Video de presentación del Home → `videoSrc` en `src/components/sections/home/HomeHero.astro`
- [ ] Dominio definitivo → variable `SITE_URL`
- [ ] Variables de producción: ver [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md#3-antes-de-publicar-lista-de-control)

Pendiente de backend: los datos del portal del estudiante (estado de los pasos, pagos y documentos) son de ejemplo (`src/data/portal.ts`); la carga de archivos y el pago aún no se envían a un servidor. La traducción del sitio a otros idiomas (selector de idioma) queda preparada pero sin contenido traducido.

## Despliegue

`npm run build` y `npm start` en un hosting con Node.js 22+ (por ejemplo, Hostinger "Aplicación Node.js"). Detalles, variables y alternativas en **[docs/DESPLIEGUE.md](docs/DESPLIEGUE.md)**.
