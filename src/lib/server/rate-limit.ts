/**
 * Límite de intentos (rate limiting)
 * --------------------------------------------------------------------------
 * Protege la API contra abusos (fuerza bruta de códigos, envío masivo de
 * correos o de reclamaciones). Cuenta los intentos por clave (ej. IP + ruta)
 * en una ventana de tiempo deslizante.
 *
 * Se guarda en memoria: funciona para un servidor. Si el sitio se ejecuta en
 * varios servidores, reemplaza este módulo por uno compartido (ej. Redis).
 */

const hits = new Map<string, number[]>();
let lastCleanup = Date.now();

interface RateLimitResult {
	ok: boolean;
	/** Segundos que hay que esperar para volver a intentar */
	retryAfter: number;
}

/** Registra un intento y devuelve si está permitido */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
	const now = Date.now();
	const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);

	if (recent.length >= limit) {
		hits.set(key, recent);
		const retryAfter = Math.ceil((windowMs - (now - recent[0]!)) / 1000);
		return { ok: false, retryAfter: Math.max(retryAfter, 1) };
	}

	recent.push(now);
	hits.set(key, recent);
	cleanup(now, windowMs);
	return { ok: true, retryAfter: 0 };
}

/** Limpia claves viejas de vez en cuando para no acumular memoria */
function cleanup(now: number, windowMs: number): void {
	if (now - lastCleanup < 60_000 && hits.size < 10_000) return;
	lastCleanup = now;
	for (const [key, times] of hits) {
		if (times.every((time) => now - time >= Math.max(windowMs, 3_600_000))) hits.delete(key);
	}
}

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
