/**
 * Portal del estudiante — datos de prueba (mock) y textos editables.
 * --------------------------------------------------------------------------
 * Todo lo que el portal muestra sale de este archivo: rutas, datos del
 * estudiante, datos de pago, pasos del proceso y documentos requeridos.
 *
 * TODO (API): hoy son datos fijos. Cuando exista el backend, estos objetos
 * se reemplazan por la respuesta de la API (sesión del estudiante, estado del
 * pago y estado de cada paso). Mantén los mismos nombres de campos para no
 * tener que tocar los componentes.
 *
 * Privacidad: NO escribas aquí datos reales de personas. Usa siempre
 * marcadores genéricos ("Nombre Apellido Apellido", "DNI 00000000"…).
 */

import type { ImageMetadata } from 'astro';
import { site } from './site';
import bankBcpLogo from '@assets/images/portal/bank-bcp.png';

/* ==========================================================================
   1. RUTAS DEL PORTAL
   ========================================================================== */

export const portalRoutes = {
	payment: '/portal/pago/',
	paymentSent: '/portal/pago/enviado/',
	paymentRejected: '/portal/pago/rechazado/',
	process: '/portal/mi-proceso/',
	processDetail: '/portal/mi-proceso/detalle/',
	/** Al cerrar sesión se vuelve al inicio del sitio público */
	logout: '/',
} as const;

/* ==========================================================================
   2. ESTUDIANTE (sesión actual)
   ========================================================================== */

export const student = {
	/** Nombre que se muestra en el saludo del header ("Hola, Fernando") */
	firstName: 'Fernando',
	fullName: 'Nombre Apellido Apellido',
	documentType: 'DNI',
	documentNumber: '00000000',
	educationLevel: 'Técnico universitario',
	isMinor: true,
	careerOfInterest: 'Ingeniería Informática',
	email: 'tucorreo@gmail.com',
};

/* ==========================================================================
   3. STEPPER (Registro → Pago → Mi Proceso)
   ========================================================================== */

export type PortalStepId = 'register' | 'payment' | 'process';

export interface PortalStep {
	id: PortalStepId;
	label: string;
	/** Si no tiene href, el paso no es navegable (ej. Registro) */
	href?: string;
}

export const portalSteps: PortalStep[] = [
	{ id: 'register', label: 'Registro' },
	{ id: 'payment', label: 'Pago', href: portalRoutes.payment },
	{ id: 'process', label: 'Mi Proceso', href: portalRoutes.process },
];

/* ==========================================================================
   4. PAGO
   ========================================================================== */

export interface Bank {
	id: string;
	name: string;
	/** Logo del banco (opcional: si no hay, no se muestra imagen) */
	logo?: ImageMetadata;
}

/** Bancos desde los que el estudiante puede pagar (select del formulario) */
export const banks: Bank[] = [
	{ id: 'bcp', name: 'Banco de Crédito BCP', logo: bankBcpLogo },
	// TODO: confirmar la lista de bancos y agregar sus logos.
	{ id: 'interbank', name: 'Interbank' },
	{ id: 'bbva', name: 'BBVA' },
	{ id: 'scotiabank', name: 'Scotiabank' },
	{ id: 'other', name: 'Otro banco' },
];

export const payment = {
	// TODO: confirmar el monto con el equipo (valor tomado del diseño de Figma).
	amount: 1753,
	currency: 'PEN',
	currencySymbol: 'S/',
	defaultBankId: 'bcp',

	/** Cuenta de destino de la transferencia */
	account: {
		bankName: 'BCP',
		bankLogo: bankBcpLogo,
		type: 'Cuenta corriente',
		// TODO: confirmar el número de cuenta (valor tomado del diseño de Figma).
		number: '193-2414529-0-80',
		holder: `${site.legal.companyName} - RUC ${site.legal.ruc}`,
	},

	/** Medios de pago que NO se aceptan (recuadro informativo) */
	notAccepted: [
		'Transferencias en ventanilla fuera de Lima Metropolitana y Callao',
		'Depósitos en efectivo ni cheques',
	],

	/** Formatos aceptados para la constancia de pago */
	proofAccept: '.jpg,.jpeg,.png,.pdf',
	proofFormatsLabel: 'JPG, PNG o PDF',
};

/** Solicitud de pago enviada (pantalla "Solicitud de pago enviada") */
export const paymentRequest = {
	status: 'En validación de fondos',
	submittedAt: '2025-09-28T01:23:00-05:00',
	// TODO (API): URL real de la constancia en PDF.
	receiptHref: '#',
};

/** Pago rechazado (pantalla "Transacción rechazada") */
export const paymentRejection = {
	status: 'No procede',
	message:
		'No se adjuntó la constancia de transferencia correcta y el dinero no ingresó a nuestras cuentas',
};

/* ==========================================================================
   5. PASOS DEL PROCESO ("Mi proceso")
   ========================================================================== */

/**
 * Estados de un paso y el texto de su etiqueta:
 *   done        → "Terminado"     (verde)
 *   in-progress → "En curso"      (azul)
 *   in-review   → "En validación" (gris)
 *   upcoming    → "Más adelante"  (gris)
 */
export type StepStatus = 'done' | 'in-progress' | 'in-review' | 'upcoming';

export const stepStatusLabels: Record<StepStatus, string> = {
	done: 'Terminado',
	'in-progress': 'En curso',
	'in-review': 'En validación',
	upcoming: 'Más adelante',
};

export type ProcessStepId = 'personal-data' | 'documents' | 'contract' | 'visa' | 'travel';

export interface ProcessStep {
	id: ProcessStepId;
	number: number;
	title: string;
	/** Bajada corta bajo el título (pasos 3, 4 y 5) */
	description?: string;
	status: StepStatus;
}

// TODO: confirmar textos. La bajada de los pasos 3 a 5 parece un texto de
// relleno en Figma ("Fondo blanco, tipo pasaporte…"); se mantiene igual al diseño.
const placeholderDescription = 'Fondo blanco, tipo pasaporte, nítido y en formato digital JPG O PDF';

/** Pasos del proceso con su estado actual (pantalla "Mi proceso") */
export const processSteps: ProcessStep[] = [
	{ id: 'personal-data', number: 1, title: 'Tus datos personales', status: 'done' },
	{ id: 'documents', number: 2, title: 'Tus documentos', status: 'done' },
	{
		id: 'contract',
		number: 3,
		title: 'Contrato con el centro de estudios',
		description: placeholderDescription,
		status: 'done',
	},
	{
		id: 'visa',
		number: 4,
		title: 'Visado del estudiante',
		description: placeholderDescription,
		status: 'upcoming',
	},
	{
		id: 'travel',
		number: 5,
		title: 'Viaje a Rusia',
		description: placeholderDescription,
		status: 'upcoming',
	},
];

/** Busca un paso por su id (para no repetir títulos en las páginas) */
export function getProcessStep(id: ProcessStepId): ProcessStep {
	const step = processSteps.find((item) => item.id === id);
	if (!step) throw new Error(`[portal] No existe el paso "${id}"`);
	return step;
}

/** Resumen de los datos personales (paso 1 en "Mi proceso") */
export const personalDataSummary = [
	student.fullName,
	`${student.documentType} ${student.documentNumber}`,
	student.educationLevel,
	student.isMinor ? 'Sí, soy menor de edad' : 'No soy menor de edad',
	`Interesado en “${student.careerOfInterest}”`,
];

/* ==========================================================================
   6. DOCUMENTOS Y ARCHIVOS DE CADA PASO
   ========================================================================== */

export interface PortalDocument {
	id: string;
	title: string;
	description: string;
	/** Enlace opcional de descarga bajo la descripción (ej. "Descargar contrato") */
	download?: { label: string; href: string };
}

// TODO (API): URL real de cada archivo descargable.
const contractTemplateHref = '#';

/** Documentos que el estudiante debe subir (paso 2 · "Tus documentos") */
export const requiredDocuments: PortalDocument[] = [
	{
		id: 'guardian-id',
		title: 'Documento de identidad del padre o apoderado',
		description: placeholderDescription,
	},
	{
		id: 'guardian-passport',
		title: 'Pasaporte del padre o apoderado',
		description: placeholderDescription,
	},
	{ id: 'passport-photo', title: 'Foto tamaño pasaporte', description: placeholderDescription },
	{ id: 'birth-certificate', title: 'Acta de nacimiento', description: placeholderDescription },
	{
		id: 'student-passport',
		title: 'Pasaporte de estudiante (opcional)',
		description: placeholderDescription,
	},
	{ id: 'national-id', title: 'Documento nacional de identidad', description: placeholderDescription },
	{
		id: 'study-certificate',
		title: 'Certificado de estudios o título universitario',
		description: placeholderDescription,
	},
	{
		id: 'agency-contract',
		title: 'Contrato Peruana en Rusia',
		description: placeholderDescription,
		download: { label: 'Descargar contrato', href: contractTemplateHref },
	},
];

/** Resumen del paso 2 en "Mi proceso" (ej. "8/8 documentos enviados") */
export const documentsSummary = `${requiredDocuments.length}/${requiredDocuments.length} documentos enviados`;

/** Notas del recuadro "Antes de enviar" (paso 2) */
export const documentsNotes = [
	'Todos los documentos serán traducidos al idioma ruso y notariados para el envío a la universidad',
	'Podrás descargar tus documentos una vez estén notariados',
];

/** Paso 3 · contrato con el centro de estudios */
export const contractDocument: PortalDocument = {
	id: 'university-contract',
	title: 'Contrato Peru x Rusia',
	description: 'Descarga el contrato y fírmalo cuando esté disponible',
	download: { label: 'Descargar contrato', href: contractTemplateHref },
};

/** Paso 4 · visado */
export const visaDocument: PortalDocument = {
	id: 'student-visa',
	title: 'Foto con el visado de estudiante',
	description: placeholderDescription,
};

/** Paso 5 · archivos para descargar antes del viaje */
export const travelFiles = [
	{
		id: 'flight-tickets',
		title: 'Tickets de vuelo',
		// TODO: confirmar texto (en Figma se repite el texto del contrato).
		description: 'Descarga el contrato y fírmalo cuando esté disponible',
		actionLabel: 'Descargar tickets',
		href: '#', // TODO (API): URL de los tickets
	},
	{
		id: 'travel-tips',
		title: 'Recomendaciones antes de viajar',
		description: 'Descarga el contrato y fírmalo cuando esté disponible',
		actionLabel: 'Descargar PDF',
		href: '#', // TODO (API): URL del PDF de recomendaciones
	},
];

/** Documentos ya traducidos y notariados (paso 2 terminado) */
export const notarizedDocuments = {
	title: 'Ahora puedes descargar tus documentos',
	description: 'Documentos traducidos al ruso y notariados',
	actionLabel: 'Descargar documentos',
	href: '#', // TODO (API): URL del archivo con los documentos notariados
};

/** Texto común de los mensajes "en revisión" / "terminado" de cada paso */
export const reviewMessage =
	'Una vez sean traducidos y notariados te haremos saber para que puedas descargarlos';

/** Títulos de los mensajes de cada paso según su estado */
export const stepMessages = {
	documents: {
		review: 'Tus documentos están siendo revisados',
		done: 'Tus documentos están listos',
	},
	contract: {
		review: 'El contrato está siendo revisado',
		done: 'El contrato se completó correctamente',
	},
	visa: {
		review: 'Estamos revisando tu envío',
		done: 'Foto del pasaporte validado correctamente',
	},
};

/* ==========================================================================
   7. FORMULARIO DE DATOS PERSONALES (paso 1)
   ========================================================================== */

export const documentTypes = ['DNI', 'Carné de extranjería', 'Pasaporte'];

// TODO: confirmar opciones con el equipo.
export const educationLevels = [
	'Secundaria completa',
	'Técnico universitario',
	'Universitario',
	'Bachiller',
	'Titulado',
];

// TODO: confirmar opciones (idealmente, las carreras de src/data/universities.ts).
export const careers = [
	'Ingeniería Informática',
	'Medicina',
	'Arquitectura',
	'Economía',
	'Relaciones Internacionales',
];

/* ==========================================================================
   8. FORMATO
   ========================================================================== */

const amountFormatter = new Intl.NumberFormat('es-PE', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

/** "PEN S/ 1,753.00" */
export function formatAmount(
	amount: number,
	currency = payment.currency,
	symbol = payment.currencySymbol,
): string {
	return `${currency} ${symbol} ${amountFormatter.format(amount)}`;
}

const shortMonths = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** Fecha y hora como en el diseño: "28 sep 2025 - 01:23 am" (hora de Lima) */
export function formatDateTime(date: string | Date): string {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat('en-US', {
			day: 'numeric',
			month: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
			timeZone: 'America/Lima',
		})
			.formatToParts(new Date(date))
			.map((part) => [part.type, part.value]),
	);

	const month = shortMonths[Number(parts.month) - 1];
	return `${parts.day} ${month} ${parts.year} - ${parts.hour}:${parts.minute} ${String(parts.dayPeriod).toLowerCase()}`;
}
