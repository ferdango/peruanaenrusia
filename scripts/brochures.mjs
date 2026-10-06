/**
 * Genera los brochures en PDF de cada universidad
 * --------------------------------------------------------------------------
 * Imprime con Chrome (sin interfaz) la versión para imprimir de cada ficha
 * (/universidades/{slug}/brochure/, src/pages/universidades/[slug]/brochure.astro)
 * y guarda el resultado en public/brochures/{slug}.pdf, el archivo que
 * descarga el botón "Descargar brochure" (ver src/lib/brochures.ts).
 *
 * Uso (después de compilar el sitio):
 *   npm run build
 *   npm run brochures
 *
 * Luego vuelve a compilar (o publica) para que los PDF nuevos se incluyan;
 * el script también los copia en dist/client/brochures/ para la compilación
 * actual. Vuelve a generarlos cuando cambien los datos de una universidad.
 *
 * Chrome: se busca en la ubicación habitual de cada sistema; también se puede
 * indicar con la variable CHROME_PATH. Se controla con el protocolo de
 * DevTools (Page.printToPDF), más fiable que la opción --print-to-pdf.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist', 'client');
const OUTPUT = join(ROOT, 'public', 'brochures');

const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css',
	'.js': 'text/javascript',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.woff2': 'font/woff2',
	'.woff': 'font/woff',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findChrome() {
	const candidates = [
		process.env.CHROME_PATH,
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		'/usr/bin/google-chrome',
		'/usr/bin/google-chrome-stable',
		'/usr/bin/chromium',
		'/usr/bin/chromium-browser',
		'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
	].filter(Boolean);
	return candidates.find((path) => existsSync(path));
}

/** Servidor estático mínimo sobre dist/client (quita la subcarpeta de publicación si la hay) */
function serve(base) {
	return new Promise((resolve) => {
		const server = createServer(async (req, res) => {
			let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
			if (base && path.startsWith(base)) path = path.slice(base.length) || '/';
			let file = join(DIST, normalize(path).replace(/^(\.\.[/\\])+/, ''));
			try {
				if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
				res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
				res.end(await readFile(file));
			} catch {
				res.writeHead(404).end('Not Found');
			}
		});
		server.listen(0, '127.0.0.1', () => resolve(server));
	});
}

/** Abre Chrome sin interfaz y devuelve una función para imprimir páginas en PDF */
async function launchChrome(chrome, profile) {
	const child = spawn(
		chrome,
		[
			'--headless=new',
			'--disable-gpu',
			'--no-first-run',
			'--no-default-browser-check',
			'--remote-debugging-port=0',
			`--user-data-dir=${profile}`,
			'about:blank',
		],
		{ stdio: 'ignore' },
	);

	const portFile = join(profile, 'DevToolsActivePort');
	for (let i = 0; i < 150 && !existsSync(portFile); i++) await sleep(100);
	if (!existsSync(portFile)) {
		child.kill('SIGKILL');
		throw new Error('Chrome no abrió el puerto de depuración.');
	}
	const [port] = (await readFile(portFile, 'utf8')).split('\n');

	let page;
	for (let i = 0; i < 50 && !page; i++) {
		const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
		page = targets.find((target) => target.type === 'page');
		if (!page) await sleep(100);
	}

	const socket = new WebSocket(page.webSocketDebuggerUrl);
	await new Promise((resolve, reject) => {
		socket.addEventListener('open', resolve, { once: true });
		socket.addEventListener('error', reject, { once: true });
	});

	let id = 0;
	const pending = new Map();
	const listeners = new Set();
	socket.addEventListener('message', (event) => {
		const message = JSON.parse(event.data);
		if (message.id && pending.has(message.id)) {
			const { resolve, reject } = pending.get(message.id);
			pending.delete(message.id);
			if (message.error) reject(new Error(message.error.message));
			else resolve(message.result);
		} else if (message.method) {
			listeners.forEach((listener) => listener(message));
		}
	});

	const send = (method, params = {}) =>
		new Promise((resolve, reject) => {
			const messageId = ++id;
			pending.set(messageId, { resolve, reject });
			socket.send(JSON.stringify({ id: messageId, method, params }));
		});

	const waitFor = (method) =>
		new Promise((resolve) => {
			const listener = (message) => {
				if (message.method !== method) return;
				listeners.delete(listener);
				resolve(message.params);
			};
			listeners.add(listener);
		});

	await send('Page.enable');
	await send('Runtime.enable');

	return {
		/** Abre la página, espera las fuentes y las imágenes y la imprime en PDF (A4, según su @page) */
		async printToPdf(url, output) {
			const loaded = waitFor('Page.loadEventFired');
			await send('Page.navigate', { url });
			await loaded;
			await send('Runtime.evaluate', {
				awaitPromise: true,
				expression: `document.fonts.ready.then(() => Promise.all([...document.images].map((img) =>
					img.complete ? null : new Promise((resolve) => { img.onload = img.onerror = resolve; }))))`,
			});
			await sleep(300);
			const { data } = await send('Page.printToPDF', {
				printBackground: true,
				preferCSSPageSize: true,
				displayHeaderFooter: false,
			});
			await writeFile(output, Buffer.from(data, 'base64'));
		},
		close() {
			socket.close();
			child.kill('SIGKILL');
		},
	};
}

async function main() {
	const universitiesDir = join(DIST, 'universidades');
	if (!existsSync(universitiesDir)) {
		console.error('No se encontró dist/client/universidades. Compila el sitio primero: npm run build');
		process.exit(1);
	}

	const slugs = [];
	for (const entry of await readdir(universitiesDir, { withFileTypes: true })) {
		if (entry.isDirectory() && existsSync(join(universitiesDir, entry.name, 'brochure', 'index.html'))) {
			slugs.push(entry.name);
		}
	}
	if (slugs.length === 0) {
		console.error('No hay páginas /universidades/{slug}/brochure/ en dist/client.');
		process.exit(1);
	}

	const chrome = findChrome();
	if (!chrome) {
		console.error('No se encontró Google Chrome. Indica su ruta con la variable CHROME_PATH.');
		process.exit(1);
	}

	// Subcarpeta de publicación (ej. /peruanaenrusia en GitHub Pages), según las rutas de la página
	const sample = await readFile(join(universitiesDir, slugs[0], 'brochure', 'index.html'), 'utf8');
	const base = sample.match(/(?:src|href)="([^"]*?)\/_astro\//)?.[1] ?? '';

	const server = await serve(base);
	const { port } = server.address();
	const profile = await mkdtemp(join(tmpdir(), 'peru-brochures-'));
	await mkdir(OUTPUT, { recursive: true });
	await mkdir(join(DIST, 'brochures'), { recursive: true });

	const browser = await launchChrome(chrome, profile);
	try {
		for (const slug of slugs) {
			const output = join(OUTPUT, `${slug}.pdf`);
			await browser.printToPdf(
				`http://127.0.0.1:${port}${base}/universidades/${slug}/brochure/`,
				output,
			);
			await copyFile(output, join(DIST, 'brochures', `${slug}.pdf`));
			const { size } = await stat(output);
			console.log(`✓ public/brochures/${slug}.pdf (${Math.round(size / 1024)} KB)`);
		}
	} finally {
		browser.close();
		server.close();
		await sleep(300);
		await rm(profile, { recursive: true, force: true });
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
