<?php
/**
 * Recompilar el sitio al publicar contenido
 * --------------------------------------------------------------------------
 * El sitio público es HTML estático generado a partir de WordPress. Cuando
 * se publica, actualiza o elimina contenido, este archivo pide volver a
 * compilarlo. Destinos (constantes en wp-config.php):
 *
 *   - GitHub Pages: PERU_GITHUB_REPO ('usuario/repositorio') y PERU_GITHUB_TOKEN
 *     (token "fine-grained" con permiso Contents: Read and write solo sobre ese
 *     repositorio). Lanza el workflow "Publicar en GitHub Pages".
 *   - Otro hosting: PERU_DEPLOY_HOOK_URL (URL de "deploy hook" de Netlify,
 *     Vercel, Cloudflare Pages, etc.).
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

/**
 * Petición que lanza la recompilación: array( url, args ) o null si no hay
 * ningún destino configurado.
 */
function peru_deploy_request() {
	$payload = array(
		'source' => 'peru-headless',
		'time'   => time(),
	);

	if ( defined( 'PERU_GITHUB_REPO' ) && defined( 'PERU_GITHUB_TOKEN' ) && PERU_GITHUB_TOKEN
		&& preg_match( '#^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$#', (string) PERU_GITHUB_REPO ) ) {
		return array(
			'url'  => 'https://api.github.com/repos/' . PERU_GITHUB_REPO . '/dispatches',
			'args' => array(
				'headers' => array(
					'Accept'        => 'application/vnd.github+json',
					'Authorization' => 'Bearer ' . PERU_GITHUB_TOKEN,
					'Content-Type'  => 'application/json',
				),
				'body'    => wp_json_encode(
					array(
						'event_type'     => 'wordpress-update',
						'client_payload' => $payload,
					)
				),
			),
		);
	}

	if ( defined( 'PERU_DEPLOY_HOOK_URL' ) && PERU_DEPLOY_HOOK_URL ) {
		return array(
			'url'  => PERU_DEPLOY_HOOK_URL,
			'args' => array(
				'headers' => array( 'Content-Type' => 'application/json' ),
				'body'    => wp_json_encode( $payload ),
			),
		);
	}

	return null;
}

/** Programa la recompilación (agrupando cambios seguidos) */
function peru_schedule_deploy() {
	if ( null === peru_deploy_request() ) {
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
		$request = peru_deploy_request();
		if ( null === $request ) {
			return;
		}
		$response = wp_remote_post(
			$request['url'],
			array_merge(
				array(
					'timeout'  => 15,
					'blocking' => true,
				),
				$request['args']
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
				if ( null === peru_deploy_request() ) {
					echo '<p>' . esc_html__( 'Define PERU_GITHUB_REPO y PERU_GITHUB_TOKEN (GitHub Pages) o PERU_DEPLOY_HOOK_URL en wp-config.php para activar esta función.', 'peru-headless' ) . '</p></div>';
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
