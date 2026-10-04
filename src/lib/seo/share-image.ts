/**
 * Imagen para compartir (Open Graph, Twitter y datos estructurados)
 * --------------------------------------------------------------------------
 * Genera una versión de 1200 × 630 px en JPG (el tamaño recomendado por
 * Facebook, LinkedIn, X y WhatsApp) a partir de una imagen local o remota,
 * y devuelve su URL absoluta.
 */
import { getImage } from 'astro:assets';

import { isRemoteImage, type ImageSource } from '@lib/content/images';
import defaultShareImage from '@assets/images/home/hero-video-poster.jpg';

export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export async function shareImageUrl(
	source: ImageSource | string | undefined,
	site: URL | undefined,
): Promise<string> {
	if (typeof source === 'string') return new URL(source, site).href;

	const image = source ?? defaultShareImage;
	const options = { ...SHARE_IMAGE_SIZE, fit: 'cover', format: 'jpg', quality: 80 } as const;

	try {
		const optimized = await getImage(
			isRemoteImage(image) ? { src: image.src, ...options } : { src: image, ...options },
		);
		return new URL(optimized.src, site).href;
	} catch {
		// Si una imagen remota no se puede procesar, se usa la original
		return new URL(image.src, site).href;
	}
}
