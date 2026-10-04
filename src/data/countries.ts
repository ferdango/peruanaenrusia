/**
 * Países y banderas
 * --------------------------------------------------------------------------
 * Para agregar un país: guarda su bandera (PNG circular) en
 * src/assets/images/flags/ e impórtala aquí.
 */
import type { ImageMetadata } from 'astro';

import flagEs from '@assets/images/flags/es.png';
import flagPe from '@assets/images/flags/pe.png';

export const countries = {
	pe: { name: 'Perú', flag: flagPe },
	es: { name: 'España', flag: flagEs },
} satisfies Record<string, { name: string; flag: ImageMetadata }>;

export type CountryCode = keyof typeof countries;
