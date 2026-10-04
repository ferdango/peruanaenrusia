/**
 * Imágenes del contenido
 * --------------------------------------------------------------------------
 * El contenido puede traer dos tipos de imagen:
 *   - Local:  importada desde src/assets/ (ImageMetadata de Astro).
 *   - Remota: una URL con sus medidas, por ejemplo una imagen de la
 *             biblioteca de medios de WordPress.
 *
 * Ambas se dibujan con el componente <MediaImage /> (src/components/ui/),
 * que las optimiza igual (WebP, varios tamaños). Las remotas solo se
 * optimizan si su dominio está permitido en astro.config.mjs → image.
 */
import type { ImageMetadata } from 'astro';

/** Imagen remota (ej. WordPress): URL absoluta + medidas originales en px */
export interface RemoteImage {
	src: string;
	width: number;
	height: number;
}

/** Imagen del contenido: local (src/assets) o remota */
export type ImageSource = ImageMetadata | RemoteImage;

/** ¿Es una imagen remota (URL absoluta)? */
export function isRemoteImage(image: ImageSource): image is RemoteImage {
	return typeof image.src === 'string' && /^https?:\/\//i.test(image.src);
}

/** URL absoluta de una imagen (para metadatos Open Graph y datos estructurados) */
export function imageUrl(image: ImageSource, site: URL | undefined): string {
	return new URL(image.src, site).href;
}
