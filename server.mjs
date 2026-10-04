/**
 * Servidor de producción (Node.js)
 * --------------------------------------------------------------------------
 * Ejecuta el sitio compilado (`npm run build` → dist/) y agrega las
 * cabeceras de seguridad (config/security-headers.mjs) a TODAS las
 * respuestas: páginas estáticas, imágenes, CSS/JS y API.
 *
 * Uso:
 *   npm run build
 *   npm start                      → http://0.0.0.0:4321
 *
 * Variables: PORT (por defecto 4321) y HOST (por defecto 0.0.0.0), más las
 * del archivo .env.example (WordPress, Google, correo…).
 */
import http from 'node:http';
import process from 'node:process';

import { securityHeaders } from './config/security-headers.mjs';

// Evita que el adaptador de Astro inicie su propio servidor: usamos su handler
process.env.ASTRO_NODE_AUTOSTART = 'disabled';
const { handler } = await import('./dist/server/entry.mjs');

const port = Number(process.env.PORT ?? 4321);
const host = process.env.HOST ?? '0.0.0.0';

const server = http.createServer((request, response) => {
	for (const [name, value] of Object.entries(securityHeaders)) {
		response.setHeader(name, value);
	}
	handler(request, response);
});

// Límites de tiempo para conexiones lentas (protección básica contra abusos)
server.headersTimeout = 15_000;
server.requestTimeout = 30_000;
server.keepAliveTimeout = 5_000;

server.listen(port, host, () => {
	console.log(`Peruana en Rusia → http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
});

// Cierre ordenado (el hosting envía SIGTERM al reiniciar)
for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, () => {
		server.close(() => process.exit(0));
		setTimeout(() => process.exit(0), 5_000).unref();
	});
}
