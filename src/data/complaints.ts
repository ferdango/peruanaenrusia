/**
 * Libro de reclamaciones ( /libro-de-reclamaciones/ )
 * --------------------------------------------------------------------------
 * Opciones de las listas del formulario. Las usan la página
 * (src/components/sections/complaints/ComplaintsForm.astro) y la API que
 * valida los envíos (src/pages/api/reclamaciones.ts), así que solo hay que
 * editarlas aquí.
 *
 * Marco legal: Código de Protección y Defensa del Consumidor (Ley N° 29571)
 * y Reglamento del Libro de Reclamaciones (D.S. N° 011-2011-PCM y
 * modificatorias). La empresa debe responder en un plazo máximo de 15 días
 * hábiles y conservar las reclamaciones.
 *
 * ⚠️ Confirma con el equipo la lista de servicios que ofrece la empresa.
 */

export const documentTypes = [
	{ value: 'dni', label: 'DNI' },
	{ value: 'ce', label: 'Carné de extranjería' },
	{ value: 'pasaporte', label: 'Pasaporte' },
	{ value: 'ruc', label: 'RUC' },
] as const;

export const contractedServices = [
	{ value: 'asesoria-becas', label: 'Asesoría para postular a becas' },
	{ value: 'documentos', label: 'Preparación y traducción de documentos' },
	{ value: 'tramites-universidad', label: 'Trámites con la universidad' },
	{ value: 'visa', label: 'Visa de estudiante' },
	{ value: 'viaje', label: 'Pasajes y viaje' },
	{ value: 'otro', label: 'Otro servicio' },
] as const;

export const claimTypes = [
	{ value: 'reclamo', label: 'Reclamo' },
	{ value: 'queja', label: 'Queja' },
] as const;

export type DocumentType = (typeof documentTypes)[number]['value'];
export type ContractedService = (typeof contractedServices)[number]['value'];
export type ClaimType = (typeof claimTypes)[number]['value'];

/** Plazo máximo de respuesta (días hábiles) */
export const RESPONSE_DEADLINE_DAYS = 15;

/** Límites de longitud de los textos (se validan en el navegador y en el servidor) */
export const complaintLimits = {
	name: 120,
	document: 20,
	email: 160,
	phone: 20,
	address: 200,
	text: 3000,
} as const;
