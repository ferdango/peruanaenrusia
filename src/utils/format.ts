/**
 * Utilidades de formato
 * --------------------------------------------------------------------------
 */

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
	timeZone: 'UTC',
});

/**
 * Fecha larga en español, como en el diseño.
 * formatDate('2025-05-07') → "7 de mayo del 2025"
 */
export function formatDate(date: string | Date): string {
	return dateFormatter.format(new Date(date)).replace(/ de (\d{4})$/, ' del $1');
}

/**
 * Fecha corta numérica.
 * formatShortDate('2023-07-04') → "04/07/2023"
 */
export function formatShortDate(date: string | Date): string {
	return new Intl.DateTimeFormat('es-PE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(new Date(date));
}
