<?php
/**
 * Cuentas de estudiantes
 * --------------------------------------------------------------------------
 * El sitio (servidor de Astro) crea o busca la cuenta del estudiante cuando
 * inicia sesión con Google o con un código por correo. Las cuentas son
 * usuarios de WordPress con el rol "Estudiante" (sin acceso al panel).
 *
 * Rutas (requieren la contraseña de aplicación de un administrador):
 *   POST /wp-json/peru/v1/students/lookup   { email }
 *   POST /wp-json/peru/v1/students          { email, name, picture, google_sub }
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const PERU_STUDENT_ROLE = 'estudiante';

function peru_register_student_role() {
	if ( ! get_role( PERU_STUDENT_ROLE ) ) {
		add_role( PERU_STUDENT_ROLE, __( 'Estudiante', 'peru-headless' ), array( 'read' => true ) );
	}
}
add_action( 'init', 'peru_register_student_role' );

// Los estudiantes no entran al panel de WordPress ni ven la barra de administración
add_action(
	'admin_init',
	static function () {
		$user = wp_get_current_user();
		if ( in_array( PERU_STUDENT_ROLE, (array) $user->roles, true ) && ! wp_doing_ajax() ) {
			wp_safe_redirect( defined( 'PERU_FRONTEND_URL' ) ? PERU_FRONTEND_URL : home_url() );
			exit;
		}
	}
);
add_filter(
	'show_admin_bar',
	static fn( $show ) => in_array( PERU_STUDENT_ROLE, (array) wp_get_current_user()->roles, true ) ? false : $show
);

add_action(
	'rest_api_init',
	static function () {
		register_rest_route(
			'peru/v1',
			'/students/lookup',
			array(
				'methods'             => 'POST',
				'callback'            => 'peru_rest_student_lookup',
				'permission_callback' => static fn() => current_user_can( 'list_users' ),
				'args'                => array(
					'email' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_email',
						'validate_callback' => static fn( $value ) => is_email( $value ),
					),
				),
			)
		);

		register_rest_route(
			'peru/v1',
			'/students',
			array(
				'methods'             => 'POST',
				'callback'            => 'peru_rest_student_upsert',
				'permission_callback' => static fn() => current_user_can( 'create_users' ),
				'args'                => array(
					'email'      => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_email',
						'validate_callback' => static fn( $value ) => is_email( $value ),
					),
					'name'       => array( 'sanitize_callback' => 'sanitize_text_field' ),
					'picture'    => array( 'sanitize_callback' => 'esc_url_raw' ),
					'google_sub' => array( 'sanitize_callback' => 'sanitize_text_field' ),
				),
			)
		);
	}
);

/** Datos públicos de la cuenta para el sitio */
function peru_student_payload( WP_User $user ) {
	return array(
		'id'         => $user->ID,
		'email'      => $user->user_email,
		'name'       => $user->display_name,
		'picture'    => get_user_meta( $user->ID, 'peru_picture', true ) ?: null,
		'created_at' => mysql2date( 'c', $user->user_registered ),
	);
}

function peru_rest_student_lookup( WP_REST_Request $request ) {
	$user = get_user_by( 'email', $request['email'] );
	if ( ! $user || ! in_array( PERU_STUDENT_ROLE, (array) $user->roles, true ) ) {
		return rest_ensure_response( array( 'student' => null ) );
	}
	return rest_ensure_response( array( 'student' => peru_student_payload( $user ) ) );
}

function peru_rest_student_upsert( WP_REST_Request $request ) {
	$email = strtolower( $request['email'] );
	$name  = $request['name'] ? wp_strip_all_tags( $request['name'] ) : '';
	$user  = get_user_by( 'email', $email );

	if ( $user && ! in_array( PERU_STUDENT_ROLE, (array) $user->roles, true ) ) {
		// Por seguridad, el sitio nunca inicia sesión como un usuario del equipo
		return new WP_Error( 'peru_not_student', 'El correo pertenece a una cuenta que no es de estudiante.', array( 'status' => 409 ) );
	}

	if ( ! $user ) {
		$base     = sanitize_user( strstr( $email, '@', true ), true ) ?: 'estudiante';
		$username = $base;
		$suffix   = 1;
		while ( username_exists( $username ) ) {
			$username = $base . $suffix++;
		}

		$user_id = wp_insert_user(
			array(
				'user_login'   => $username,
				'user_email'   => $email,
				'user_pass'    => wp_generate_password( 32, true, true ),
				'display_name' => $name ?: $username,
				'first_name'   => $name,
				'role'         => PERU_STUDENT_ROLE,
			)
		);
		if ( is_wp_error( $user_id ) ) {
			return $user_id;
		}
		$user = get_user_by( 'id', $user_id );
	} elseif ( $name && $user->display_name === $user->user_login ) {
		wp_update_user( array( 'ID' => $user->ID, 'display_name' => $name, 'first_name' => $name ) );
		$user = get_user_by( 'id', $user->ID );
	}

	if ( $request['picture'] ) {
		update_user_meta( $user->ID, 'peru_picture', $request['picture'] );
	}
	if ( $request['google_sub'] ) {
		update_user_meta( $user->ID, 'peru_google_sub', $request['google_sub'] );
	}
	update_user_meta( $user->ID, 'peru_last_login', current_time( 'mysql', true ) );

	return rest_ensure_response( array( 'student' => peru_student_payload( $user ) ) );
}
