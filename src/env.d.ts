/**
 * Tipos globales del proyecto
 * --------------------------------------------------------------------------
 *   - App.Locals:      datos que el middleware (src/middleware.ts) deja
 *                      disponibles en las páginas bajo demanda (Astro.locals).
 *   - App.SessionData: lo que se guarda en la sesión del servidor
 *                      (Astro.session, ver astro.config.mjs → session).
 */

declare namespace App {
	interface Locals {
		/** Estudiante con sesión iniciada (solo en rutas bajo demanda: /api/*, /portal/*) */
		user?: import('./lib/server/types').SessionUser;
	}

	interface SessionData {
		user: import('./lib/server/types').SessionUser;
		oauth: import('./lib/server/types').OAuthState;
		otp: import('./lib/server/types').OtpChallenge;
	}
}
