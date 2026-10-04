<?php
/**
 * Plugin Name:       Peruana en Rusia — WordPress headless
 * Description:       Modelo de contenido y API para el sitio de Peruana en Rusia (Astro): universidades, casos de éxito, preguntas frecuentes, videos del blog, cuentas de estudiantes y Libro de reclamaciones.
 * Version:           1.0.0
 * Requires at least: 6.4
 * Requires PHP:      8.1
 * Author:            Peruana en Rusia
 * Text Domain:       peru-headless
 * License:           GPL-2.0-or-later
 *
 * WordPress se usa como gestor de contenidos "headless": el equipo edita el
 * contenido aquí y el sitio público (Astro) lo lee por la REST API al
 * compilar. Guía completa: docs/WORDPRESS.md del repositorio del sitio.
 *
 * Constantes opcionales (en wp-config.php):
 *   define( 'PERU_FRONTEND_URL', 'https://peruanaenrusia.pe' );
 *       → enlaces "Ver" del panel y redirección de las páginas del tema al sitio.
 *   define( 'PERU_DEPLOY_HOOK_URL', 'https://…/deploy-hook' );
 *       → URL que recompila el sitio cuando se publica o cambia contenido.
 *   define( 'PERU_REDIRECT_FRONTEND', true );
 *       → redirige al sitio público a quien visite el WordPress fuera del panel.
 *
 * Recomendado: Advanced Custom Fields (gratis) para editar los campos con
 * formularios cómodos. Sin ACF, los campos se guardan igual como metadatos.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PERU_HEADLESS_VERSION', '1.0.0' );
define( 'PERU_HEADLESS_DIR', plugin_dir_path( __FILE__ ) );

require_once PERU_HEADLESS_DIR . 'includes/helpers.php';
require_once PERU_HEADLESS_DIR . 'includes/content-types.php';
require_once PERU_HEADLESS_DIR . 'includes/fields.php';
require_once PERU_HEADLESS_DIR . 'includes/rest-fields.php';
require_once PERU_HEADLESS_DIR . 'includes/students.php';
require_once PERU_HEADLESS_DIR . 'includes/complaints.php';
require_once PERU_HEADLESS_DIR . 'includes/deploy.php';

/**
 * Al activar: registra los tipos de contenido, crea el rol "Estudiante" y
 * actualiza los enlaces permanentes.
 */
register_activation_hook(
	__FILE__,
	static function () {
		peru_register_content_types();
		peru_register_student_role();
		flush_rewrite_rules();
	}
);

register_deactivation_hook(
	__FILE__,
	static function () {
		flush_rewrite_rules();
	}
);
