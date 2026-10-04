/**
 * GET /api/auth/session/
 * --------------------------------------------------------------------------
 * Devuelve el estudiante con sesión iniciada (o null). Lo usan las páginas
 * estáticas para mostrar su nombre sin exponer la cookie de sesión.
 */
import type { APIRoute } from 'astro';

import { json } from '@lib/server/http';

export const prerender = false;

export const GET: APIRoute = ({ locals }) => {
	const user = locals.user;
	return json({ user: user ? { name: user.name, email: user.email, picture: user.picture } : null });
};
