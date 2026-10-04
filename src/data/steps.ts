/**
 * Pasos del proceso ("¿Qué tengo que hacer?")
 * --------------------------------------------------------------------------
 * Fuente de datos de:
 *   - Home → "¿Qué tengo que hacer?" (carrusel de tarjetas numeradas)
 *
 * El número de cada paso se calcula según el orden de la lista (01, 02…).
 *
 * Las ilustraciones (src/assets/graphics/illustrations/step-*.svg) son la
 * composición de Figma de cada tarjeta: dibujo + estrellas + ondas, en un
 * lienzo de 422 × 419 px (el tamaño de la tarjeta), así que se colocan sobre
 * la tarjeta entera y escalan con ella.
 */
import art01 from '@assets/graphics/illustrations/step-01-documents.svg';
import art02 from '@assets/graphics/illustrations/step-02-delivery.svg';
import art03 from '@assets/graphics/illustrations/step-03-contract.svg';
import art04 from '@assets/graphics/illustrations/step-04-visa.svg';
import art05 from '@assets/graphics/illustrations/step-05-travel.svg';

export interface ProcessStep {
	title: string;
	text: string;
	/** Ilustración de la tarjeta (SVG de 422 × 419 px) */
	illustration: { src: string; width: number; height: number };
}

export const processSteps: ProcessStep[] = [
	{
		title: 'Documentos traducidos',
		text: 'En esta primera etapa estaremos recibiendo sus documentos y, a su vez, los traduciremos para que puedan ser notariados en Rusia.',
		illustration: art01,
	},
	{
		title: 'Entrega de documentos',
		text: 'En este paso, realizamos los trámites de entrega de los documentos a la universidad para el registro del alumnado.',
		illustration: art02,
	},
	{
		title: 'Contrato con el instituto',
		text: 'Realizamos el contrato con la universidad para que el alumno pueda tener su vida universitaria de modo seguro.',
		illustration: art03,
	},
	{
		title: 'Visa de estudiante',
		text: 'Al tener todos estos documentos registrados, pasamos a realizar todos los trámites para generar la visa del estudiante.',
		illustration: art04,
	},
	{
		title: 'Viaje a Rusia',
		text: 'Finalmente, te ayudamos con la compra de los pasajes de avión y con la fecha de viaje bajo nuestra asesoría profesional.',
		illustration: art05,
	},
];
