<?php
/**
 * Campo REST "peru"
 * --------------------------------------------------------------------------
 * Cada universidad, caso de éxito y entrada del blog expone en la REST API un
 * campo `peru` con sus datos ya normalizados (imágenes con medidas, listas,
 * etc.). Es el contrato que lee el sitio en src/lib/content/wordpress.ts:
 * si cambias un nombre aquí, cámbialo también allá.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'rest_api_init', 'peru_register_rest_fields' );

function peru_register_rest_fields() {
	register_rest_field(
		'universidad',
		'peru',
		array(
			'get_callback' => 'peru_rest_university',
			'schema'       => array( 'type' => 'object', 'context' => array( 'view', 'edit' ) ),
		)
	);
	register_rest_field(
		'caso_exito',
		'peru',
		array(
			'get_callback' => 'peru_rest_testimonial',
			'schema'       => array( 'type' => 'object', 'context' => array( 'view', 'edit' ) ),
		)
	);
	register_rest_field(
		'post',
		'peru',
		array(
			'get_callback' => static fn( $post ) => array(
				'youtube_id' => peru_text( peru_field( 'peru_youtube_id', $post['id'] ) ),
				'classic'    => (bool) peru_field( 'peru_classic', $post['id'] ),
			),
			'schema'       => array( 'type' => 'object', 'context' => array( 'view', 'edit' ) ),
		)
	);
}

/** Universidad → contrato del sitio */
function peru_rest_university( $post ) {
	$id = (int) $post['id'];

	$faculties = array();
	foreach ( peru_lines( peru_field( 'faculties', $id ) ) as $line ) {
		$parts       = array_map( 'trim', explode( '|', $line, 2 ) );
		$faculties[] = array(
			'name'        => $parts[0],
			'description' => $parts[1] ?? null,
		);
	}

	return array(
		'city'         => peru_text( peru_field( 'city', $id ) ),
		'featured'     => (bool) peru_field( 'featured', $id ),
		'website'      => peru_text( peru_field( 'website', $id ) ),
		'summary'      => peru_text( peru_field( 'summary', $id ) ),
		'founded'      => peru_text( peru_field( 'founded', $id ) ),
		'kind'         => peru_text( peru_field( 'kind', $id ) ),
		'brochure'     => peru_text( peru_field( 'brochure', $id ) ),
		'logo'         => peru_image( peru_field( 'logo', $id ) ),
		'cover'        => peru_image( peru_field( 'cover', $id ) ),
		'gallery'      => array_values(
			array_filter(
				array(
					peru_image( peru_field( 'gallery_1', $id ) ),
					peru_image( peru_field( 'gallery_2', $id ) ),
				)
			)
		),
		'description'  => peru_paragraphs( peru_field( 'description', $id ) ),
		'highlights'   => peru_lines( peru_field( 'highlights', $id ) ),
		'faculties'    => $faculties,
		'rankings'     => array(
			'intro' => peru_text( peru_field( 'rankings_intro', $id ) ),
			'items' => peru_lines( peru_field( 'rankings', $id ) ),
		),
		'student_life' => peru_paragraphs( peru_field( 'student_life', $id ) ),
		'tips'         => peru_lines( peru_field( 'tips', $id ) ),
	);
}

/** Caso de éxito → contrato del sitio */
function peru_rest_testimonial( $post ) {
	$id = (int) $post['id'];

	$story = array();
	foreach ( array( 1, 2 ) as $n ) {
		$block = peru_field( "story_{$n}", $id );
		if ( ! is_array( $block ) ) {
			continue;
		}
		$tiles = array();
		foreach ( array( 1, 2, 3, 4 ) as $t ) {
			$tile = $block[ "tile_{$t}" ] ?? array();
			$photo = peru_image( $tile['photo'] ?? null );
			if ( $photo ) {
				$tiles[] = array( 'photo' => $photo );
			} elseif ( peru_text( $tile['title'] ?? '' ) && peru_text( $tile['text'] ?? '' ) ) {
				$tiles[] = array(
					'title' => peru_text( $tile['title'] ),
					'text'  => peru_text( $tile['text'] ),
				);
			}
		}
		$photo = peru_image( $block['photo'] ?? null );
		if ( $photo && 4 === count( $tiles ) ) {
			$story[] = array(
				'photo' => $photo,
				'tiles' => $tiles,
			);
		}
	}

	$gallery = array();
	foreach ( array( 1, 2, 3, 4 ) as $n ) {
		$item  = peru_field( "gallery_{$n}", $id );
		$image = is_array( $item ) ? peru_image( $item['image'] ?? null ) : null;
		if ( $image ) {
			$gallery[] = array_merge(
				$image,
				array(
					'href'  => peru_text( $item['url'] ?? '' ),
					'album' => ! empty( $item['album'] ),
				)
			);
		}
	}

	$poster = peru_image( peru_field( 'video_poster', $id ) );

	return array(
		'role'      => peru_text( peru_field( 'role', $id ) ),
		'country'   => peru_text( peru_field( 'country', $id ) ) ?? 'pe',
		'quote'     => peru_text( peru_field( 'quote', $id ) ),
		'avatar'    => peru_image( peru_field( 'avatar', $id ) ),
		'headline'  => peru_text( peru_field( 'headline', $id ) ),
		'portrait'  => peru_image( peru_field( 'portrait', $id ) ),
		'video'     => $poster ? array(
			'poster' => $poster,
			'url'    => peru_text( peru_field( 'video_url', $id ) ),
		) : null,
		'highlight' => peru_text( peru_field( 'highlight', $id ) ),
		'story'     => $story,
		'gallery'   => $gallery,
		'closing'   => array(
			'quote' => peru_text( peru_field( 'closing_quote', $id ) ),
			'text'  => peru_text( peru_field( 'closing_text', $id ) ),
		),
	);
}
