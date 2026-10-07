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

	/**
	 * Charlas informativas gratuitas (sección "Charlas" del Home). La página de
	 * registro es la misma que http://charla.peruanaenrusia.com/ (se usa https).
	 */
	talks: {
		registerUrl: 'https://charla.peruanaenrusia.com/',
		platform: 'Zoom',
		day: 'Todos los domingos',
		time: 'De 9:00 a 11:00 a. m.',
		// TODO: confirmar la zona horaria de la charla (se asume la hora de Perú)
		timeZone: 'hora de Perú',
	},

	/** Datos legales (Libro de reclamaciones, pie de página, pagos) */
	legal: {
		companyName: 'Peruana en Rusia SAC',
		ruc: '20600322703',
	},

	// Cuentas oficiales "Kristal | Peruana en Rusia" (verificadas el 2026-10-05:
	// el perfil de TikTok enlaza a peruanaenrusia.com y el Linktree de la marca
	// enlaza a ese TikTok). TODO: confirmar la cuenta de Instagram.
	socials: [
		{ label: 'YouTube', href: 'https://www.youtube.com/@peruanaenrusia', icon: 'youtube' },
		{ label: 'Instagram', href: 'https://www.instagram.com/', icon: 'instagram' },
		{ label: 'Facebook', href: 'https://www.facebook.com/peruanaenrusia/', icon: 'facebook' },
		{ label: 'TikTok', href: 'https://www.tiktok.com/@peruanaenrusia', icon: 'tiktok' },
	] satisfies SocialLink[],
};

/** Enlace directo a WhatsApp con un mensaje predefinido */
export const whatsappUrl = `https://wa.me/${site.contact.phoneRaw}?text=${encodeURIComponent(
	site.contact.whatsappMessage,
)}`;
