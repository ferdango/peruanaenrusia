/**
 * POST /api/reclamaciones/
 * --------------------------------------------------------------------------
 * Recibe la hoja del Libro de reclamaciones
 * (src/components/sections/complaints/ComplaintsForm.astro), la valida en el
 * servidor, la registra y envía la constancia por correo.
 * Ver src/lib/server/complaints.ts.
 *
 * Protecciones: solo peticiones del propio sitio (middleware), límite de
 * envíos por IP, campo trampa para bots y validación estricta de cada campo.
 */
import type { APIRoute } from 'astro';

import { complaintSchema, registerComplaint } from '@lib/server/complaints';
import { BadRequestError, clientIp, jsonError, json, readJson } from '@lib/server/http';
import { HOUR, rateLimit } from '@lib/server/rate-limit';

export const prerender = false;

/** Un formulario completado en menos de 3 segundos lo llenó un bot */
const MIN_FILL_TIME_MS = 3_000;

export const POST: APIRoute = async (context) => {
	const ip = clientIp(context);

	try {
		const body = await readJson(context.request);

		// Bots: llenaron el campo oculto o enviaron el formulario al instante.
		// Se responde como si todo saliera bien, sin registrar nada.
		const elapsed = typeof body.elapsedMs === 'number' ? body.elapsedMs : Infinity;
		if ((typeof body.website === 'string' && body.website !== '') || elapsed < MIN_FILL_TIME_MS) {
			return json({ code: crypto.randomUUID(), date: new Date().toISOString(), emailSent: true });
		}

		if (!rateLimit(`complaint:${ip}`, 5, HOUR).ok) {
			return jsonError(
				429,
				'Recibimos varias reclamaciones desde tu conexión. Espera un momento o escríbenos por correo.',
			);
		}

		const parsed = complaintSchema.safeParse(body);
		if (!parsed.success) {
			const issue = parsed.error.issues[0];
			throw new BadRequestError(
				issue?.message ?? 'Revisa los datos del formulario.',
				issue?.path[0]?.toString(),
			);
		}

		const { record, emailSent } = await registerComplaint(parsed.data, {
			ip,
			userAgent: context.request.headers.get('user-agent') ?? undefined,
		});

		return json({ code: record.code, date: record.createdAt, emailSent }, { status: 201 });
	} catch (error) {
		if (error instanceof BadRequestError) return jsonError(400, error.message, { field: error.field });
		console.error('[reclamaciones] No se pudo registrar la reclamación:', error);
		return jsonError(
			500,
			'No pudimos registrar tu reclamación. Inténtalo de nuevo en unos minutos o escríbenos por correo.',
		);
	}
};
