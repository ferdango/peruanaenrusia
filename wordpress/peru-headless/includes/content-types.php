<?php
/**
 * Tipos de contenido
 * --------------------------------------------------------------------------
 *   Universidad          → /wp-json/wp/v2/universidades
 *   Caso de éxito        → /wp-json/wp/v2/casos-de-exito
 *   Pregunta frecuente   → /wp-json/wp/v2/preguntas-frecuentes
 *   Reclamación          → privado (solo panel; lo crea la API del sitio)
 *
 * El orden de universidades, casos y preguntas se define con el campo
 * "Orden" (atributos de página) de cada entrada.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'init', 'peru_register_content_types' );

function peru_register_content_types() {
	$common = array(
		'public'       => true,
		'show_in_rest' => true,
		'has_archive'  => false,
		'menu_position' => 20,
	);

	register_post_type(
		'universidad',
		array_merge(
			$common,
			array(
				'labels'    => array(
					'name'          => __( 'Universidades', 'peru-headless' ),
					'singular_name' => __( 'Universidad', 'peru-headless' ),
					'add_new_item'  => __( 'Agregar universidad', 'peru-headless' ),
					'edit_item'     => __( 'Editar universidad', 'peru-headless' ),
				),
				'rest_base' => 'universidades',
				'rewrite'   => array( 'slug' => 'universidades' ),
				'menu_icon' => 'dashicons-building',
				'supports'  => array( 'title', 'excerpt', 'thumbnail', 'page-attributes', 'custom-fields' ),
			)
		)
	);

	register_post_type(
		'caso_exito',
		array_merge(
			$common,
			array(
				'labels'    => array(
					'name'          => __( 'Casos de éxito', 'peru-headless' ),
					'singular_name' => __( 'Caso de éxito', 'peru-headless' ),
					'add_new_item'  => __( 'Agregar caso de éxito', 'peru-headless' ),
					'edit_item'     => __( 'Editar caso de éxito', 'peru-headless' ),
				),
				'rest_base' => 'casos-de-exito',
				'rewrite'   => array( 'slug' => 'casos-de-exito' ),
				'menu_icon' => 'dashicons-awards',
				'supports'  => array( 'title', 'page-attributes', 'custom-fields' ),
			)
		)
	);

	register_post_type(
		'pregunta_frecuente',
		array_merge(
			$common,
			array(
				'labels'    => array(
					'name'          => __( 'Preguntas frecuentes', 'peru-headless' ),
					'singular_name' => __( 'Pregunta frecuente', 'peru-headless' ),
					'add_new_item'  => __( 'Agregar pregunta', 'peru-headless' ),
					'edit_item'     => __( 'Editar pregunta', 'peru-headless' ),
				),
				'rest_base' => 'preguntas-frecuentes',
				'rewrite'   => array( 'slug' => 'preguntas-frecuentes' ),
				'menu_icon' => 'dashicons-editor-help',
				'supports'  => array( 'title', 'editor', 'page-attributes' ),
			)
		)
	);

	// Reclamaciones: privadas, sin REST pública (se crean con /peru/v1/complaints)
	register_post_type(
		'reclamacion',
		array(
			'labels'          => array(
				'name'          => __( 'Libro de reclamaciones', 'peru-headless' ),
				'singular_name' => __( 'Reclamación', 'peru-headless' ),
				'edit_item'     => __( 'Ver reclamación', 'peru-headless' ),
			),
			'public'          => false,
			'show_ui'         => true,
			'show_in_menu'    => true,
			'show_in_rest'    => false,
			'menu_icon'       => 'dashicons-book-alt',
			'menu_position'   => 25,
			'supports'        => array( 'title' ),
			'capability_type' => 'post',
			'capabilities'    => array( 'create_posts' => 'do_not_allow' ),
			'map_meta_cap'    => true,
		)
	);
}

/**
 * Enlace "Ver" del panel → página del sitio público (Astro).
 */
add_filter(
	'post_type_link',
	static function ( $link, $post ) {
		if ( ! defined( 'PERU_FRONTEND_URL' ) ) {
			return $link;
		}
		$base = untrailingslashit( PERU_FRONTEND_URL );
		if ( 'universidad' === $post->post_type ) {
			return "{$base}/universidades/{$post->post_name}/";
		}
		if ( 'caso_exito' === $post->post_type ) {
			return "{$base}/casos-de-exito/{$post->post_name}/";
		}
		return $link;
	},
	10,
	2
);

add_filter(
	'post_link',
	static function ( $link, $post ) {
		if ( defined( 'PERU_FRONTEND_URL' ) && 'post' === $post->post_type ) {
			return untrailingslashit( PERU_FRONTEND_URL ) . "/blog/{$post->post_name}/";
		}
		return $link;
	},
	10,
	2
);

/**
 * Opcional: quien visite WordPress fuera del panel y de la API va al sitio público.
 */
add_action(
	'template_redirect',
	static function () {
		if ( ! defined( 'PERU_REDIRECT_FRONTEND' ) || ! PERU_REDIRECT_FRONTEND || ! defined( 'PERU_FRONTEND_URL' ) ) {
			return;
		}
		if ( is_admin() || wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || is_preview() ) {
			return;
		}
		wp_safe_redirect( untrailingslashit( PERU_FRONTEND_URL ) . '/', 301 );
		exit;
	}
);

add_filter(
	'allowed_redirect_hosts',
	static function ( $hosts ) {
		if ( defined( 'PERU_FRONTEND_URL' ) ) {
			$hosts[] = wp_parse_url( PERU_FRONTEND_URL, PHP_URL_HOST );
		}
		return $hosts;
	}
);
