/**
 * WordPress (operaciones con autenticación)
 * --------------------------------------------------------------------------
 * Para guardar cuentas de estudiantes y reclamaciones en WordPress, el
 * servidor del sitio llama a las rutas del plugin peru-headless
 * (wordpress/peru-headless/) con una "contraseña de aplicación" de un
 * usuario administrador o de servicio:
 *
 *   WORDPRESS_URL=https://cms.peruanaenrusia.pe
 *   WORDPRESS_USER=servicio-web
 *   WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
 *
 * Las credenciales solo existen en el servidor (nunca llegan al navegador).
 */
import { WORDPRESS_APP_PASSWORD, WORDPRESS_URL, WORDPRESS_USER } from 'astro:env/server';

/** ¿Están configuradas las credenciales para escribir en WordPress? */
export function isWordPressAdminConfigured(): boolean {
	return Boolean(WORDPRESS_URL && WORDPRESS_USER && WORDPRESS_APP_PASSWORD);
}

/** Petición autenticada a una ruta de la REST API de WordPress (ej. /peru/v1/students) */
export async function wordpressRequest<T>(route: string, body: unknown): Promise<T> {
	if (!isWordPressAdminConfigured()) throw new Error('[WordPress] Faltan las credenciales de servicio.');

	const url = `${WORDPRESS_URL!.replace(/\/+$/, '')}/wp-json${route}`;
	const credentials = Buffer.from(`${WORDPRESS_USER}:${WORDPRESS_APP_PASSWORD}`).toString('base64');

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Basic ${credentials}`,
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(15_000),
	});

	if (!response.ok) {
		throw new Error(`[WordPress] ${response.status} ${response.statusText} en ${route}`);
	}

	return (await response.json()) as T;
}
