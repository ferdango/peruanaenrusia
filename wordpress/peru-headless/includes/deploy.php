<?php
/**
 * Recompilar el sitio al publicar contenido
 * --------------------------------------------------------------------------
 * El sitio público es HTML estático generado a partir de WordPress. Cuando
 * se publica, actualiza o elimina contenido, este archivo llama a la URL
 * PERU_DEPLOY_HOOK_URL (definida en wp-config.php) para volver a compilarlo.
 *
 * Para no recompilar en cada guardado, los cambios se agrupan: la llamada se
 * hace 2 minutos después del último cambio.
 *
 * Panel: Herramientas → "Recompilar sitio" permite lanzarla a mano.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const PERU_DEPLOY_EVENT = 'peru_headless_deploy';
const PERU_DEPLOY_TYPES = array( 'post', 'page', 'universidad', 'caso_exito', 'pregunta_frecuente' );

/** Programa la recompilación (agrupando cambios seguidos) */
function peru_schedule_deploy() {
	if ( ! defined( 'PERU_DEPLOY_HOOK_URL' ) || ! PERU_DEPLOY_HOOK_URL ) {
		return;
	}
	wp_clear_scheduled_hook( PERU_DEPLOY_EVENT );
	wp_schedule_single_event( time() + 2 * MINUTE_IN_SECONDS, PERU_DEPLOY_EVENT );
}

add_action(
	'transition_post_status',
	static function ( $new_status, $old_status, $post ) {
		if ( ! in_array( $post->post_type, PERU_DEPLOY_TYPES, true ) || wp_is_post_revision( $post ) ) {
			return;
		}
		// Publicar, actualizar algo publicado o despublicar
		if ( 'publish' === $new_status || 'publish' === $old_status ) {
			peru_schedule_deploy();
		}
	},
	10,
	3
);

add_action(
	'before_delete_post',
	static function ( $post_id ) {
		$post = get_post( $post_id );
		if ( $post && 'publish' === $post->post_status && in_array( $post->post_type, PERU_DEPLOY_TYPES, true ) ) {
			peru_schedule_deploy();
		}
	}
);

add_action(
	PERU_DEPLOY_EVENT,
	static function () {
		$response = wp_remote_post(
			PERU_DEPLOY_HOOK_URL,
			array(
				'timeout'  => 15,
				'blocking' => true,
				'headers'  => array( 'Content-Type' => 'application/json' ),
				'body'     => wp_json_encode( array( 'source' => 'peru-headless', 'time' => time() ) ),
			)
		);
		update_option(
			'peru_last_deploy',
			array(
				'time'   => time(),
				'status' => is_wp_error( $response ) ? $response->get_error_message() : wp_remote_retrieve_response_code( $response ),
			),
			false
		);
	}
);

/** Herramientas → Recompilar sitio */
add_action(
	'admin_menu',
	static function () {
		add_management_page(
			__( 'Recompilar sitio', 'peru-headless' ),
			__( 'Recompilar sitio', 'peru-headless' ),
			'edit_posts',
			'peru-deploy',
			static function () {
				if ( isset( $_POST['peru_deploy_now'] ) && check_admin_referer( 'peru_deploy_now' ) ) {
					do_action( PERU_DEPLOY_EVENT );
					echo '<div class="notice notice-success"><p>' . esc_html__( 'Se pidió recompilar el sitio.', 'peru-headless' ) . '</p></div>';
				}
				$last = get_option( 'peru_last_deploy' );
				echo '<div class="wrap"><h1>' . esc_html__( 'Recompilar sitio', 'peru-headless' ) . '</h1>';
				if ( ! defined( 'PERU_DEPLOY_HOOK_URL' ) || ! PERU_DEPLOY_HOOK_URL ) {
					echo '<p>' . esc_html__( 'Define PERU_DEPLOY_HOOK_URL en wp-config.php para activar esta función.', 'peru-headless' ) . '</p></div>';
					return;
				}
				if ( $last ) {
					printf(
						'<p>%s %s (%s)</p>',
						esc_html__( 'Última recompilación:', 'peru-headless' ),
						esc_html( wp_date( 'Y-m-d H:i', (int) $last['time'] ) ),
						esc_html( (string) $last['status'] )
					);
				}
				echo '<form method="post">';
				wp_nonce_field( 'peru_deploy_now' );
				submit_button( __( 'Recompilar ahora', 'peru-headless' ), 'primary', 'peru_deploy_now' );
				echo '</form></div>';
			}
		);
	}
);
