/**
 * Cuentas de estudiantes
 * --------------------------------------------------------------------------
 * Dónde se guardan las cuentas que se crean al iniciar sesión:
 *   - WordPress (si hay credenciales de servicio): usuarios con el rol
 *     "Estudiante" del plugin peru-headless. Así el equipo los ve en el
 *     panel de WordPress y el portal puede leer sus datos de ahí.
 *   - Archivo local .data/students.json (respaldo sin WordPress).
 *
 * El correo es la clave de la cuenta: iniciar sesión con Google o con un
 * código al mismo correo entra a la misma cuenta.
 */
import { randomUUID } from 'node:crypto';

import { readJsonFile, updateJsonFile } from './storage';
import { isWordPressAdminConfigured, wordpressRequest } from './wordpress-admin';

export interface StudentAccount {
	id: string;
	email: string;
	name: string;
	picture?: string;
	googleSub?: string;
	createdAt: string;
	lastLoginAt?: string;
}

export interface StudentInput {
	email: string;
	name?: string;
	picture?: string;
	googleSub?: string;
}

interface UserStore {
	findByEmail(email: string): Promise<StudentAccount | undefined>;
	/** Crea la cuenta o actualiza sus datos y la fecha de último acceso */
	upsert(input: StudentInput): Promise<StudentAccount>;
}

/** Normaliza el correo (la clave de la cuenta) */
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

// ---------------------------------------------------------------------------
// Archivo local
// ---------------------------------------------------------------------------

const FILE = 'students.json';

interface StudentsFile {
	students: StudentAccount[];
}

const fileStore: UserStore = {
	async findByEmail(email) {
		const { students } = await readJsonFile<StudentsFile>(FILE, { students: [] });
		return students.find((student) => student.email === normalizeEmail(email));
	},

	upsert(input) {
		const email = normalizeEmail(input.email);
		const now = new Date().toISOString();

		return updateJsonFile<StudentsFile, StudentAccount>(FILE, { students: [] }, (data) => {
			const existing = data.students.find((student) => student.email === email);
			if (existing) {
				existing.name = existing.name || input.name || email.split('@')[0]!;
				existing.picture = input.picture ?? existing.picture;
				existing.googleSub = input.googleSub ?? existing.googleSub;
				existing.lastLoginAt = now;
				return { data, result: existing };
			}

			const created: StudentAccount = {
				id: randomUUID(),
				email,
				name: input.name || email.split('@')[0]!,
				picture: input.picture,
				googleSub: input.googleSub,
				createdAt: now,
				lastLoginAt: now,
			};
			data.students.push(created);
			return { data, result: created };
		});
	},
};

// ---------------------------------------------------------------------------
// WordPress (plugin peru-headless)
// ---------------------------------------------------------------------------

interface WordPressStudent {
	id: number;
	email: string;
	name: string;
	picture?: string;
	created_at?: string;
}

const toAccount = (student: WordPressStudent): StudentAccount => ({
	id: `wp-${student.id}`,
	email: student.email,
	name: student.name,
	picture: student.picture,
	createdAt: student.created_at ?? new Date().toISOString(),
});

const wordpressStore: UserStore = {
	async findByEmail(email) {
		const result = await wordpressRequest<{ student: WordPressStudent | null }>(
			'/peru/v1/students/lookup',
			{
				email: normalizeEmail(email),
			},
		);
		return result.student ? toAccount(result.student) : undefined;
	},

	async upsert(input) {
		const result = await wordpressRequest<{ student: WordPressStudent }>('/peru/v1/students', {
			email: normalizeEmail(input.email),
			name: input.name,
			picture: input.picture,
			google_sub: input.googleSub,
		});
		return toAccount(result.student);
	},
};

/** Almacén de cuentas según la configuración */
export function userStore(): UserStore {
	return isWordPressAdminConfigured() ? wordpressStore : fileStore;
}
