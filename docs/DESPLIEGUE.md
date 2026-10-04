# Despliegue

El sitio combina **páginas estáticas** (todo el sitio público, generado al compilar) con unas pocas **rutas de servidor** (inicio de sesión, portal del estudiante y Libro de reclamaciones). Hay dos formas de publicarlo:

- **Con servidor Node.js 22.12 o superior** (sección 1): el sitio completo, con inicio de sesión real y Libro de reclamaciones.
- **GitHub Pages, HTML puro** (sección 2): solo archivos estáticos, con el acceso en modo demostración. Ideal para revisar el diseño.

```text
npm run build   →  dist/client/  páginas, imágenes, CSS y JS (estáticos)
                   dist/server/  rutas bajo demanda (/api/*, /portal/*)
npm start       →  server.mjs: sirve todo y agrega las cabeceras de seguridad
```

---

## 1. Hostinger (Node.js)

1. En hPanel: _Sitios web → Agregar sitio → Aplicación Node.js_ y conecta el repositorio de GitHub (o sube el código).
2. Configuración de la app:
   - **Versión de Node**: 22.x o superior.
   - **Comando de instalación**: `npm ci`
   - **Comando de compilación**: `npm run build`
   - **Comando de inicio**: `npm start` (archivo de entrada `server.mjs`)
3. **Variables de entorno** (ver [`.env.example`](../.env.example)). Mínimo para producción:

   | Variable                                    | Para qué                                                        |
   | ------------------------------------------- | --------------------------------------------------------------- |
   | `SITE_URL`                                  | Dominio público (canónicas, sitemap, vuelta de Google)          |
   | `SESSION_SECRET`                            | Firma de los códigos de acceso (32+ caracteres aleatorios)      |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Inicio de sesión con Google ([guía](AUTENTICACION.md))          |
   | `SMTP_*` o `RESEND_API_KEY`, `MAIL_FROM`    | Códigos de acceso y constancias de reclamación                  |
   | `COMPLAINTS_EMAIL`                          | Dónde llegan las reclamaciones                                  |
   | `TRUST_PROXY=true`                          | Hostinger atiende detrás de un proxy (IP real para los límites) |
   | `WORDPRESS_*`                               | Si se usa WordPress ([guía](WORDPRESS.md))                      |

4. **Carpeta de datos**: las sesiones (y, sin WordPress, las cuentas y reclamaciones) se guardan en `.data/` (o `DATA_DIR`). Debe estar en un disco **persistente** y fuera de la carpeta pública. Haz copias de seguridad si no usas WordPress: la ley exige conservar las reclamaciones.
5. Activa **SSL** (Let's Encrypt) y fuerza HTTPS.

> `SITE_URL` y `WORDPRESS_URL` se leen **al compilar**: si las cambias, vuelve a compilar. Las demás variables se leen al iniciar el servidor.

### Recompilar al cambiar contenido

Con WordPress, cada publicación pide recompilar el sitio (`PERU_DEPLOY_HOOK_URL`, ver [WORDPRESS.md](WORDPRESS.md#5-publicar-cambios-automáticamente)).

---

## 2. GitHub Pages (HTML puro)

La versión estática se publica en **<https://ferdango.github.io/peruanaenrusia/>**. GitHub Pages solo sirve archivos (no ejecuta Node), así que se compila con `DEPLOY_TARGET=static`: el resultado es HTML, CSS, JavaScript e imágenes, sin Astro ni servidor.

**Cómo se publica.** El workflow [`.github/workflows/github-pages.yml`](../.github/workflows/github-pages.yml) compila el sitio y sube `dist/client/` a la rama **`gh-pages`**, que es la que muestra GitHub Pages (_Settings → Pages → Deploy from a branch → `gh-pages` / root_). Se ejecuta:

- al subir cambios a `master`;
- a mano: _Actions → Publicar en GitHub Pages → Run workflow_;
- cuando WordPress publica contenido (ver [WORDPRESS.md](WORDPRESS.md#5-publicar-cambios-automáticamente)).

La rama `gh-pages` no se edita a mano: se reemplaza en cada publicación.

**Qué cambia respecto al servidor**

| Función                               | Con servidor (Node)               | GitHub Pages                                                       |
| ------------------------------------- | --------------------------------- | ------------------------------------------------------------------ |
| Páginas públicas, blog, universidades | Sí                                | Sí (el mismo HTML)                                                 |
| Inicio de sesión (Google y correo)    | Real                              | Demostración: acepta cualquier correo y código, sin enviar datos   |
| Portal del estudiante                 | Protegido por sesión              | Páginas de ejemplo con datos ficticios                             |
| Libro de reclamaciones                | Registra y envía la constancia    | Muestra el correo para reclamar; no envía nada                     |
| Cabeceras de seguridad                | `server.mjs` (HSTS, CSP, marcos…) | Solo la CSP en `<meta>`: GitHub Pages no permite cabeceras propias |
| Buscadores                            | Se indexa                         | `*.github.io` no se indexa (dirección temporal)                    |

> El Libro de reclamaciones virtual es obligatorio en el sitio oficial. Para publicar en el dominio definitivo usa el servidor Node (sección 1).

**Contenido de WordPress.** Crea la variable del repositorio `WORDPRESS_URL` (_Settings → Secrets and variables → Actions → Variables_) y vuelve a ejecutar el workflow.

**Dominio propio.** En _Settings → Pages → Custom domain_ escribe el dominio y apunta el DNS a GitHub Pages. El workflow lo detecta solo: publica sin subcarpeta y el sitio pasa a indexarse (con las limitaciones de la tabla).

**Probar la versión estática en tu equipo:**

```bash
DEPLOY_TARGET=static SITE_URL=https://ferdango.github.io BASE_PATH=/peruanaenrusia npm run build
```

Luego sirve `dist/client/` bajo la ruta `/peruanaenrusia/` con cualquier servidor estático.

> Todas las rutas internas incluyen la subcarpeta (`BASE_PATH`): escríbelas con `routes` o `withBase()` (ver [GUIA-DESARROLLO.md](GUIA-DESARROLLO.md)), nunca como `"/blog/"` a mano.

---

## 3. Otros hostings

- **Cualquier VPS / servidor con Node**: `npm ci && npm run build && npm start` detrás de Nginx o Caddy (HTTPS), con un gestor de procesos (pm2, systemd). Define `PORT` y `HOST` si hace falta.
- **Vercel / Netlify / Cloudflare**: cambia el adaptador `@astrojs/node` por el del proveedor en `astro.config.mjs` y reemplaza el almacenamiento de sesiones y de límites por uno compartido (ej. Redis/KV), porque no hay disco persistente.
- **Solo estático en otro hosting** (sin Node): compila como en la sección 2 (`DEPLOY_TARGET=static`) y publica `dist/client/`; incluye `.htaccess` y `_headers` con las cabeceras de seguridad para Apache, Netlify o Cloudflare Pages. Tiene las mismas limitaciones que GitHub Pages.

---

## 4. Antes de publicar (lista de control)

- [ ] `SITE_URL` con el dominio definitivo y HTTPS activo.
- [ ] `SESSION_SECRET` aleatorio y distinto al de desarrollo.
- [ ] Google: URI de redirección de producción registrada y app de OAuth publicada.
- [ ] Correo: SMTP o Resend configurado; probar un código de acceso y una reclamación.
- [ ] `PORTAL_DEMO` en `false` (o sin definir).
- [ ] Contenido real (ver la lista del [README](../README.md#antes-de-publicar-el-sitio)).
- [ ] Textos legales revisados por la asesoría legal.
- [ ] Sitemap enviado a Google Search Console: `https://peruanaenrusia.pe/sitemap-index.xml`.
- [ ] Revisar las cabeceras en <https://securityheaders.com> y el rendimiento en PageSpeed Insights.
