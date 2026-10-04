# Despliegue

El sitio combina **páginas estáticas** (todo el sitio público, generado al compilar) con unas pocas **rutas de servidor** (inicio de sesión, portal del estudiante y Libro de reclamaciones). Por eso se publica en un hosting con **Node.js 22.12 o superior**.

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

## 2. Otros hostings

- **Cualquier VPS / servidor con Node**: `npm ci && npm run build && npm start` detrás de Nginx o Caddy (HTTPS), con un gestor de procesos (pm2, systemd). Define `PORT` y `HOST` si hace falta.
- **Vercel / Netlify / Cloudflare**: cambia el adaptador `@astrojs/node` por el del proveedor en `astro.config.mjs` y reemplaza el almacenamiento de sesiones y de límites por uno compartido (ej. Redis/KV), porque no hay disco persistente.
- **Solo estático** (sin Node): se puede publicar `dist/client/` en un hosting compartido (incluye `.htaccess` y `_headers` con las cabeceras de seguridad), pero el inicio de sesión, el portal y el Libro de reclamaciones **no funcionarán** sin el servidor.

---

## 3. Antes de publicar (lista de control)

- [ ] `SITE_URL` con el dominio definitivo y HTTPS activo.
- [ ] `SESSION_SECRET` aleatorio y distinto al de desarrollo.
- [ ] Google: URI de redirección de producción registrada y app de OAuth publicada.
- [ ] Correo: SMTP o Resend configurado; probar un código de acceso y una reclamación.
- [ ] `PORTAL_DEMO` en `false` (o sin definir).
- [ ] Contenido real (ver la lista del [README](../README.md#antes-de-publicar-el-sitio)).
- [ ] Textos legales revisados por la asesoría legal.
- [ ] Sitemap enviado a Google Search Console: `https://peruanaenrusia.pe/sitemap-index.xml`.
- [ ] Revisar las cabeceras en <https://securityheaders.com> y el rendimiento en PageSpeed Insights.
