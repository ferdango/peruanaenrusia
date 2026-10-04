/**
 * Textos legales ( /legales/ )
 * --------------------------------------------------------------------------
 * Cada objeto de `sections` es una sección numerada de la página
 * ("1. Introducción", "2. Condiciones generales"…). El número se agrega
 * automáticamente según el orden de la lista.
 *
 *   - id:          ancla de la sección (ej. /legales/#proteccion-de-datos).
 *                  En minúsculas, sin tildes y con guiones.
 *   - title:       título de la sección (sin el número).
 *   - paragraphs:  párrafos de la sección, en orden.
 *
 * Con WordPress configurado, el texto sale de la página "Legales" del CMS
 * (ver src/lib/content/) y este archivo queda como respaldo.
 *
 * ⚠️ BORRADOR: el diseño de Figma solo tenía texto de relleno. Este texto es
 * una base redactada para el sitio (términos de uso, privacidad según la
 * Ley N° 29733, cookies y Libro de reclamaciones según la Ley N° 29571).
 * Debe revisarlo y aprobarlo la asesoría legal de Peruana en Rusia antes de
 * publicar el sitio.
 */
import { site } from './site';

export interface LegalSection {
	id: string;
	title: string;
	paragraphs: string[];
}

const { companyName, ruc } = site.legal;
const { email } = site.contact;

export const legalSections: LegalSection[] = [
	{
		id: 'introduccion',
		title: 'Introducción',
		paragraphs: [
			`Este sitio web es operado por ${companyName} (RUC ${ruc}), en adelante "Peruana en Rusia". Aquí encontrarás los términos y condiciones de uso del sitio, nuestra política de privacidad y protección de datos personales, la política de cookies y la información sobre el Libro de reclamaciones.`,
			'Al navegar por el sitio, crear una cuenta o usar nuestros formularios, aceptas estas condiciones. Si no estás de acuerdo con ellas, te pedimos no utilizar el sitio.',
		],
	},
	{
		id: 'condiciones-generales',
		title: 'Condiciones generales',
		paragraphs: [
			'Peruana en Rusia brinda asesoría y acompañamiento a estudiantes que desean postular a becas y estudiar en universidades de Rusia: orientación, preparación y revisión de documentos, trámites ante las universidades y apoyo en la visa y el viaje.',
			'La información del sitio (universidades, carreras, requisitos, costos referenciales y plazos) es orientativa y puede cambiar según las disposiciones de cada universidad o entidad oficial. La adjudicación de becas y la admisión dependen exclusivamente de las universidades y de las autoridades competentes: Peruana en Rusia no garantiza su obtención.',
			'Las condiciones específicas de cada servicio contratado (alcance, precio, forma de pago y plazos) se detallan en el contrato o en la propuesta que aceptas en el portal del estudiante.',
			'Te comprometes a usar el sitio de forma lícita, a proporcionar información veraz y a no realizar acciones que puedan dañar, sobrecargar o impedir el funcionamiento normal del sitio.',
		],
	},
	{
		id: 'cuenta-de-usuario',
		title: 'Cuenta de usuario e inicio de sesión',
		paragraphs: [
			'Para acceder al portal del estudiante puedes iniciar sesión con un código que enviamos a tu correo o con tu cuenta de Google. Si usas Google, solo recibimos tu nombre, tu correo electrónico y tu foto de perfil; nunca conocemos tu contraseña de Google.',
			'Eres responsable de mantener el acceso a tu correo y de cerrar la sesión en dispositivos compartidos. Si detectas un uso no autorizado de tu cuenta, escríbenos de inmediato.',
		],
	},
	{
		id: 'proteccion-de-datos',
		title: 'Protección de datos personales',
		paragraphs: [
			`De acuerdo con la Ley N° 29733, Ley de Protección de Datos Personales, y su Reglamento, ${companyName} es responsable del tratamiento de los datos personales que nos proporcionas a través del sitio (formularios, portal del estudiante, inicio de sesión y Libro de reclamaciones).`,
			'Usamos tus datos para: crear y administrar tu cuenta, gestionar tu proceso de postulación y los servicios contratados, comunicarnos contigo, atender tus consultas y reclamaciones, y cumplir obligaciones legales. Solo con tu consentimiento adicional te enviaremos información comercial.',
			'Para gestionar tu postulación, podemos compartir los datos estrictamente necesarios con universidades, entidades oficiales, traductores y notarías, incluso fuera del Perú (por ejemplo, en Rusia), siempre con medidas de seguridad adecuadas y para la finalidad indicada.',
			'Conservamos tus datos mientras dure la relación contigo y, después, durante los plazos que exija la ley. Aplicamos medidas técnicas y organizativas para protegerlos (conexión cifrada, acceso restringido y sesiones seguras).',
			`Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (derechos ARCO), así como revocar tu consentimiento, escribiendo a ${email}. Si consideras que no hemos atendido tu solicitud, puedes acudir a la Autoridad Nacional de Protección de Datos Personales.`,
		],
	},
	{
		id: 'cookies',
		title: 'Política de cookies',
		paragraphs: [
			'Usamos cookies técnicas, necesarias para que el sitio funcione: mantener tu sesión iniciada de forma segura y recordar tus preferencias (como el idioma o tu decisión sobre las cookies).',
			'Las cookies de analítica o publicidad solo se activan si las aceptas en el aviso de cookies. Puedes cambiar tu decisión en cualquier momento borrando las cookies de tu navegador; el aviso volverá a aparecer.',
		],
	},
	{
		id: 'libro-de-reclamaciones',
		title: 'Libro de reclamaciones',
		paragraphs: [
			'Conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571) y su reglamento, ponemos a tu disposición un Libro de reclamaciones virtual. Al registrar tu reclamo o queja recibirás una copia en tu correo electrónico con su código de seguimiento.',
			'Responderemos tu reclamación en un plazo máximo de 15 días hábiles. La presentación de un reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.',
		],
	},
	{
		id: 'propiedad-intelectual',
		title: 'Propiedad intelectual',
		paragraphs: [
			'La marca Peruana en Rusia, su logotipo, los textos, fotografías, videos y demás contenidos del sitio son propiedad de Peruana en Rusia o se usan con autorización de sus titulares. No está permitido reproducirlos o utilizarlos con fines comerciales sin autorización previa y por escrito.',
		],
	},
	{
		id: 'cambios-y-contacto',
		title: 'Cambios y contacto',
		paragraphs: [
			'Podemos actualizar estos textos para reflejar cambios en nuestros servicios o en la normativa. La versión vigente es siempre la publicada en esta página.',
			`Si tienes preguntas sobre estas condiciones o sobre el tratamiento de tus datos, escríbenos a ${email}.`,
		],
	},
];

/** Página "Legales" con los textos locales (respaldo si no hay WordPress) */
export const legalPage = {
	title: 'Legales',
	subtitle: 'Términos y condiciones de uso, privacidad y protección de datos personales',
	updated: '2026-10-04',
	sections: legalSections,
};
