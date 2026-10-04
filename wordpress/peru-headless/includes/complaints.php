<?php
/**
 * Libro de reclamaciones
 * --------------------------------------------------------------------------
 * El sitio registra cada hoja de reclamación aquí (tipo privado
 * "Reclamación"), para que el equipo la vea, le dé seguimiento y la
 * conserve como exige la Ley N° 29571.
 *
 * Ruta (requiere la contraseña de aplicación de un usuario que pueda editar entradas):
 *   POST /wp-json/peru/v1/complaints   { code, createdAt, fullName, … }
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Campos de la hoja (clave → etiqueta) */
function peru_complaint_fields() {
	return array(
		'code'           => 'Código',
		'createdAt'      => 'Fecha de registro',
		'claimType'      => 'Tipo (reclamo / queja)',
		'fullName'       => 'Consumidor',
		'isMinor'        => 'Menor de edad',
		'guardianName'   => 'Padre, madre o apoderado',
		'documentType'   => 'Tipo de documento',
		'documentNumber' => 'Número de documento',
		'email'          => 'Correo',
		'phone'          => 'Celular',
		'address'        => 'Domicilio',
		'service'        => 'Servicio contratado',
		'amount'         => 'Monto reclamado (S/)',
		'description'    => 'Descripción del servicio',
		'detail'         => 'Detalle de la reclamación',
		'request'        => 'Pedido del consumidor',
		'ip'             => 'IP',
		'userAgent'      => 'Navegador',
	);
}

add_action(
	'rest_api_init',
	static function () {
		register_rest_route(
			'peru/v1',
			'/complaints',
			array(
				'methods'             => 'POST',
				'callback'            => 'peru_rest_create_complaint',
				'permission_callback' => static fn() => current_user_can( 'edit_posts' ),
			)
		);
	}
);

function peru_rest_create_complaint( WP_REST_Request $request ) {
	$data = $request->get_json_params();
	$code = isset( $data['code'] ) ? sanitize_text_field( $data['code'] ) : '';
	$name = isset( $data['fullName'] ) ? sanitize_text_field( $data['fullName'] ) : '';

	if ( ! $code || ! $name ) {
		return new WP_Error( 'peru_invalid_complaint', 'Faltan datos de la reclamación.', array( 'status' => 400 ) );
	}

	$post_id = wp_insert_post(
		array(
			'post_type'   => 'reclamacion',
			'post_status' => 'private',
			'post_title'  => sprintf( '%s — %s', $code, $name ),
		),
		true
	);
	if ( is_wp_error( $post_id ) ) {
		return $post_id;
	}

	foreach ( array_keys( peru_complaint_fields() ) as $key ) {
		if ( ! array_key_exists( $key, $data ) ) {
			continue;
		}
		$value = $data[ $key ];
		$value = is_bool( $value ) ? ( $value ? 'Sí' : 'No' ) : sanitize_textarea_field( (string) $value );
		update_post_meta( $post_id, "peru_{$key}", $value );
	}

	return rest_ensure_response( array( 'id' => $post_id ) );
}

/** Ficha de solo lectura en el panel */
add_action(
	'add_meta_boxes_reclamacion',
	static function () {
		add_meta_box(
			'peru_complaint_details',
			__( 'Hoja de reclamación', 'peru-headless' ),
			static function ( $post ) {
				echo '<table class="widefat striped"><tbody>';
				foreach ( peru_complaint_fields() as $key => $label ) {
					$value = get_post_meta( $post->ID, "peru_{$key}", true );
					if ( '' === $value ) {
						continue;
					}
					printf(
						'<tr><th style="width:30%%">%s</th><td style="white-space:pre-line">%s</td></tr>',
						esc_html( $label ),
						esc_html( $value )
					);
				}
				echo '</tbody></table>';
			},
			'reclamacion',
			'normal',
			'high'
		);
	}
);

/** Columnas del listado */
add_filter(
	'manage_reclamacion_posts_columns',
	static fn( $columns ) => array(
		'cb'               => $columns['cb'] ?? '',
		'title'            => __( 'Reclamación', 'peru-headless' ),
		'peru_claim_type'  => __( 'Tipo', 'peru-headless' ),
		'peru_service'     => __( 'Servicio', 'peru-headless' ),
		'date'             => __( 'Fecha', 'peru-headless' ),
	)
);

add_action(
	'manage_reclamacion_posts_custom_column',
	static function ( $column, $post_id ) {
		if ( 'peru_claim_type' === $column ) {
			echo esc_html( ucfirst( (string) get_post_meta( $post_id, 'peru_claimType', true ) ) );
		}
		if ( 'peru_service' === $column ) {
			echo esc_html( (string) get_post_meta( $post_id, 'peru_service', true ) );
		}
	},
	10,
	2
);
