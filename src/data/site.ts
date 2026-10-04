/**
 * Información general del sitio.
 * --------------------------------------------------------------------------
 * Cambia aquí los datos de contacto, redes sociales y datos legales: todos
 * los componentes (header, footer, menú, formularios…) leen de este archivo.
 */

import type { IconName } from '@components/ui/Icon.astro';

export interface SocialLink {
	label: string;
	href: string;
	icon: IconName;
}

export const site = {
	name: 'Peruana en Rusia',
	shortName: 'PeRu',
	/** Concepto de marca (Manual de marca · "Tu futuro, sin fronteras") */
	tagline: 'Tu futuro, sin fronteras',
	description:
		'Te acompañamos en cada paso para ganar tu beca y estudiar en Rusia: asesorías personalizadas, trámites, documentos y viaje.',
	locale: 'es-PE',

	contact: {
		phone: '+51 966 461 384',
		/** Número sin espacios ni símbolos (para enlaces tel: y WhatsApp) */
		phoneRaw: '51966461384',
		email: 'hola@peruanaenrusia.pe',
		whatsappMessage: 'Hola, quiero información para estudiar en Rusia.',
	},

	/** Datos legales (Libro de reclamaciones, pie de página, pagos) */
	legal: {
		companyName: 'Peruana en Rusia SAC',
		ruc: '20600322703',
	},

	// TODO: reemplazar por las URLs reales de las cuentas oficiales.
	socials: [
		{ label: 'YouTube', href: 'https://www.youtube.com/', icon: 'youtube' },
		{ label: 'Instagram', href: 'https://www.instagram.com/', icon: 'instagram' },
		{ label: 'Facebook', href: 'https://www.facebook.com/', icon: 'facebook' },
		{ label: 'TikTok', href: 'https://www.tiktok.com/', icon: 'tiktok' },
	] satisfies SocialLink[],
};

/** Enlace directo a WhatsApp con un mensaje predefinido */
export const whatsappUrl = `https://wa.me/${site.contact.phoneRaw}?text=${encodeURIComponent(
	site.contact.whatsappMessage,
)}`;
