<?php
/**
 * Campos de cada tipo de contenido
 * --------------------------------------------------------------------------
 * Con Advanced Custom Fields (ACF, versión gratuita) activo, se registran
 * formularios cómodos en el panel. Todos los campos usan tipos gratuitos
 * (texto, área de texto, imagen, URL, sí/no, lista y grupo).
 *
 * Sin ACF, los mismos nombres se guardan como metadatos de la entrada
 * (panel "Campos personalizados" del editor) y el sitio los lee igual.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Metadatos de las entradas del blog (también sin ACF).
 */
add_action(
	'init',
	static function () {
		register_post_meta(
			'post',
			'peru_youtube_id',
			array(
				'type'              => 'string',
				'single'            => true,
				'show_in_rest'      => true,
				'sanitize_callback' => 'sanitize_text_field',
				'auth_callback'     => static fn() => current_user_can( 'edit_posts' ),
			)
		);
		register_post_meta(
			'post',
			'peru_classic',
			array(
				'type'          => 'boolean',
				'single'        => true,
				'show_in_rest'  => true,
				'auth_callback' => static fn() => current_user_can( 'edit_posts' ),
			)
		);
	}
);

add_action( 'acf/init', 'peru_register_acf_fields' );

function peru_register_acf_fields() {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	$image = static fn( $key, $label, $instructions = '' ) => array(
		'key'           => "field_peru_{$key}",
		'name'          => $key,
		'label'         => $label,
		'type'          => 'image',
		'return_format' => 'id',
		'preview_size'  => 'medium',
		'instructions'  => $instructions,
	);
	$text = static fn( $key, $label, $instructions = '', $required = 0 ) => array(
		'key'          => "field_peru_{$key}",
		'name'         => $key,
		'label'        => $label,
		'type'         => 'text',
		'instructions' => $instructions,
		'required'     => $required,
	);
	$textarea = static fn( $key, $label, $instructions = '', $required = 0 ) => array(
		'key'          => "field_peru_{$key}",
		'name'         => $key,
		'label'        => $label,
		'type'         => 'textarea',
		'rows'         => 4,
		'new_lines'    => '',
		'instructions' => $instructions,
		'required'     => $required,
	);

	// ----- Entradas: videos y clásicos -----
	acf_add_local_field_group(
		array(
			'key'      => 'group_peru_post',
			'title'    => 'Peruana en Rusia — Blog',
			'position' => 'side',
			'fields'   => array(
				$text( 'peru_youtube_id', 'Código del video de YouTube', 'Si la entrada es un video: el código de la URL (youtube.com/watch?v=CÓDIGO).' ),
				array(
					'key'   => 'field_peru_peru_classic',
					'name'  => 'peru_classic',
					'label' => 'Mostrar en "Clásicos"',
					'type'  => 'true_false',
					'ui'    => 1,
				),
			),
			'location' => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'post' ) ) ),
		)
	);

	// ----- Universidades -----
	acf_add_local_field_group(
		array(
			'key'          => 'group_peru_universidad',
			'title'        => 'Ficha de la universidad',
			'instructions' => 'La foto principal es la "Imagen destacada".',
			'fields'       => array(
				$text( 'city', 'Ciudad', '', 1 ),
				array(
					'key'          => 'field_peru_featured',
					'name'         => 'featured',
					'label'        => 'Destacada en el Home',
					'type'         => 'true_false',
					'ui'           => 1,
				),
				array(
					'key'   => 'field_peru_website',
					'name'  => 'website',
					'label' => 'Sitio web oficial',
					'type'  => 'url',
				),
				$textarea( 'summary', 'Resumen', 'Primer párrafo de la ficha y descripción para buscadores.' ),
				$text( 'founded', 'Año de fundación', 'Ej. 1755.' ),
				$text( 'kind', 'Tipo de universidad', 'Ej. Pública.' ),
				array(
					'key'           => 'field_peru_brochure',
					'name'          => 'brochure',
					'label'         => 'Brochure (PDF)',
					'type'          => 'file',
					'return_format' => 'url',
					'mime_types'    => 'pdf',
					'instructions'  => 'PDF oficial de la universidad. Si se deja vacío, el sitio ofrece el brochure que genera con los datos de la ficha.',
				),
				$image( 'logo', 'Logo', 'PNG con fondo transparente.' ),
				$image( 'cover', 'Foto de cabecera de la ficha' ),
				$image( 'gallery_1', 'Foto de la ficha 1' ),
				$image( 'gallery_2', 'Foto de la ficha 2' ),
				$textarea( 'description', 'Descripción', 'Separa los párrafos con una línea en blanco.' ),
				$textarea( 'highlights', 'La universidad cuenta con', 'Un elemento por línea.' ),
				$textarea( 'faculties', 'Áreas de estudio', 'Una por línea: Nombre de la facultad | Descripción.' ),
				$textarea( 'rankings_intro', 'Reputación y rankings: introducción' ),
				$textarea( 'rankings', 'Rankings', 'Uno por línea.' ),
				$textarea( 'student_life', 'Vida estudiantil e internacionalización', 'Separa los párrafos con una línea en blanco.' ),
				$textarea( 'tips', 'Consejos', 'Uno por línea.' ),
			),
			'location'     => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'universidad' ) ) ),
		)
	);

	// ----- Casos de éxito -----
	$tile = static fn( $prefix, $n ) => array(
		'key'        => "field_peru_{$prefix}_tile_{$n}",
		'name'       => "tile_{$n}",
		'label'      => "Casilla {$n}",
		'type'       => 'group',
		'layout'     => 'row',
		'sub_fields' => array(
			array( 'key' => "field_peru_{$prefix}_tile_{$n}_title", 'name' => 'title', 'label' => 'Título', 'type' => 'text' ),
			array( 'key' => "field_peru_{$prefix}_tile_{$n}_text", 'name' => 'text', 'label' => 'Texto', 'type' => 'textarea', 'rows' => 3 ),
			array(
				'key'           => "field_peru_{$prefix}_tile_{$n}_photo",
				'name'          => 'photo',
				'label'         => 'O una foto',
				'type'          => 'image',
				'return_format' => 'id',
			),
		),
	);
	$story = static fn( $n, $side ) => array(
		'key'          => "field_peru_story_{$n}",
		'name'         => "story_{$n}",
		'label'        => "Paso a paso — bloque {$n} (foto grande a la {$side})",
		'type'         => 'group',
		'layout'       => 'block',
		'instructions' => 'Foto grande + 4 casillas (texto o foto). Las casillas vacías no se muestran.',
		'sub_fields'   => array(
			array( 'key' => "field_peru_story_{$n}_photo", 'name' => 'photo', 'label' => 'Foto grande', 'type' => 'image', 'return_format' => 'id' ),
			$tile( "story_{$n}", 1 ),
			$tile( "story_{$n}", 2 ),
			$tile( "story_{$n}", 3 ),
			$tile( "story_{$n}", 4 ),
		),
	);
	$post_item = static fn( $n ) => array(
		'key'        => "field_peru_gallery_post_{$n}",
		'name'       => "gallery_{$n}",
		'label'      => "Publicación {$n}",
		'type'       => 'group',
		'layout'     => 'row',
		'sub_fields' => array(
			array( 'key' => "field_peru_gallery_post_{$n}_image", 'name' => 'image', 'label' => 'Foto', 'type' => 'image', 'return_format' => 'id' ),
			array( 'key' => "field_peru_gallery_post_{$n}_url", 'name' => 'url', 'label' => 'Enlace a la publicación', 'type' => 'url' ),
			array( 'key' => "field_peru_gallery_post_{$n}_album", 'name' => 'album', 'label' => 'Tiene varias fotos', 'type' => 'true_false', 'ui' => 1 ),
		),
	);

	acf_add_local_field_group(
		array(
			'key'          => 'group_peru_caso',
			'title'        => 'Caso de éxito',
			'instructions' => 'El título de la entrada es el nombre del estudiante.',
			'fields'       => array(
				$text( 'role', 'Carrera y universidad', 'Ej. Estudiante de Medicina en la Universidad de Moscú.', 1 ),
				array(
					'key'      => 'field_peru_country',
					'name'     => 'country',
					'label'    => 'País',
					'type'     => 'select',
					'required' => 1,
					'choices'  => array(
						'pe' => 'Perú',
						'co' => 'Colombia',
						'mx' => 'México',
						'ar' => 'Argentina',
						'es' => 'España',
						'ru' => 'Rusia',
					),
					'default_value' => 'pe',
				),
				$textarea( 'quote', 'Frase de la tarjeta', '', 1 ),
				$image( 'avatar', 'Foto de perfil (cuadrada)' ),
				$text( 'headline', 'Frase de la portada (sin comillas)' ),
				$image( 'portrait', 'Foto de la portada' ),
				$image( 'video_poster', 'Miniatura del video' ),
				array( 'key' => 'field_peru_video_url', 'name' => 'video_url', 'label' => 'Enlace del video (YouTube)', 'type' => 'url' ),
				$text( 'highlight', 'Cita destacada (sin comillas)' ),
				$story( 1, 'derecha' ),
				$story( 2, 'izquierda' ),
				$post_item( 1 ),
				$post_item( 2 ),
				$post_item( 3 ),
				$post_item( 4 ),
				$text( 'closing_quote', 'Cita final (sin comillas)' ),
				$textarea( 'closing_text', 'Texto final' ),
			),
			'location'     => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'caso_exito' ) ) ),
		)
	);
}
