/**
 * Países y banderas
 * --------------------------------------------------------------------------
 * Se usan en las tarjetas de casos de éxito (bandera del estudiante).
 *
 * Para agregar un país: guarda su bandera en src/assets/images/flags/ (PNG
 * circular) o en src/assets/graphics/flags/ (SVG cuadrado: se recorta en
 * círculo con CSS) e impórtala aquí con su código ISO de 2 letras.
 */
import type { ImageMetadata } from 'astro';

import flagEs from '@assets/images/flags/es.png';
import flagPe from '@assets/images/flags/pe.png';
import flagAr from '@assets/graphics/flags/ar.svg';
import flagCo from '@assets/graphics/flags/co.svg';
import flagMx from '@assets/graphics/flags/mx.svg';
import flagRu from '@assets/graphics/flags/ru.svg';

export const countries = {
	pe: { name: 'Perú', flag: flagPe },
	es: { name: 'España', flag: flagEs },
	co: { name: 'Colombia', flag: flagCo },
	mx: { name: 'México', flag: flagMx },
	ar: { name: 'Argentina', flag: flagAr },
	ru: { name: 'Rusia', flag: flagRu },
} satisfies Record<string, { name: string; flag: ImageMetadata }>;

export type CountryCode = keyof typeof countries;

/** ¿El texto es un código de país conocido? (útil para validar datos del CMS) */
export function isCountryCode(value: unknown): value is CountryCode {
	return typeof value === 'string' && value in countries;
}
