# Guía de desarrollo

Esta guía explica cómo está organizado el proyecto y cómo agregar nuevas páginas, secciones y componentes manteniendo la coherencia con el **Manual de marca** y el **diseño de Figma**.

---

## 1. Stack

| Herramienta                       | Uso                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------ |
| [Astro](https://docs.astro.build) | Framework: componentes `.astro` (HTML + CSS + JS) que generan HTML estático    |
| `@astrojs/node`                   | Servidor Node.js para las rutas bajo demanda (`/api/*`, `/portal/*`)           |
| TypeScript                        | Tipos para datos, scripts y servidor (`src/data`, `src/scripts`, `src/lib`)    |
| `astro:env`                       | Variables de entorno tipadas (ver `.env.example`)                              |
| CSS con variables (design tokens) | Sin frameworks CSS. Cada componente trae su propio `<style>` con alcance local |
| `@fontsource/poppins`             | Tipografía del diseño web, autoalojada                                         |
| Prettier                          | Formato del código (tabulaciones)                                              |

Comandos:

```bash
npm install          # instalar dependencias
npm run dev          # servidor de desarrollo → http://localhost:4321
npm run build        # compilar el sitio en /dist (estático + servidor)
npm start            # servidor de producción (server.mjs)
# versión HTML puro para GitHub Pages: DEPLOY_TARGET=static (ver docs/DESPLIEGUE.md)
npm run preview      # previsualizar la compilación
npm run check        # revisar tipos y errores
npm run format       # formatear todo el código
```

---

## 2. Estructura de carpetas

```text
src/
├── assets/                  Archivos procesados por Astro (se optimizan al compilar)
│   ├── brand/               Logotipos y símbolo oficiales (SVG del Manual de marca)
│   ├── icons/               Íconos SVG de la interfaz (currentColor)
│   ├── graphics/            Recursos gráficos de marca: ondas, formas, estrellas
│   └── images/              Fotos, organizadas por página o tema
├── components/
│   ├── brand/               Logo
│   ├── ui/                  Piezas genéricas: Button, Icon, Carousel, MediaImage…
│   ├── cards/               Tarjetas reutilizables: universidad, testimonio, video…
│   ├── forms/               Campos de formulario: FormField, FormCheck
│   ├── layout/              Header, footer, menú lateral, botón de WhatsApp
│   ├── overlays/            Modales y avisos globales (login, idioma, cookies)
│   ├── portal/              Componentes del portal del estudiante
│   └── sections/            Secciones de cada página (una carpeta por página;
│                            `shared/` = bloques que usan varias páginas)
├── data/                    Contenido local y configuración (textos, listas, enlaces)
├── layouts/                 Plantillas de página (BaseLayout, SiteLayout, PortalLayout)
├── lib/
│   ├── content/             Capa de contenido: WordPress o datos locales
│   ├── seo/                 Datos estructurados (JSON-LD) e imagen para compartir
│   └── server/              Código de servidor: sesión, Google, correo, reclamaciones
├── pages/                   Rutas del sitio (cada archivo = una URL)
│   └── api/                 Rutas de servidor (JSON)
├── scripts/                 Comportamiento en el navegador (TypeScript)
├── styles/                  Estilos globales: tokens, base y utilidades
├── middleware.ts            Sesión, portal protegido y cabeceras de seguridad
└── utils/                   Funciones de ayuda (formato de fechas, etc.)
config/security-headers.mjs  Cabeceras de seguridad (una sola fuente)
wordpress/peru-headless/     Plugin para el WordPress del contenido
server.mjs                   Servidor de producción
```

Alias de importación (evitan rutas como `../../..`):
`@assets`, `@components`, `@data`, `@layouts`, `@lib`, `@scripts`, `@styles`, `@utils`.

---

## 3. Cómo agregar…

### …una página nueva

1. Crea el archivo en `src/pages/` (ej. `src/pages/charlas.astro` → `/charlas/`).
2. Envuelve el contenido en `SiteLayout` (sitio público) o `PortalLayout` (portal del estudiante).
3. Si debe aparecer en el menú, agrégala en `src/data/navigation.ts`.

> **Enlaces internos**: usa `routes` / `detailRoutes` (`src/data/navigation.ts`) o `withBase('/charlas/')` (`src/utils/url.ts`); nunca escribas `href="/charlas/"` a mano. El sitio también se publica dentro de una subcarpeta (GitHub Pages: `/peruanaenrusia/`) y esas funciones la agregan.

```astro
---
import SiteLayout from '@layouts/SiteLayout.astro';
import CharlasHero from '@components/sections/charlas/CharlasHero.astro';
---

<SiteLayout title="Charlas informativas" description="…">
  <CharlasHero />
</SiteLayout>
```

### …una sección (módulo) en una página

1. Crea el componente en `src/components/sections/<página>/` (ej. `HomeTestimonios.astro`).
2. Impórtalo y colócalo en la página, en el orden deseado.

Cada sección sigue este esquema:

```astro
---
/**
 * NombreSeccion — "Título visible"
 * Figma: Página › "Nombre del frame" (id del nodo)
 */
import Button from '@components/ui/Button.astro';

// ----- Contenido de la sección -----
const content = {
  title: 'Título',
  subtitle: 'Bajada…',
};
---

<section class="nombre-seccion section" id="ancla" aria-labelledby="nombre-seccion-title">
  <div class="container">
    <h2 id="nombre-seccion-title" class="nombre-seccion__title">
      {content.title}
    </h2>
    …
  </div>
</section>

<style>
  .nombre-seccion {
    background-color: var(--surface-dark);
  }
</style>
```

- **Textos fijos** de la sección → objeto `content` al inicio del componente.
- **Listas** (tarjetas, preguntas, pasos…) → archivo en `src/data/` (así se editan sin tocar el diseño).

### …contenido editable (blog, universidades, casos, preguntas, legales)

Pide siempre el contenido a la **capa de contenido** (`src/lib/content/`), nunca directamente a `src/data/`. Así el mismo componente funciona con los datos locales o con WordPress (ver [WORDPRESS.md](WORDPRESS.md)):

```astro
---
import { getFaqs } from '@lib/content';
const faqs = await getFaqs();
---
```

Las imágenes de ese contenido pueden ser locales o remotas: dibújalas con `<MediaImage image={…} alt="…" />` (mismas props que `<Image />`).

El texto fijo de una sección (títulos, botones) sigue en su objeto `content`; los datos de ejemplo, en `src/data/`.

### …una ruta de servidor (API)

1. Crea el archivo en `src/pages/api/` con `export const prerender = false;`.
2. Lee el cuerpo con `readJson()` y responde con `json()` / `jsonError()` (`src/lib/server/http.ts`): validan tamaño y formato y evitan la caché.
3. Valida cada campo en el servidor y limita los intentos con `rateLimit()`.
4. El middleware ya exige el mismo origen para los envíos (POST/PUT…).

### …un ícono

Guarda el `.svg` en `src/assets/icons/` con `fill="currentColor"` / `stroke="currentColor"` y úsalo por su nombre: `<Icon name="nombre-del-archivo" />`.

### …una imagen

Guárdala en `src/assets/images/<página>/` e impórtala. Usa siempre `<Image />` de Astro: genera versiones optimizadas (WebP) automáticamente.

```astro
---
import { Image } from 'astro:assets';
import foto from '@assets/images/home/estudiante.jpg';
---

<Image src={foto} alt="Descripción de la foto" widths={[400, 800]} sizes="400px" />
```

---

## 4. Estilos

### Design tokens (`src/styles/tokens.css`)

Todos los colores, tamaños de letra, espaciados y radios son variables CSS. **No escribas colores ni tamaños “a mano”** si existe un token.

| Token                                                                                      | Valor                                                     | Origen                            |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------- | --------------------------------- |
| `--color-blue`                                                                             | `#007AFC`                                                 | Manual · Azul principal           |
| `--color-red`                                                                              | `#FF1A30`                                                 | Manual · Rojo principal           |
| `--color-white`                                                                            | `#F4F4F4`                                                 | Manual · Blanco de marca          |
| `--color-orange` / `--color-skyblue` / `--color-green` / `--color-yellow` / `--color-pink` | `#FF7B23` / `#00C0FC` / `#00736A` / `#FBBD1D` / `#FFA2A4` | Manual · Secundarios              |
| `--color-blue-title`                                                                       | `#125BA8`                                                 | Figma · Títulos sobre fondo claro |
| `--color-black`                                                                            | `#171A1A`                                                 | Figma · Fondo oscuro              |

**Tipografía en móvil (≤ 640 px)**: todas las secciones usan la misma escala. En el bloque `@media (max-width: 640px)` de cada componente usa `--font-size-title-mobile` (28px) y `--line-height-title-mobile` para los títulos de sección, `--font-size-display-mobile` (40px) para el hero, `--font-size-card-title-mobile` (18px) para los títulos de tarjeta y `--font-size-md` (16px) para los textos.

### Convenciones

- **Nombres de clases con BEM**: `bloque__elemento--modificador` (ej. `university-card__title`, `btn--primary`).
- Los estilos de cada componente van en su propio `<style>` (alcance local). Para estilizar un componente hijo desde una sección usa `:global()` dentro del selector de la sección:
  `.blog-videoblogs :global(.video-card) { … }`.
- Contenedor estándar: clase `.container` (ancho máximo 1352px + márgenes laterales de 80px en desktop).
- Sección estándar: clase `.section` (80px de padding vertical en desktop).
- Breakpoints:
  - `@media (max-width: 1100px)` → tablet (el menú del header pasa al menú lateral).
  - `@media (max-width: 640px)` → móvil (diseño "UI Mobile" de Figma, 360px).

### Recursos gráficos de la marca

Según el Manual de marca:

- **Líneas planas** (ondas de un color, curvas, sin degradé) → `src/assets/graphics/waves/`.
- **Estrella / elemento unión** (4 puntas) → `src/assets/graphics/stars/`.
- **Formas de color** de tarjetas → `src/assets/graphics/shapes/`.
- **Logotipo**: usa siempre el componente `<Logo />` (versiones vertical, horizontal, compacta y símbolo). No modificar colores, no rotar, no deformar.

Las decoraciones llevan `aria-hidden="true"` y la clase `.decoration` (no interfieren con los clics).

> **Importante:** para recortar decoraciones que sobresalen (ondas, formas) usa `overflow: clip` en lugar de `overflow: hidden`. Con `hidden` el contenedor puede desplazarse solo al recibir foco con el teclado y el contenido “se corre”.

---

## 5. Componentes disponibles

| Componente                       | Uso                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui/Button.astro`                | Botones y enlaces. Variantes `outline` (el botón de las secciones: píldora con una burbuja y flecha —u otro ícono con `icon`— que al pasar el cursor crece y rellena el botón), `primary` (amarillo, el del hero), `secondary`, `light`. Tonos `light`/`blue`/`dark`; para otros colores define `--btn-color` y `--btn-contrast` desde la sección. Tamaños `sm`/`md`/`lg`. |
| `ui/Icon.astro`                  | Íconos SVG por nombre.                                                                                                                                                                                                                                                                                                                                                     |
| `ui/Carousel.astro`              | Carrusel horizontal con flechas y puntos (tono `light` o `blue`).                                                                                                                                                                                                                                                                                                          |
| `brand/Logo.astro`               | Logotipo oficial.                                                                                                                                                                                                                                                                                                                                                          |
| `cards/UniversityCard.astro`     | Tarjeta de universidad con forma de color.                                                                                                                                                                                                                                                                                                                                 |
| `cards/TestimonialCard.astro`    | Tarjeta de caso de éxito.                                                                                                                                                                                                                                                                                                                                                  |
| `cards/VideoCard.astro`          | Tarjeta de video.                                                                                                                                                                                                                                                                                                                                                          |
| `ui/MediaImage.astro`            | Imagen optimizada del contenido (local o de WordPress).                                                                                                                                                                                                                                                                                                                    |
| `forms/FormField.astro`          | Campo con etiqueta flotante, ayuda y error accesible (texto, lista o texto largo).                                                                                                                                                                                                                                                                                         |
| `forms/FormCheck.astro`          | Casilla circular de la marca (consentimiento, "Soy menor de edad").                                                                                                                                                                                                                                                                                                        |
| `sections/shared/StartCta.astro` | Llamado a la acción con dos estudiantes (tono celeste en el Home, verde en los casos de éxito); líneas y figuras animadas con el scroll.                                                                                                                                                                                                                                   |

---

## 6. Interactividad (JavaScript)

- El comportamiento vive en `src/scripts/` y se conecta con el HTML mediante atributos `data-*`.
- **Modales y menú lateral**: son elementos `<dialog>`. Cualquier botón con `data-dialog-open="id-del-dialog"` lo abre, y uno con `data-dialog-close` lo cierra (ver `src/scripts/dialog.ts`).
- **Carruseles**: automáticos con el componente `Carousel`.
- **Formularios**: validación accesible y envío a la API con `src/scripts/forms.ts` (`validateForm`, `postJson`).
- **Inicio de sesión**: `src/scripts/auth-flow.ts` (modal), `src/scripts/auth-api.ts` (llamadas al servidor; en la versión estática, demostración) y `src/scripts/session-ui.ts` (textos de los botones con sesión iniciada). Para abrir el modal desde una URL: `/?login=1`.
- **Movimiento del Home** (solo en la portada): `src/scripts/home-motion.ts` + `src/styles/home.css`. Las listas al inicio del script (`REVEALS`, `PARALLAX`, `TILT`) definen qué aparece al hacer scroll, qué decorados tienen parallax y qué tarjetas se inclinan, por selector y sin tocar los componentes. Los sliders que avanzan con el scroll usan `data-scroll-slider`: `pin` deja la sección fija y pasa las tarjetas una por una ("¿Qué tengo que hacer?"); `drift` las desliza mientras la sección cruza la pantalla ("¿Por qué elegir…?" en tablet y móvil; en desktop sus tres tarjetas van fijas en fila y se mueven con parallax, entradas de `PARALLAX` con `media`). Respeta "reducir movimiento" y sin JavaScript no oculta nada (los sliders quedan como deslizadores táctiles). El header transparente sobre el hero es solo CSS (`animation-timeline: scroll()`).
- **"Soy Grecia Kristal" y "Universidades destacadas"** (también en `home-motion.ts`): en desktop la sección de la fundadora queda fija mientras sus fotos suben y se apilan (`data-founder-stack`; el texto aparece al final) y en universidades el panel abierto avanza con el scroll (`data-uni-gallery`); en tablet y móvil las fotos se apilan sin fijar la sección y las universidades se deslizan como el resto de las filas.
- **Líneas de la marca que se dibujan con el scroll** (`src/scripts/scroll-draw.ts`, en todo el sitio): un elemento con `data-scroll-draw` recibe la variable CSS `--draw` (0 → 1) mientras cruza la pantalla, y su CSS la usa para mover el `stroke-dashoffset` de las líneas (trazos con `pathLength="100"`) y hacer aparecer figuras. Lo usan "¿Quieres iniciar tu proceso?" (`StartCta`) y el footer. Las ondas de Figma venían como cintas rellenas: se convirtieron a trazos con su línea central para poder dibujarlas (mismo aspecto). Sin JavaScript o con "reducir movimiento" se ven completas.
- **Videos en modal** (`src/components/overlays/VideoModal.astro` + `src/scripts/video-modal.ts`): cualquier enlace con `data-video-open` y `data-video-youtube="CODIGO"` (o `data-video-tiktok="NÚMERO"`, que se ve en vertical con el reproductor oficial de TikTok, o `data-video-src="/videos/archivo.mp4"`) abre el video en un modal que se puede minimizar para seguir navegando; sin JavaScript abre YouTube o TikTok. El video destacado del Home (y su portada) se define en `src/data/videos.ts` → `featuredVideo`; los videos de TikTok de "Redes sociales", en `src/data/social.ts`.
- Usa `<script>` dentro del componente solo para lógica propia de ese componente.
- **Seguridad (CSP)**: no uses `<script is:inline>` con código ni atributos como `onclick=`; los scripts normales de Astro ya están permitidos. Las variables CSS en `style=""` sí se pueden usar. Ver [SEGURIDAD.md](SEGURIDAD.md).

---

## 7. Formato y estilo de código

- Indentación con **tabulaciones** (configurado en `.editorconfig` y `.prettierrc.mjs`). Ejecuta `npm run format` antes de subir cambios.
- Comentarios y documentación en **español**; nombres de variables y componentes en **inglés**.
- Cada componente empieza con un comentario que explica qué es, de qué parte del diseño de Figma sale y cómo se usa.
- HTML semántico y accesible: un `h1` por página, títulos en orden, `alt` en imágenes de contenido, `aria-label` en botones de solo ícono.
