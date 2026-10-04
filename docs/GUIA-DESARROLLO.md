# Guía de desarrollo

Esta guía explica cómo está organizado el proyecto y cómo agregar nuevas páginas, secciones y componentes manteniendo la coherencia con el **Manual de marca** y el **diseño de Figma**.

---

## 1. Stack

| Herramienta                          | Uso                                                                     |
| ------------------------------------ | ----------------------------------------------------------------------- |
| [Astro](https://docs.astro.build)    | Framework: componentes `.astro` (HTML + CSS + JS) que generan HTML estático |
| TypeScript                           | Tipos para datos y scripts (`src/data`, `src/scripts`)                   |
| CSS con variables (design tokens)    | Sin frameworks CSS. Cada componente trae su propio `<style>` con alcance local |
| `@fontsource/poppins`                | Tipografía del diseño web, autoalojada                                  |
| Prettier                             | Formato del código (tabulaciones)                                       |

Comandos:

```bash
npm install          # instalar dependencias
npm run dev          # servidor de desarrollo → http://localhost:4321
npm run build        # compilar el sitio estático en /dist
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
│   ├── ui/                  Piezas genéricas: Button, Icon, Carousel…
│   ├── cards/               Tarjetas reutilizables: universidad, testimonio, video…
│   ├── layout/              Header, footer, menú lateral, botón de WhatsApp
│   ├── overlays/            Modales y avisos globales (login, idioma, cookies)
│   ├── portal/              Componentes del portal del estudiante
│   └── sections/            Secciones de cada página (una carpeta por página)
├── data/                    Contenido y configuración (textos, listas, enlaces)
├── layouts/                 Plantillas de página (BaseLayout, SiteLayout, PortalLayout)
├── pages/                   Rutas del sitio (cada archivo = una URL)
├── scripts/                 Comportamiento en el navegador (TypeScript)
├── styles/                  Estilos globales: tokens, base y utilidades
└── utils/                   Funciones de ayuda (formato de fechas, etc.)
```

Alias de importación (evitan rutas como `../../..`):
`@assets`, `@components`, `@data`, `@layouts`, `@scripts`, `@styles`, `@utils`.

---

## 3. Cómo agregar…

### …una página nueva

1. Crea el archivo en `src/pages/` (ej. `src/pages/charlas.astro` → `/charlas/`).
2. Envuelve el contenido en `SiteLayout` (sitio público) o `PortalLayout` (portal del estudiante).
3. Si debe aparecer en el menú, agrégala en `src/data/navigation.ts`.

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
		<h2 id="nombre-seccion-title" class="nombre-seccion__title">{content.title}</h2>
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

| Token                                   | Valor              | Origen                     |
| --------------------------------------- | ------------------ | -------------------------- |
| `--color-blue`                          | `#007AFC`          | Manual · Azul principal    |
| `--color-red`                           | `#FF1A30`          | Manual · Rojo principal    |
| `--color-white`                         | `#F4F4F4`          | Manual · Blanco de marca   |
| `--color-orange` / `--color-skyblue` / `--color-green` / `--color-yellow` / `--color-pink` | `#FF7B23` / `#00C0FC` / `#00736A` / `#FBBD1D` / `#FFA2A4` | Manual · Secundarios |
| `--color-blue-title`                    | `#125BA8`          | Figma · Títulos sobre fondo claro |
| `--color-black`                         | `#171A1A`          | Figma · Fondo oscuro       |

### Convenciones

- **Nombres de clases con BEM**: `bloque__elemento--modificador` (ej. `university-card__title`, `btn--primary`).
- Los estilos de cada componente van en su propio `<style>` (alcance local). Para estilizar un componente hijo desde una sección usa `:global()` dentro del selector de la sección:
  `.home-stories :global(.video-card) { … }`.
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

---

## 5. Componentes disponibles

| Componente                     | Uso                                                                    |
| ------------------------------ | ---------------------------------------------------------------------- |
| `ui/Button.astro`              | Botones y enlaces. Variantes `outline` (con la “rayita” de la marca), `primary` (amarillo), `secondary`, `light`. Tonos `light`/`blue`/`dark`. Tamaños `sm`/`md`/`lg`. |
| `ui/Icon.astro`                | Íconos SVG por nombre.                                                 |
| `ui/Carousel.astro`            | Carrusel horizontal con flechas y puntos (tono `light` o `blue`).      |
| `brand/Logo.astro`             | Logotipo oficial.                                                      |
| `cards/UniversityCard.astro`   | Tarjeta de universidad con forma de color.                             |
| `cards/TestimonialCard.astro`  | Tarjeta de caso de éxito.                                              |
| `cards/VideoCard.astro`        | Tarjeta de video.                                                      |

---

## 6. Interactividad (JavaScript)

- El comportamiento vive en `src/scripts/` y se conecta con el HTML mediante atributos `data-*`.
- **Modales y menú lateral**: son elementos `<dialog>`. Cualquier botón con `data-dialog-open="id-del-dialog"` lo abre, y uno con `data-dialog-close` lo cierra (ver `src/scripts/dialog.ts`).
- **Carruseles**: automáticos con el componente `Carousel`.
- Usa `<script>` dentro del componente solo para lógica propia de ese componente.

---

## 7. Formato y estilo de código

- Indentación con **tabulaciones** (configurado en `.editorconfig` y `.prettierrc.mjs`). Ejecuta `npm run format` antes de subir cambios.
- Comentarios y documentación en **español**; nombres de variables y componentes en **inglés**.
- Cada componente empieza con un comentario que explica qué es, de qué parte del diseño de Figma sale y cómo se usa.
- HTML semántico y accesible: un `h1` por página, títulos en orden, `alt` en imágenes de contenido, `aria-label` en botones de solo ícono.
