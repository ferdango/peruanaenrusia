/**
 * Idiomas del sitio
 * --------------------------------------------------------------------------
 * Opciones del selector "Idioma y región" (LanguageModal) y texto corto de
 * la píldora de idioma del header (ES / EN / RU).
 *
 * Para agregar un idioma: guarda su bandera circular (PNG 512×512) en
 * src/assets/images/flags/ y añade un objeto a la lista `languages`.
 *
 * TODO (i18n): hoy solo se guarda la preferencia del usuario (localStorage);
 * el contenido sigue en español. Cuando existan las traducciones, usar el
 * enrutado i18n de Astro (https://docs.astro.build/en/guides/internationalization/)
 * y redirigir a la versión del idioma elegido (ej. /en/, /ru/).
 */
import type { ImageMetadata } from 'astro';

import flagEs from '@assets/images/flags/es.png';
import flagUs from '@assets/images/flags/us.png';
import flagRu from '@assets/images/flags/ru.png';

export type LanguageCode = 'es' | 'en' | 'ru';

export interface Language {
	code: LanguageCode;
	/** Texto de la píldora del header */
	short: string;
	/** Nombre visible en el selector (Figma: "Modal Idiomas") */
	label: string;
	/** Región o subtítulo visible en el selector */
	region: string;
	/** Nombre del idioma en español (para textos accesibles) */
	name: string;
	/** Idioma (BCP 47) en que está escrita la etiqueta visible → atributo lang */
	labelLang: string;
	/** Idioma (BCP 47) en que está escrita la región, si no es español */
	regionLang?: string;
	flag: ImageMetadata;
}

export const languages: Language[] = [
	{
		code: 'es',
		short: 'ES',
		label: 'Español - América Latina',
		region: 'Perú',
		name: 'Español',
		labelLang: 'es',
		flag: flagEs,
	},
	{
		code: 'en',
		short: 'EN',
		label: 'English',
		region: 'USA',
		name: 'Inglés',
		labelLang: 'en',
		regionLang: 'en',
		flag: flagUs,
	},
	{
		code: 'ru',
		short: 'RU',
		label: 'Ruso',
		region: 'Russian',
		name: 'Ruso',
		labelLang: 'es',
		regionLang: 'en',
		flag: flagRu,
	},
];

/** Idioma por defecto del sitio (el contenido actual está en español) */
export const defaultLanguage: LanguageCode = 'es';
