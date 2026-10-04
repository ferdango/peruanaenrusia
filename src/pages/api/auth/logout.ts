/**
 * POST /api/auth/logout/
 * --------------------------------------------------------------------------
 * Cierra la sesión en el servidor (la borra del almacenamiento) y elimina
 * las cookies. Se llama desde el botón "Cerrar sesión" del portal.
 */
import type { APIRoute } from 'astro';

import { json } from '@lib/server/http';
import { endSession } from '@lib/server/session';

export const prerender = false;

export const POST: APIRoute = (context) => {
	endSession(context);
	return json({ redirect: '/' });
};
