# Inicio de sesión (Google y código por correo)

El modal **"Inicia sesión o regístrate en segundos"** ofrece dos formas de entrar al portal del estudiante, ambas sin contraseñas:

1. **"Usa tu cuenta de Google"** → OAuth 2.0 / OpenID Connect con Google.
2. **"Continuar manualmente"** → un código de 6 dígitos que llega al correo.

Las dos entran a la **misma cuenta** si usan el mismo correo.

---

## 1. Cómo funciona

```text
Google
  Botón ──▶ /api/auth/google/ ──▶ Google (elige la cuenta) ──▶ /api/auth/google/callback/ ──▶ portal
             guarda state, PKCE        id_token firmado         valida y crea la sesión
             y nonce en la sesión

Correo
  Correo ──▶ POST /api/auth/email/start/  ──▶ código por correo
  Código ──▶ POST /api/auth/email/verify/ ──▶ sesión ──▶ portal
```

- Todo se resuelve **en el servidor** (`src/lib/server/`, `src/pages/api/auth/`): el secreto de Google nunca llega al navegador y las páginas no cargan scripts de terceros.
- La sesión vive en el servidor (sesiones de Astro, `.data/sessions/`); el navegador solo guarda la cookie `peru_session` (**HttpOnly, Secure, SameSite=Lax**, 7 días).
- El portal (`/portal/*`) está protegido por el middleware (`src/middleware.ts`): sin sesión, redirige a `/?login=1&next=/portal/…` (abre el modal y vuelve al portal al terminar).
- "Cerrar sesión" (portal) llama a `POST /api/auth/logout/`, que borra la sesión del servidor.

### Medidas de seguridad

| Riesgo                             | Protección                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| Robo del código de autorización    | **PKCE (S256)** + secreto del cliente solo en el servidor                                      |
| CSRF / inicio de sesión forzado    | **state** aleatorio ligado a la sesión, comparado en tiempo constante                          |
| Reproducción del id_token          | **nonce** + verificación de firma (claves públicas de Google), emisor, audiencia y vencimiento |
| Correos no verificados             | Se exige `email_verified = true`                                                               |
| Fuerza bruta del código por correo | 6 dígitos, vence en **10 min**, máx. **5 intentos**, guardado como **hash HMAC**               |
| Envío masivo de correos            | Límite por IP y por correo, máx. 3 reenvíos con 30 s de espera                                 |
| Fijación de sesión                 | Se regenera el identificador al iniciar sesión                                                 |
| Redirecciones abiertas             | `next` solo acepta rutas del propio sitio                                                      |
| Peticiones desde otros sitios      | La API exige el mismo origen (`Origin`/`Sec-Fetch-Site`) y JSON                                |

---

## 2. Configurar Google

1. Entra a [Google Cloud Console](https://console.cloud.google.com/) y crea un proyecto (ej. "Peruana en Rusia").
2. _APIs y servicios → Pantalla de consentimiento de OAuth_: tipo **Externo**, nombre de la app, logo, correo de soporte, dominio `peruanaenrusia.pe` y enlace a la política de privacidad (`https://peruanaenrusia.pe/legales/#proteccion-de-datos`). Alcances: `openid`, `email`, `profile`. Publica la app.
3. _Credenciales → Crear credenciales → ID de cliente de OAuth_ → **Aplicación web**:
   - **URI de redirección autorizados**:
     - `https://peruanaenrusia.pe/api/auth/google/callback/` (producción)
     - `http://localhost:4321/api/auth/google/callback/` (desarrollo)
4. Copia el ID y el secreto en las variables de entorno:

   ```bash
   GOOGLE_CLIENT_ID=1234567890-xxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxx
   SESSION_SECRET=   # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

> La URI debe coincidir **exactamente** (con la barra final). En producción se construye con el dominio de `SITE_URL`.

Si Google no está configurado, el botón vuelve al sitio con el aviso _"El inicio de sesión con Google no está disponible…"_ y la persona puede usar su correo.

---

## 3. Configurar el correo

Para enviar los códigos (y las constancias del Libro de reclamaciones) configura **una** de estas opciones:

**A. Correo de Hostinger (SMTP)** — usa una cuenta de correo del dominio (ej. `hola@peruanaenrusia.pe`):

```bash
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=hola@peruanaenrusia.pe
SMTP_PASS=********
MAIL_FROM="Peruana en Rusia <hola@peruanaenrusia.pe>"
```

**B. [Resend](https://resend.com)** (API, buena entregabilidad):

```bash
RESEND_API_KEY=re_xxxxxxxx
MAIL_FROM="Peruana en Rusia <hola@peruanaenrusia.pe>"
```

Recomendado: configura SPF, DKIM y DMARC del dominio para que los correos no lleguen a spam.

**En desarrollo** (`npm run dev`) no hace falta proveedor: el correo se muestra en la terminal, con el código.

---

## 4. Dónde se guardan las cuentas

- Con WordPress (`WORDPRESS_URL` + `WORDPRESS_USER` + `WORDPRESS_APP_PASSWORD`): usuarios con el rol **Estudiante** (ver [docs/WORDPRESS.md](WORDPRESS.md)).
- Sin WordPress: `.data/students.json` en el servidor (carpeta privada, fuera de git).

---

## 5. Probar en local

```bash
npm run dev
```

1. Abre <http://localhost:4321/?login=1>.
2. "Continuar manualmente" → escribe un correo → (cuenta nueva) escribe tu nombre.
3. Copia el código que aparece en la terminal y escríbelo: entrarás al portal.

Para revisar el diseño del portal sin iniciar sesión: `PORTAL_DEMO=true` en `.env` (**nunca en producción**).

## 6. Versión estática (GitHub Pages)

Sin servidor no se puede hablar con Google ni enviar correos, así que con `DEPLOY_TARGET=static` el modal funciona en **modo demostración** (`src/scripts/auth-api.ts`): acepta cualquier correo y cualquier código de 6 dígitos, no envía ningún dato y lleva al portal de ejemplo. (A pedido del cliente, el modal ya no muestra un aviso de "versión de demostración".)
