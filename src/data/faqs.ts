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
	/** Respuesta en texto plano */
	answer: string;
	/**
	 * Respuesta con formato (HTML ya saneado). La usa el gestor de contenidos
	 * (WordPress); si existe, se muestra en lugar de `answer`.
	 */
	answerHtml?: string;
}

// ⚠️ BORRADOR: el diseño tenía texto de relleno. Estas respuestas son una base
// redactada para el sitio; revísalas con el equipo antes de publicar.
export const faqs: Faq[] = [
	{
		question: '¿Es verdad que puedo estudiar en Rusia con beca?',
		answer: 'Sí. Cada año el Gobierno de Rusia ofrece becas para estudiantes extranjeros que cubren el costo de la carrera en universidades estatales, incluido el año preparatorio de idioma ruso. Los pasajes, el alojamiento, el seguro médico y la manutención corren por cuenta del estudiante. Te ayudamos a preparar tu postulación para que aproveches la convocatoria.',
	},
	{
		question: '¿Qué incluye su asesoría?',
		answer: 'Te acompañamos de principio a fin: elegir la carrera y la universidad, preparar y traducir tus documentos, postular a la beca, hacer los trámites con la universidad, obtener la visa de estudiante y organizar tu viaje. Y seguimos contigo cuando llegas a Rusia.',
	},
	{
		question: '¿Necesito saber ruso desde el inicio?',
		answer: 'No. Si vas a estudiar en ruso, primero cursas un año preparatorio en la universidad, donde aprendes el idioma desde cero junto con las materias base de tu carrera. Algunas universidades también ofrecen programas en inglés.',
	},
	{
		question: '¿Es seguro viajar solo/a a Rusia?',
		answer: 'Cada año miles de estudiantes latinoamericanos viajan a estudiar a Rusia. Antes del viaje te preparamos con recomendaciones prácticas y, al llegar, cuentas con nuestra comunidad de estudiantes peruanos y con el acompañamiento de nuestro equipo.',
	},
	{
		question: '¿Qué diferencia tienen con una agencia?',
		answer: 'Somos estudiantes peruanos que ganaron la beca y viven en Rusia: conocemos el proceso porque lo vivimos. No hacemos falsas promesas, te explicamos cada paso con transparencia y te acompañamos también después de tu llegada.',
	},
];
