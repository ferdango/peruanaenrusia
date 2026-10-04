/**
 * Datos estructurados (schema.org · JSON-LD)
 * --------------------------------------------------------------------------
 * Ayudan a Google y a otros buscadores a entender el contenido de cada página
 * (organización, artículos, videos, universidades, preguntas frecuentes…) y
 * habilitan resultados enriquecidos.
 *
 * Cada función devuelve un objeto listo para pasar a BaseLayout:
 *   <SiteLayout jsonLd={[breadcrumbSchema([...]), articleSchema({...})]}>
 *
 * Referencia: https://developers.google.com/search/docs/appearance/structured-data
 */
import { routes } from '@data/navigation';
import { site } from '@data/site';

export type JsonLd = Record<string, unknown>;

/** URL absoluta a partir de una ruta del sitio (con subcarpeta, ej. routes.blog) */
export const absoluteUrl = (path: string, base: URL | string | undefined) => new URL(path, base).href;

/** Identificadores de la organización y del sitio (anclas de la portada) */
const ORGANIZATION_ID = `${routes.home}#organizacion`;
const WEBSITE_ID = `${routes.home}#sitio`;

/** Organización (en todas las páginas) */
export function organizationSchema(siteUrl: URL | string | undefined, logoUrl: string): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'EducationalOrganization',
		'@id': absoluteUrl(ORGANIZATION_ID, siteUrl),
		name: site.name,
		legalName: site.legal.companyName,
		alternateName: site.shortName,
		slogan: site.tagline,
		description: site.description,
		url: absoluteUrl(routes.home, siteUrl),
		logo: logoUrl,
		email: site.contact.email,
		telephone: site.contact.phone,
		taxID: site.legal.ruc,
		areaServed: ['PE', 'RU'],
		sameAs: site.socials.map((social) => social.href),
		contactPoint: {
			'@type': 'ContactPoint',
			contactType: 'customer service',
			telephone: site.contact.phone,
			email: site.contact.email,
			availableLanguage: ['es', 'ru', 'en'],
		},
	};
}

/** Sitio web (en todas las páginas) */
export function websiteSchema(siteUrl: URL | string | undefined): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': absoluteUrl(WEBSITE_ID, siteUrl),
		name: site.name,
		url: absoluteUrl(routes.home, siteUrl),
		inLanguage: 'es-PE',
		publisher: { '@id': absoluteUrl(ORGANIZATION_ID, siteUrl) },
	};
}

/** Migas de pan: [{ name: 'Inicio', path: routes.home }, { name: 'Blog', path: routes.blog }, …] */
export function breadcrumbSchema(
	items: { name: string; path: string }[],
	siteUrl: URL | string | undefined,
): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path, siteUrl),
		})),
	};
}

interface ArticleInput {
	title: string;
	description: string;
	path: string;
	image: string;
	datePublished: string;
	dateModified?: string;
	authorName?: string;
	section?: string;
}

/** Artículo del blog */
export function articleSchema(input: ArticleInput, siteUrl: URL | string | undefined): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: input.title,
		description: input.description,
		image: [input.image],
		datePublished: input.datePublished,
		dateModified: input.dateModified ?? input.datePublished,
		articleSection: input.section,
		inLanguage: 'es-PE',
		mainEntityOfPage: absoluteUrl(input.path, siteUrl),
		author: input.authorName
			? { '@type': 'Person', name: input.authorName }
			: { '@id': absoluteUrl(ORGANIZATION_ID, siteUrl) },
		publisher: { '@id': absoluteUrl(ORGANIZATION_ID, siteUrl) },
	};
}

interface VideoInput {
	title: string;
	description: string;
	path: string;
	thumbnail: string;
	uploadDate: string;
	youtubeId?: string;
}

/** Video (videoblog) */
export function videoSchema(input: VideoInput, siteUrl: URL | string | undefined): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'VideoObject',
		name: input.title,
		description: input.description,
		thumbnailUrl: [input.thumbnail],
		uploadDate: input.uploadDate,
		url: absoluteUrl(input.path, siteUrl),
		...(input.youtubeId
			? {
					embedUrl: `https://www.youtube-nocookie.com/embed/${input.youtubeId}`,
					contentUrl: `https://www.youtube.com/watch?v=${input.youtubeId}`,
				}
			: {}),
		publisher: { '@id': absoluteUrl(ORGANIZATION_ID, siteUrl) },
	};
}

interface UniversityInput {
	name: string;
	description?: string;
	city: string;
	path: string;
	image: string;
	website?: string;
}

/** Universidad (ficha) */
export function universitySchema(input: UniversityInput, siteUrl: URL | string | undefined): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'CollegeOrUniversity',
		name: input.name,
		description: input.description,
		image: input.image,
		url: absoluteUrl(input.path, siteUrl),
		...(input.website ? { sameAs: [input.website] } : {}),
		address: {
			'@type': 'PostalAddress',
			addressLocality: input.city,
			addressCountry: 'RU',
		},
	};
}

/** Preguntas frecuentes */
export function faqSchema(faqs: { question: string; answer: string }[]): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: { '@type': 'Answer', text: faq.answer },
		})),
	};
}

/**
 * Serializa el JSON-LD de forma segura para insertarlo en un <script>:
 * escapa "<" para que ningún texto del contenido pueda cerrar la etiqueta.
 */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}
