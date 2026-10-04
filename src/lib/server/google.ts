/**
 * Inicio de sesión con Google (OAuth 2.0 + OpenID Connect)
 * --------------------------------------------------------------------------
 * Flujo "Authorization Code" con PKCE, state y nonce, resuelto en el
 * servidor (el secreto nunca llega al navegador y la página no carga
 * scripts de Google):
 *
 *   1. /api/auth/google/          → genera state + PKCE + nonce, los guarda en
 *                                   la sesión y redirige a Google.
 *   2. Google pide elegir la cuenta y vuelve a
 *      /api/auth/google/callback/ → valida el state, canjea el código por un
 *                                   id_token y verifica su firma (claves
 *                                   públicas de Google), emisor, audiencia,
 *                                   vencimiento, nonce y correo verificado.
 *   3. Se crea o actualiza la cuenta del estudiante y se inicia la sesión.
 *
 * Configuración (Google Cloud Console → Credenciales → ID de cliente OAuth,
 * tipo "Aplicación web"):
 *   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
 *   URI de redirección autorizado: https://TU-DOMINIO/api/auth/google/callback/
 * Guía paso a paso: docs/AUTENTICACION.md
 */
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from 'astro:env/server';

import { pkceChallenge, randomToken } from './crypto';

const AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

/** Claves públicas de Google para verificar los id_token (se guardan en caché) */
const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

/** Ruta de vuelta (debe coincidir con la registrada en Google Cloud Console) */
export const GOOGLE_CALLBACK_PATH = '/api/auth/google/callback/';

export interface GoogleProfile {
	sub: string;
	email: string;
	name: string;
	picture?: string;
}

export function isGoogleConfigured(): boolean {
	return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

/** Crea la URL de inicio de sesión de Google y los valores que hay que guardar en la sesión */
export function createAuthorizationRequest(origin: string) {
	const state = randomToken(32);
	const verifier = randomToken(48); // 64 caracteres (PKCE: entre 43 y 128)
	const nonce = randomToken(32);

	const url = new URL(AUTHORIZATION_ENDPOINT);
	url.search = new URLSearchParams({
		client_id: GOOGLE_CLIENT_ID!,
		redirect_uri: new URL(GOOGLE_CALLBACK_PATH, origin).href,
		response_type: 'code',
		scope: 'openid email profile',
		state,
		nonce,
		code_challenge: pkceChallenge(verifier),
		code_challenge_method: 'S256',
		prompt: 'select_account',
		access_type: 'online',
		include_granted_scopes: 'true',
	}).toString();

	return { url: url.href, state, verifier, nonce };
}

/** Canjea el código de autorización por los tokens y devuelve el perfil verificado */
export async function completeAuthorization(input: {
	code: string;
	verifier: string;
	nonce: string;
	origin: string;
}): Promise<GoogleProfile> {
	const response = await fetch(TOKEN_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
		body: new URLSearchParams({
			code: input.code,
			client_id: GOOGLE_CLIENT_ID!,
			client_secret: GOOGLE_CLIENT_SECRET!,
			redirect_uri: new URL(GOOGLE_CALLBACK_PATH, input.origin).href,
			grant_type: 'authorization_code',
			code_verifier: input.verifier,
		}),
		signal: AbortSignal.timeout(15_000),
	});

	if (!response.ok) {
		throw new Error(`[google] El canje del código falló (${response.status}): ${await response.text()}`);
	}

	const tokens = (await response.json()) as { id_token?: string };
	if (!tokens.id_token) throw new Error('[google] La respuesta no incluye id_token.');

	return verifyIdToken(tokens.id_token, input.nonce);
}

/** Verifica el id_token: firma, emisor, audiencia, vencimiento, nonce y correo verificado */
async function verifyIdToken(idToken: string, nonce: string): Promise<GoogleProfile> {
	const { payload } = await jwtVerify(idToken, googleKeys, {
		issuer: GOOGLE_ISSUERS,
		audience: GOOGLE_CLIENT_ID!,
		clockTolerance: 60,
	});

	if (payload.nonce !== nonce) throw new Error('[google] El nonce no coincide.');
	if (payload.email_verified !== true)
		throw new Error('[google] El correo de la cuenta no está verificado.');
	if (typeof payload.email !== 'string' || typeof payload.sub !== 'string') {
		throw new Error('[google] El id_token no tiene correo o identificador.');
	}

	return {
		sub: payload.sub,
		email: payload.email.toLowerCase(),
		name: typeof payload.name === 'string' && payload.name ? payload.name : payload.email.split('@')[0]!,
		picture: typeof payload.picture === 'string' ? payload.picture : undefined,
	};
}
