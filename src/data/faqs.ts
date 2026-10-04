/**
 * Preguntas frecuentes
 * --------------------------------------------------------------------------
 * Fuente de datos de:
 *   - Home → "Preguntas frecuentes" (acordeón)
 *
 * Para agregar una pregunta: añade un objeto con `question` y `answer`.
 * La primera pregunta de la lista aparece abierta al cargar la página.
 */

export interface Faq {
	question: string;
	answer: string;
}

export const faqs: Faq[] = [
	{
		question: '¿Es verdad que puedo estudiar en Rusia con beca?',
		// TODO: reemplazar el texto de ejemplo del diseño (lorem ipsum) por la respuesta real.
		answer: 'Lorem ipsum dolor sit amet consectetur. Pretium ultricies tortor adipiscing volutpat turpis ultrices. Cursus diam imperdiet in turpis ac. In adipiscing diam ultricies dignissim ut lacus proin enim. Semper varius bibendum elementum.',
	},
	// TODO: escribir las respuestas reales de las siguientes preguntas.
	{
		question: '¿Qué incluye su asesoría?',
		answer: 'Respuesta en preparación.',
	},
	{
		question: '¿Necesito saber ruso desde el inicio?',
		answer: 'Respuesta en preparación.',
	},
	{
		question: '¿Es seguro viajar solo/a a Rusia?',
		answer: 'Respuesta en preparación.',
	},
	{
		question: '¿Qué diferencia tienen con una agencia?',
		answer: 'Respuesta en preparación.',
	},
];
