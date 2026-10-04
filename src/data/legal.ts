/**
 * Textos legales ( /legales/ )
 * --------------------------------------------------------------------------
 * Cada objeto es una sección numerada de la página ("1. Introducción",
 * "2. Condiciones generales"…). El número se agrega automáticamente según el
 * orden de la lista.
 *
 *   - id:          ancla de la sección (ej. /legales/#condiciones-generales).
 *                  En minúsculas, sin tildes y con guiones.
 *   - title:       título de la sección (sin el número).
 *   - paragraphs:  párrafos de la sección, en orden.
 *
 * TODO: reemplazar el texto de ejemplo (lorem ipsum del diseño de Figma) por
 * el texto legal real: términos y condiciones, política de privacidad
 * (Ley N° 29733 de Protección de Datos Personales), etc.
 */

export interface LegalSection {
	id: string;
	title: string;
	paragraphs: string[];
}

// Texto provisional del diseño (lorem ipsum)
const placeholderA =
	'Lorem ipsum dolor sit amet consectetur. Risus sodales elit metus gravida consectetur. Amet adipiscing accumsan id in ullamcorper lectus. Id tortor magna neque sit nulla suspendisse nunc sit rhoncus. Id pulvinar amet adipiscing non blandit id malesuada. Elit maecenas sapien amet lectus quis. Tincidunt turpis commodo amet purus ullamcorper pellentesque quis ultricies. Sit hendrerit aliquam sed sit vitae est id aenean tempor.';
const placeholderB =
	'Vel nibh semper senectus phasellus libero sed. Integer id in pellentesque nisi cras. Molestie aliquet sit vitae praesent. Nunc consequat vitae et cras.';

export const legalSections: LegalSection[] = [
	{
		id: 'introduccion',
		title: 'Introducción',
		paragraphs: [placeholderA, placeholderB],
	},
	{
		id: 'condiciones-generales',
		title: 'Condiciones generales',
		paragraphs: [placeholderA, placeholderB, placeholderA, placeholderB],
	},
];
