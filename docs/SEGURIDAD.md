# Seguridad

Resumen de las medidas de seguridad del sitio y cómo mantenerlas.

## 1. Arquitectura

- **Páginas públicas estáticas**: no hay base de datos ni código de servidor detrás de cada visita, lo que reduce mucho la superficie de ataque.
- **Rutas de servidor mínimas** (`/api/*`, `/portal/*`), con validación estricta de todo lo que reciben.
- **Secretos solo en el servidor**: variables de entorno tipadas con `astro:env` (`access: 'secret'`): nunca se incluyen en el JavaScript del navegador. El archivo `.env` está en `.gitignore`.

## 2. Cabeceras HTTP

Definidas en un solo lugar, [`config/security-headers.mjs`](../config/security-headers.mjs), y aplicadas a todas las respuestas por `server.mjs` (y por `src/middleware.ts` en las rutas de servidor):

| Cabecera                          | Efecto                                                     |
| --------------------------------- | ---------------------------------------------------------- |
| `Strict-Transport-Security`       | Fuerza HTTPS durante 2 años                                |
| `Content-Security-Policy`         | Ver sección 3 (+ `frame-ancestors 'none'`)                 |
| `X-Frame-Options: DENY`           | Nadie puede incrustar el sitio en un iframe (clickjacking) |
| `X-Content-Type-Options: nosniff` | Evita que el navegador "adivine" tipos de archivo          |
| `Referrer-Policy`                 | No envía la URL completa a otros sitios                    |
| `Permissions-Policy`              | Desactiva cámara, micrófono, ubicación, pagos…             |
| `Cross-Origin-Opener-Policy`      | Aísla la ventana del sitio                                 |
| `Cross-Origin-Resource-Policy`    | Los recursos solo se cargan desde el mismo sitio           |

Para hostings estáticos hay copias en `public/.htaccess` y `public/_headers` (mantenlas sincronizadas).

## 3. Content Security Policy (CSP)

Astro genera la política de cada página (`astro.config.mjs → security.csp`) con los **hashes** de sus scripts y estilos: el navegador solo ejecuta el código del sitio. Orígenes externos permitidos:

- Imágenes: WordPress (si está configurado), miniaturas de YouTube y avatares de Gravatar.
- Iframes: `youtube-nocookie.com` (videos del blog, sin cookies de seguimiento).
- Formularios: el propio sitio y `accounts.google.com` (inicio de sesión).

**Reglas al programar**: no uses `<script is:inline>` con código ni atributos `onclick=`; escribe los scripts en `<script>` normales o en `src/scripts/`. Las variables CSS en el atributo `style` están permitidas. Si agregas un servicio externo (analítica, chat…), agrega su dominio a la CSP en `astro.config.mjs` y cárgalo solo con consentimiento de cookies.

> La CSP no se aplica en `npm run dev` (limitación de Vite): pruébala con `npm run build && npm start`.

## 4. Formularios y API

- **CSRF**: la API solo acepta peticiones del mismo origen (`Origin`, `Sec-Fetch-Site`) y con cuerpo JSON; Astro además bloquea envíos de formularios de otros dominios (`security.checkOrigin`).
- **Validación en el servidor** de cada campo (formato, longitud, listas permitidas) con mensajes claros; nunca se confía en la validación del navegador.
- **Límite de intentos** por IP y por correo (`src/lib/server/rate-limit.ts`). Detrás de un proxy define `TRUST_PROXY=true`.
- **Anti-bots** en el Libro de reclamaciones: campo trampa invisible y tiempo mínimo de llenado.
- **Correos**: todo dato escrito por personas se escapa antes de insertarlo en el HTML.
- **Contenido de WordPress**: el HTML se sanea con una lista blanca (`src/lib/content/sanitize.ts`).

## 5. Sesiones e inicio de sesión

Ver [AUTENTICACION.md](AUTENTICACION.md#medidas-de-seguridad): OAuth con PKCE/state/nonce, códigos de un solo uso con hash HMAC, cookies HttpOnly/Secure/SameSite, regeneración del identificador de sesión y portal protegido en el servidor.

## 6. Datos personales (Ley N° 29733)

- Solo se piden los datos necesarios y con consentimiento expreso (casilla obligatoria).
- Los datos se guardan en WordPress o en `.data/` con permisos solo para el usuario del servidor (`0600`).
- No se usan cookies de analítica ni publicidad sin aceptación previa (aviso de cookies).
- No se envían datos personales en URLs.

## 7. Mantenimiento

- Ejecuta `npm audit` y actualiza dependencias periódicamente (`npm outdated`).
- Rota `SESSION_SECRET`, el secreto de Google y las contraseñas de aplicación si se sospecha una filtración.
- Mantén WordPress, el plugin y ACF actualizados; usa contraseñas fuertes y 2FA en el panel.
- Reporte de vulnerabilidades: [`/.well-known/security.txt`](../public/.well-known/security.txt).
