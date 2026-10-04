# WordPress como gestor de contenidos (headless)

El sitio está listo para que el equipo edite el contenido desde **WordPress**, sin tocar código. WordPress funciona como **gestor de contenidos "headless"**: solo guarda y organiza el contenido; el sitio público (Astro) lo lee por la REST API al compilar y genera páginas estáticas, rápidas y seguras.

```text
Equipo edita en WordPress ──▶ REST API ──▶ Astro compila el sitio ──▶ HTML estático
          (cms.peruanaenrusia.pe)                (peruanaenrusia.pe)
```

Sin WordPress configurado, el sitio usa el contenido de ejemplo de `src/data/` (funciona igual).

---

## 1. Qué se gestiona desde WordPress

| Contenido en el sitio                        | En WordPress                                       | Ruta de la REST API             |
| -------------------------------------------- | -------------------------------------------------- | ------------------------------- |
| Blog: artículos (`/blog/{slug}/`)            | **Entradas**                                       | `/wp/v2/posts`                  |
| Blog: videos ("Videoblogs", "Más historias") | **Entradas** con el campo _Código de YouTube_      | `/wp/v2/posts`                  |
| "Novedades" del blog                         | Entradas **fijadas** (sticky)                      | —                               |
| "Clásicos" del blog                          | Campo _Mostrar en "Clásicos"_ o etiqueta `clasico` | —                               |
| Universidades y sus fichas                   | **Universidades** (tipo propio)                    | `/wp/v2/universidades`          |
| Casos de éxito y su historia completa        | **Casos de éxito** (tipo propio)                   | `/wp/v2/casos-de-exito`         |
| Preguntas frecuentes del Home                | **Preguntas frecuentes** (tipo propio)             | `/wp/v2/preguntas-frecuentes`   |
| Página "Legales"                             | **Página** con el slug `legales`                   | `/wp/v2/pages?slug=legales`     |
| Cuentas de estudiantes                       | **Usuarios** con el rol _Estudiante_               | `/peru/v1/students` (privada)   |
| Libro de reclamaciones                       | **Libro de reclamaciones** (privado)               | `/peru/v1/complaints` (privada) |

El orden de universidades, casos de éxito y preguntas se define con el campo **Orden** (atributos de página) de cada una.

---

## 2. Instalación

1. Instala WordPress en un subdominio, por ejemplo `cms.peruanaenrusia.pe` (en Hostinger: _Sitios web → Agregar sitio → WordPress_).
2. Copia la carpeta [`wordpress/peru-headless/`](../wordpress/peru-headless/) de este repositorio a `wp-content/plugins/` y activa el plugin **Peruana en Rusia — WordPress headless**.
3. (Recomendado) Instala y activa **Advanced Custom Fields** (versión gratuita). Con ACF, cada tipo de contenido muestra formularios cómodos; sin ACF, los campos se editan en el panel "Campos personalizados".
4. En _Ajustes → Enlaces permanentes_ elige "Nombre de la entrada" y guarda.
5. Agrega en `wp-config.php`:

   ```php
   define( 'PERU_FRONTEND_URL', 'https://peruanaenrusia.pe' );      // enlaces "Ver" del panel
   define( 'PERU_GITHUB_REPO', 'ferdango/peruanaenrusia' );         // ver sección 5 (GitHub Pages)
   define( 'PERU_GITHUB_TOKEN', 'github_pat_…' );                  // ver sección 5
   define( 'PERU_REDIRECT_FRONTEND', true );                        // el WordPress público redirige al sitio
   ```

6. Crea un usuario administrador **de servicio** (ej. `servicio-web`) y, en su perfil, una **contraseña de aplicación** (_Usuarios → Perfil → Contraseñas de aplicación_). El sitio la usa para guardar cuentas de estudiantes y reclamaciones.

---

## 3. Conectar el sitio

En el archivo `.env` (o en el panel del hosting):

```bash
WORDPRESS_URL=https://cms.peruanaenrusia.pe
WORDPRESS_USER=servicio-web
WORDPRESS_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx"
```

Luego compila (`npm run build`). Con `WORDPRESS_URL` definida:

- Todo el contenido de la tabla anterior sale de WordPress (`src/lib/content/`).
- Las imágenes de la biblioteca de medios se optimizan al compilar (WebP, varios tamaños) igual que las locales.
- El HTML de las entradas, respuestas y textos legales se **sanea** antes de mostrarse (se eliminan scripts, estilos y atributos peligrosos: `src/lib/content/sanitize.ts`).
- Si WordPress no responde, la compilación se detiene con un mensaje claro (no se publica un sitio vacío).

Las cuentas de estudiantes y las reclamaciones se guardan en WordPress si además están `WORDPRESS_USER` y `WORDPRESS_APP_PASSWORD`; si no, en la carpeta privada `.data/` del servidor.

---

## 4. Campos de cada tipo

### Entradas (blog)

- **Imagen destacada**: foto de la tarjeta y de la página (mín. 1536 px de ancho).
- **Extracto**: bajada bajo el título y descripción para buscadores.
- **Categoría**: se muestra sobre el título.
- **Código del video de YouTube** (`peru_youtube_id`): si se completa, la entrada es un **video** (diseño "Single Article Video"). También se puede usar la categoría `videoblogs`.
- **Fijar entrada** (sticky): aparece en "Novedades".
- **Mostrar en "Clásicos"** (`peru_classic`).

### Universidades

Título = nombre · Extracto = resumen · Imagen destacada = foto principal · Campos: ciudad, destacada en el Home, sitio web, logo, foto de cabecera, 2 fotos de la ficha, descripción (párrafos separados por una línea en blanco), "La universidad cuenta con" (uno por línea), áreas de estudio (una por línea: `Facultad | Descripción`), rankings, vida estudiantil y consejos.

### Casos de éxito

Título = nombre del estudiante · Campos: carrera y universidad, país, frase de la tarjeta, foto de perfil, frase de la portada, foto de la portada, miniatura y enlace del video, cita destacada, dos bloques del **paso a paso** (foto grande + 4 casillas de texto o foto), 4 publicaciones (foto, enlace, "tiene varias fotos") y la cita y texto finales. Las secciones sin datos no se muestran.

### Preguntas frecuentes

Título = pregunta · Contenido = respuesta (admite negritas, enlaces y listas).

### Página "Legales"

Una página con el slug `legales`. Cada **Título 2** (`<h2>`) se numera automáticamente ("1. Introducción", "2. Condiciones generales"…). El extracto se usa como bajada.

---

## 5. Publicar cambios automáticamente

Como el sitio es estático, hay que recompilarlo cuando cambia el contenido. El plugin lo pide **2 minutos después** de publicar, actualizar o eliminar contenido (agrupa varios cambios seguidos). También se puede lanzar a mano en _Herramientas → Recompilar sitio_.

Qué configurar en `wp-config.php` depende de dónde se publica:

- **GitHub Pages** (workflow [`github-pages.yml`](../.github/workflows/github-pages.yml)): `PERU_GITHUB_REPO` (`'ferdango/peruanaenrusia'`) y `PERU_GITHUB_TOKEN`. Crea el token en GitHub → _Settings → Developer settings → Fine-grained tokens_, con acceso **solo** a este repositorio y el permiso **Contents: Read and write** (con eso puede lanzar el workflow). Guárdalo únicamente en `wp-config.php`. En el repositorio, crea la variable `WORDPRESS_URL` para que la compilación lea el contenido ([DESPLIEGUE.md](DESPLIEGUE.md#2-github-pages-html-puro)).
- **Netlify / Vercel / Cloudflare Pages**: `PERU_DEPLOY_HOOK_URL` con el "Deploy hook" del proyecto.
- **Hostinger (Node.js)**: `PERU_DEPLOY_HOOK_URL` con un webhook de despliegue del repositorio, o un script en el servidor que ejecute `git pull && npm ci && npm run build` y reinicie la app.

---

## 6. Contrato de datos (para desarrolladores)

Cada universidad, caso de éxito y entrada expone en la REST API un campo **`peru`** con los datos ya normalizados (lo arma `wordpress/peru-headless/includes/rest-fields.php`). Las imágenes llegan así:

```json
{ "src": "https://cms…/foto.jpg", "width": 1600, "height": 1067, "alt": "Descripción" }
```

El sitio convierte ese contrato a los tipos de `src/data/` en `src/lib/content/wordpress.ts`. **Si cambias un nombre de campo en el plugin, cámbialo también ahí.** Las entradas con datos obligatorios faltantes (ej. universidad sin logo) se omiten con una advertencia en la compilación.
