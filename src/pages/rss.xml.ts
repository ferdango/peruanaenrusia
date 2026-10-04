/**
 * RSS del blog ( /rss.xml )
 * --------------------------------------------------------------------------
 * Feed con las publicaciones del blog (videos y artículos), del más reciente
 * al más antiguo. Lo usan lectores de noticias y algunos buscadores.
 */
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';

import { detailRoutes, routes } from '@data/navigation';
import { site as siteData } from '@data/site';
import { getBlogPosts } from '@lib/content';

export const GET: APIRoute = async ({ site }) => {
	const posts = await getBlogPosts();

	return rss({
		title: `Blog de ${siteData.name}`,
		description:
			'Videoblogs, charlas informativas y artículos para estudiar en Rusia: historias, consejos y todo lo que necesitas saber antes de viajar.',
		// Portada del sitio (con subcarpeta): base de los enlaces de cada publicación
		site: new URL(routes.home, site ?? 'https://peruanaenrusia.pe').href,
		customData: '<language>es-pe</language>',
		items: posts.map((post) => ({
			title: post.title,
			link: detailRoutes.blogPost(post.slug),
			pubDate: new Date(`${post.date}T12:00:00Z`),
			description:
				post.type === 'article' ? post.article.excerpt : (post.video.description ?? post.title),
			categories: [post.category],
		})),
	});
};
