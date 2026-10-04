/**
 * Navegación del sitio.
 * --------------------------------------------------------------------------
 * Para agregar una nueva página al menú, añade un objeto { label, href }
 * en la lista que corresponda. El header, el menú lateral y el footer se
 * actualizan automáticamente.
 */

import { withBase } from '@utils/url';

export interface NavLink {
	label: string;
	href: string;
	/**
	 * Rutas (prefijos) que marcan este enlace como "activo".
	 * Si no se indica, se usa el propio href.
	 */
	activeOn?: string[];
}

/**
 * Rutas principales del sitio (evita escribir URLs a mano en los componentes).
 * Incluyen la subcarpeta de publicación si la hay (ver src/utils/url.ts).
 */
export const routes = {
	home: withBase('/'),
	successCases: withBase('/#casos-de-exito'),
	universities: withBase('/universidades/'),
	blog: withBase('/blog/'),
	faq: withBase('/#preguntas-frecuentes'),
	legal: withBase('/legales/'),
	complaintsBook: withBase('/libro-de-reclamaciones/'),
	infoTalks: withBase('/blog/#videoblogs'),
	portal: withBase('/portal/mi-proceso/'),
} as const;

/** URLs de las páginas de detalle (se construyen a partir del slug) */
export const detailRoutes = {
	university: (slug: string) => withBase(`/universidades/${slug}/`),
	successCase: (slug: string) => withBase(`/casos-de-exito/${slug}/`),
	blogPost: (slug: string) => withBase(`/blog/${slug}/`),
};

/** Menú principal del header (desktop) */
export const mainNav: NavLink[] = [
	{ label: 'Sobre nosotros', href: routes.home, activeOn: [routes.home] },
	{ label: 'Casos de éxito', href: routes.successCases, activeOn: [withBase('/casos-de-exito/')] },
	{ label: 'Universidades', href: routes.universities },
	{ label: 'Blog', href: routes.blog },
	{ label: 'FAQ', href: routes.faq },
];

/** Menú lateral (botón hamburguesa) */
export const sideNav: NavLink[] = [
	{ label: 'Acerca de', href: routes.home },
	{ label: 'Casos de éxito', href: routes.successCases },
	{ label: 'Universidades', href: routes.universities },
	{ label: 'Blog', href: routes.blog },
	{ label: 'Legales', href: routes.legal },
	{ label: 'FAQ', href: routes.faq },
	{ label: 'Charlas informativas', href: routes.infoTalks },
];

/** Enlaces del pie de página */
export const footerNav: NavLink[] = [
	{ label: 'Acerca de', href: routes.home },
	{ label: 'Casos de éxito', href: routes.successCases },
	{ label: 'Universidades', href: routes.universities },
	{ label: 'Blog', href: routes.blog },
	{ label: 'Legales', href: routes.legal },
	{ label: 'FAQ', href: routes.faq },
];

/**
 * Devuelve true si el enlace corresponde a la página actual.
 * Se usa para resaltar el ítem activo del menú (color celeste en el diseño).
 */
export function isActiveLink(link: NavLink, currentPath: string): boolean {
	// Los enlaces a anclas (ej. /#preguntas-frecuentes) no se marcan como activos
	// salvo que se indique explícitamente con `activeOn`.
	const targets = link.activeOn ?? (link.href.includes('#') ? [] : [link.href]);

	// El inicio solo se marca en la portada (todas las rutas empiezan por él)
	return targets.some((target) =>
		target === routes.home ? currentPath === routes.home : currentPath.startsWith(target),
	);
}
