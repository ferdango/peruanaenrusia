/**
 * Almacenamiento local en archivos JSON
 * --------------------------------------------------------------------------
 * Respaldo para cuando no hay WordPress configurado: guarda las cuentas de
 * estudiantes y las reclamaciones en la carpeta privada DATA_DIR (por
 * defecto ./.data, fuera de git y fuera de la carpeta pública).
 *
 * Las escrituras son atómicas (archivo temporal + renombrar) y se hacen una
 * a la vez para no perder datos si llegan dos peticiones juntas.
 *
 * Pensado para un único servidor con disco persistente (ej. Hostinger
 * Node.js). Para varios servidores, usa WordPress u otra base de datos.
 */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DATA_DIR } from 'astro:env/server';

/** Carpeta de datos privados */
export function dataDir(): string {
	return path.resolve(DATA_DIR || '.data');
}

let queue: Promise<unknown> = Promise.resolve();

/** Ejecuta las escrituras de una en una */
function serialize<T>(task: () => Promise<T>): Promise<T> {
	const result = queue.then(task, task);
	queue = result.catch(() => undefined);
	return result;
}

/** Lee un archivo JSON de la carpeta de datos (o el valor inicial si no existe) */
export async function readJsonFile<T>(file: string, initial: T): Promise<T> {
	try {
		return JSON.parse(await readFile(path.join(dataDir(), file), 'utf8')) as T;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') return initial;
		throw error;
	}
}

/** Guarda un archivo de forma atómica (solo legible por el usuario del servidor) */
async function atomicWrite(file: string, data: unknown): Promise<void> {
	const target = path.join(dataDir(), file);
	await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	await writeFile(temporary, JSON.stringify(data, null, '\t'), { encoding: 'utf8', mode: 0o600 });
	await rename(temporary, target);
}

/** Escribe un archivo JSON */
export function writeJsonFile(file: string, data: unknown): Promise<void> {
	return serialize(() => atomicWrite(file, data));
}

/** Lee, modifica y guarda un archivo JSON en una sola operación */
export function updateJsonFile<T, R>(
	file: string,
	initial: T,
	update: (data: T) => { data: T; result: R },
): Promise<R> {
	return serialize(async () => {
		const { data, result } = update(await readJsonFile(file, initial));
		await atomicWrite(file, data);
		return result;
	});
}
