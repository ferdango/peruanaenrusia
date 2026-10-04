/**
 * Middleware (rutas bajo demanda: /api/* y /portal/*)
 * --------------------------------------------------------------------------
 * Se ejecuta en cada petición que atiende el servidor (las páginas públicas
 * son HTML estático y no pasan por aquí):
 *
 *   1. API: rechaza envíos (POST, PUT…) que no vienen del propio sitio (CSRF).
 *   2. Sesión: deja al estudiante en `Astro.locals.user`.
 *   3. Portal: si no hay sesión, redirige al inicio con el modal de acceso
 *      abierto y vuelve al portal después de iniciar sesión.
 *   4. Cabeceras de seguridad y "no guardar en caché" en API y portal.
 */
import { defineMiddleware } from 'astro:middleware';
import { PORTAL_DEMO } from 'astro:env/server';

import { securityHeaders } from '../config/security-headers.mjs';
import { routes } from '@data/navigation';
import { isSameOrigin, json } from '@lib/server/http';
import { AUTH_HINT_COOKIE } from '@lib/server/session';
import type { SessionUser } from '@lib/server/types';
import { withoutBase } from '@utils/url';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Estudiante de ejemplo para revisar el diseño del portal (PORTAL_DEMO=true) */
const DEMO_USER: SessionUser = {
	id: 'demo',
	email: 'estudiante@ejemplo.com',
	name: 'Gianfranco',
	provider: 'email',
};

export const onRequest = defineMiddleware(async (context, next) => {
	// Las páginas estáticas se generan al compilar: no hay petición real
	if (context.isPrerendered) return next();

	const pathname = withoutBase(context.url.pathname);
	const isApi = pathname.startsWith('/api/');
	const isPortal = pathname.startsWith('/portal/');

	// 1. CSRF: la API solo acepta envíos desde el propio sitio
	if (isApi && !SAFE_METHODS.has(context.request.method) && !isSameOrigin(context.request, context.url)) {
		return json({ error: 'Origen no permitido.' }, { status: 403 });
	}

	// 2. Sesión
	if (isApi || isPortal) {
		context.locals.user = (await context.session?.get('user')) ?? undefined;
	}

	// 3. Portal protegido
	if (isPortal && !context.locals.user) {
		if (PORTAL_DEMO) {
			context.locals.user = DEMO_USER;
		} else {
			// La sesión venció: se borra también la cookie informativa (evita volver al portal en bucle)
			context.cookies.delete(AUTH_HINT_COOKIE, { path: '/' });
			const destination = `${context.url.pathname}${context.url.search}`;
			return context.redirect(`${routes.home}?login=1&next=${encodeURIComponent(destination)}`, 302);
		}
	}

	const response = await next();

	// 4. Cabeceras (algunas respuestas, como las redirecciones nativas, son inmutables)
	try {
		for (const [name, value] of Object.entries(securityHeaders)) {
			if (!response.headers.has(name)) response.headers.set(name, value);
		}
		if (isApi || isPortal) {
			response.headers.set('Cache-Control', 'no-store');
			response.headers.set('X-Robots-Tag', 'noindex, nofollow');
		}
	} catch {
		// Las cabeceras de seguridad también las agrega server.mjs en producción
	}

	return response;
});
