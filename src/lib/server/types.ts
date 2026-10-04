/**
 * Tipos del servidor (sesión e inicio de sesión)
 * --------------------------------------------------------------------------
 * Se usan en src/env.d.ts para tipar `Astro.locals` y `Astro.session`.
 */

/** Persona con sesión iniciada (lo que se guarda en la sesión del servidor) */
export interface SessionUser {
	/** Identificador de la cuenta del estudiante */
	id: string;
	email: string;
	name: string;
	/** Foto de perfil (solo con Google) */
	picture?: string;
	/** Con qué inició sesión */
	provider: 'google' | 'email';
}

/** Datos temporales del inicio de sesión con Google (se borran al volver) */
export interface OAuthState {
	state: string;
	verifier: string;
	nonce: string;
	/** Página a la que se vuelve después de iniciar sesión */
	next: string;
	createdAt: number;
}

/** Código de acceso enviado por correo (pendiente de verificar) */
export interface OtpChallenge {
	email: string;
	name?: string;
	/** login = la cuenta ya existe · register = se creará al verificar el código */
	intent: 'login' | 'register';
	salt: string;
	hash: string;
	expiresAt: number;
	attempts: number;
	sentAt: number;
	resends: number;
	next: string;
}
