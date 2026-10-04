<?php
/**
 * Utilidades compartidas: lectura de campos (ACF o metadatos), imágenes
 * normalizadas y listas de texto.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lee un campo: primero de ACF (si está activo) y si no, del metadato.
 *
 * @param string $name    Nombre del campo.
 * @param int    $post_id ID de la entrada.
 * @return mixed
 */
function peru_field( $name, $post_id ) {
	if ( function_exists( 'get_field' ) ) {
		$value = get_field( $name, $post_id );
		if ( null !== $value && false !== $value && '' !== $value ) {
			return $value;
		}
	}
	return get_post_meta( $post_id, $name, true );
}

/**
 * Imagen normalizada para el sitio: { src, width, height, alt } o null.
 * Acepta un ID de adjunto, un arreglo de ACF o una URL.
 *
 * @param mixed $value Imagen.
 * @return array|null
 */
function peru_image( $value ) {
	if ( is_array( $value ) && isset( $value['ID'] ) ) {
		$value = (int) $value['ID'];
	}

	if ( is_numeric( $value ) && (int) $value > 0 ) {
		$id   = (int) $value;
		$data = wp_get_attachment_image_src( $id, 'full' );
		if ( ! $data ) {
			return null;
		}
		return array(
			'src'    => $data[0],
			'width'  => (int) $data[1],
			'height' => (int) $data[2],
			'alt'    => (string) get_post_meta( $id, '_wp_attachment_image_alt', true ),
		);
	}

	return null;
}

/**
 * Texto de varias líneas → lista (una línea por elemento, sin vacías).
 *
 * @param mixed $value Texto.
 * @return string[]
 */
function peru_lines( $value ) {
	if ( is_array( $value ) ) {
		return array_values( array_filter( array_map( 'trim', array_map( 'strval', $value ) ) ) );
	}
	$lines = preg_split( '/\r\n|\r|\n/', (string) $value );
	return array_values( array_filter( array_map( 'trim', $lines ) ) );
}

/**
 * Texto con párrafos separados por una línea en blanco → lista de párrafos.
 *
 * @param mixed $value Texto.
 * @return string[]
 */
function peru_paragraphs( $value ) {
	$parts = preg_split( '/(\r\n|\r|\n)\s*(\r\n|\r|\n)/', trim( (string) $value ) );
	return array_values( array_filter( array_map( 'trim', $parts ) ) );
}

/**
 * Texto simple o null si está vacío.
 *
 * @param mixed $value Texto.
 * @return string|null
 */
function peru_text( $value ) {
	$value = is_string( $value ) ? trim( $value ) : '';
	return '' === $value ? null : $value;
}
