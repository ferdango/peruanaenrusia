/**
 * Libro de reclamaciones (servidor)
 * --------------------------------------------------------------------------
 * Valida la hoja de reclamación, la registra y envía los correos:
 *   - Registro: en WordPress (tipo privado "Reclamación" del plugin
 *     peru-headless) o, sin WordPress, en .data/complaints/{código}.json.
 *   - Correos: constancia al consumidor y aviso al equipo
 *     (COMPLAINTS_EMAIL o el correo de contacto de src/data/site.ts).
 *
 * La empresa debe conservar las reclamaciones y responder en un plazo
 * máximo de 15 días hábiles (Ley N° 29571 y su reglamento).
 */
import { randomUUID } from 'node:crypto';
import { z } from 'astro/zod';
import { COMPLAINTS_EMAIL } from 'astro:env/server';

import {
	claimTypes,
	complaintLimits as L,
	contractedServices,
	documentTypes,
	RESPONSE_DEADLINE_DAYS,
} from '@data/complaints';
import { site } from '@data/site';

import { complaintNotificationEmail, complaintReceiptEmail, type ComplaintSummary } from './email-templates';
import { sendMail } from './mail';
import { writeJsonFile } from './storage';
import { isWordPressAdminConfigured, wordpressRequest } from './wordpress-admin';

const values = <T extends readonly { value: string }[]>(list: T) =>
	list.map((item) => item.value) as [T[number]['value'], ...T[number]['value'][]];

const text = (min: number, max: number, message: string) =>
	z
		.string({ error: message })
		.trim()
		.min(min, { error: message })
		.max(max, { error: `El texto es demasiado largo (máximo ${max} caracteres).` });

/** Esquema de la hoja de reclamación (los mensajes se muestran en el formulario) */
export const complaintSchema = z
	.object({
		id: z.uuid().optional(),
		fullName: text(3, L.name, 'Ingrese sus nombres completos.'),
		isMinor: z.boolean().default(false),
		guardianName: z.string().trim().max(L.name).optional(),
		documentType: z.enum(values(documentTypes), { error: 'Elija el tipo de documento.' }),
		documentNumber: z
			.string()
			.trim()
			.regex(/^[A-Za-z0-9-]{6,20}$/, { error: 'Revise el número de documento.' }),
		email: z.email({ error: 'Ingrese un correo electrónico válido.' }).max(L.email),
		phone: z
			.string()
			.trim()
			.regex(/^[+0-9 ()-]{6,20}$/, { error: 'Revise el número de celular.' }),
		address: text(5, L.address, 'Ingrese su domicilio.'),
		service: z.enum(values(contractedServices), { error: 'Elija el servicio contratado.' }),
		amount: z
			.union([z.number(), z.string()])
			.optional()
			.transform((value, context) => {
				if (value === undefined || value === '') return undefined;
				const amount = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
				if (!Number.isFinite(amount) || amount < 0 || amount > 10_000_000) {
					context.addIssue({ code: 'custom', message: 'Ingrese un monto válido.' });
					return z.NEVER;
				}
				return Math.round(amount * 100) / 100;
			}),
		description: text(3, L.text, 'Describa el servicio sobre el que reclama.'),
		claimType: z.enum(values(claimTypes), { error: 'Elija el tipo de reclamación.' }),
		detail: text(10, L.text, 'Cuéntenos el motivo de su reclamación (al menos 10 caracteres).'),
		request: text(3, L.text, 'Cuéntenos qué solución espera.'),
		consent: z.literal(true, { error: 'Debe aceptar el tratamiento de sus datos personales.' }),
	})
	.superRefine((data, context) => {
		if (data.isMinor && (!data.guardianName || data.guardianName.length < 3)) {
			context.addIssue({
				code: 'custom',
				path: ['guardianName'],
				message: 'Ingrese el nombre de su padre, madre o apoderado.',
			});
		}
	});

export type ComplaintInput = z.infer<typeof complaintSchema>;

export interface ComplaintRecord extends ComplaintInput {
	code: string;
	createdAt: string;
	ip?: string;
	userAgent?: string;
}

const labelOf = (list: readonly { value: string; label: string }[], value: string) =>
	list.find((item) => item.value === value)?.label ?? value;

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
	dateStyle: 'long',
	timeStyle: 'short',
	timeZone: 'America/Lima',
});

/** Resumen legible para los correos */
function summarize(record: ComplaintRecord): ComplaintSummary {
	const claimTypeLabel = labelOf(claimTypes, record.claimType);
	const serviceLabel = labelOf(contractedServices, record.service);

	const fields = [
		{ label: 'Tipo', value: claimTypeLabel },
		{ label: 'Consumidor', value: record.fullName },
		...(record.isMinor && record.guardianName
			? [{ label: 'Padre, madre o apoderado', value: record.guardianName }]
			: []),
		{
			label: 'Documento',
			value: `${labelOf(documentTypes, record.documentType)} ${record.documentNumber}`,
		},
		{ label: 'Correo', value: record.email },
		{ label: 'Celular', value: record.phone },
		{ label: 'Domicilio', value: record.address },
		{ label: 'Servicio contratado', value: serviceLabel },
		...(record.amount !== undefined
			? [{ label: 'Monto reclamado', value: `S/ ${record.amount.toFixed(2)}` }]
			: []),
		{ label: 'Descripción del servicio', value: record.description },
		{ label: 'Detalle', value: record.detail },
		{ label: 'Pedido', value: record.request },
	];

	return {
		code: record.code,
		date: dateFormatter.format(new Date(record.createdAt)),
		claimTypeLabel,
		serviceLabel,
		fields,
	};
}

/** Registra la reclamación y envía los correos. Devuelve el registro guardado */
export async function registerComplaint(
	input: ComplaintInput,
	meta: { ip?: string; userAgent?: string },
): Promise<{ record: ComplaintRecord; emailSent: boolean }> {
	const record: ComplaintRecord = {
		...input,
		code: input.id ?? randomUUID(),
		createdAt: new Date().toISOString(),
		ip: meta.ip,
		userAgent: meta.userAgent?.slice(0, 300),
	};

	// 1. Guardar (si falla, la reclamación no se da por registrada)
	if (isWordPressAdminConfigured()) {
		await wordpressRequest('/peru/v1/complaints', record);
	} else {
		await writeJsonFile(`complaints/${record.code}.json`, record);
	}

	// 2. Correos (si fallan, la reclamación ya quedó registrada)
	const summary = summarize(record);
	let emailSent = true;
	try {
		await Promise.all([
			sendMail({ to: record.email, ...complaintReceiptEmail(summary, RESPONSE_DEADLINE_DAYS) }),
			sendMail({
				to: COMPLAINTS_EMAIL || site.contact.email,
				replyTo: record.email,
				...complaintNotificationEmail(summary),
			}),
		]);
	} catch (error) {
		emailSent = false;
		console.error('[reclamaciones] La reclamación se registró, pero no se pudo enviar el correo:', error);
	}

	return { record, emailSent };
}
