/**
 * Errores de configuración del servidor
 * --------------------------------------------------------------------------
 * Indican que falta una variable de entorno (ej. SESSION_SECRET o un
 * proveedor de correo). La API responde 503 ("no disponible") con un mensaje
 * amable en lugar de un error genérico, y el detalle queda en el registro.
 */
export class ServerConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ServerConfigError';
	}
}
