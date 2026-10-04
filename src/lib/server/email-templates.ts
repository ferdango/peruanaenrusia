/**
 * Plantillas de correo
 * --------------------------------------------------------------------------
 * HTML sencillo y compatible con clientes de correo (tablas y estilos en
 * línea) con los colores de la marca, más una versión en texto plano.
 * Todo dato que escribe una persona se escapa antes de insertarlo.
 */
import { site } from '@data/site';

const COLORS = {
	dark: '#171a1a',
	blue: '#125ba8',
	yellow: '#fbbd1d',
	text: '#2c3030',
	background: '#f4f4f4',
};

/** Escapa texto para insertarlo en HTML */
export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/** Marco común: cabecera oscura con el nombre de la marca y pie con datos legales */
function layout(title: string, body: string): string {
	return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${COLORS.background};font-family:Arial,Helvetica,sans-serif;color:${COLORS.text};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.background};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background:${COLORS.dark};padding:24px 32px;color:#f4f4f4;font-size:20px;font-weight:bold;">${escapeHtml(site.name)}</td></tr>
<tr><td style="padding:32px;font-size:15px;line-height:1.6;">${body}</td></tr>
<tr><td style="padding:20px 32px;background:${COLORS.background};font-size:12px;color:#6b6f6f;">
${escapeHtml(site.legal.companyName)} · RUC ${escapeHtml(site.legal.ruc)} · ${escapeHtml(site.contact.email)}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Código de acceso
// ---------------------------------------------------------------------------

export function accessCodeEmail(input: { name?: string; code: string; minutes: number }) {
	const greeting = input.name ? `Hola, ${input.name}:` : 'Hola:';
	const subject = `${input.code} es tu código de acceso a ${site.name}`;

	const text = [
		greeting,
		'',
		`Tu código para iniciar sesión es: ${input.code}`,
		`Vence en ${input.minutes} minutos.`,
		'',
		'Si no lo pediste, ignora este correo: nadie podrá entrar a tu cuenta sin el código.',
		'',
		site.name,
	].join('\n');

	const html = layout(
		subject,
		`<p style="margin:0 0 16px;">${escapeHtml(greeting)}</p>
<p style="margin:0 0 16px;">Usa este código para iniciar sesión:</p>
<p style="margin:0 0 16px;font-size:32px;font-weight:bold;letter-spacing:8px;color:${COLORS.blue};">${escapeHtml(input.code)}</p>
<p style="margin:0 0 16px;">Vence en ${input.minutes} minutos.</p>
<p style="margin:0;font-size:13px;color:#6b6f6f;">Si no lo pediste, ignora este correo: nadie podrá entrar a tu cuenta sin el código.</p>`,
	);

	return { subject, text, html };
}

// ---------------------------------------------------------------------------
// Libro de reclamaciones
// ---------------------------------------------------------------------------

export interface ComplaintSummary {
	code: string;
	date: string;
	claimTypeLabel: string;
	serviceLabel: string;
	fields: { label: string; value: string }[];
}

function complaintTable(summary: ComplaintSummary): string {
	const rows = summary.fields
		.map(
			(field) =>
				`<tr><td style="padding:8px 0;vertical-align:top;width:40%;color:#6b6f6f;font-size:13px;">${escapeHtml(field.label)}</td>` +
				`<td style="padding:8px 0;font-size:14px;white-space:pre-line;">${escapeHtml(field.value)}</td></tr>`,
		)
		.join('');
	return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e3e5e5;margin-top:16px;">${rows}</table>`;
}

function complaintText(summary: ComplaintSummary): string {
	return summary.fields.map((field) => `${field.label}: ${field.value}`).join('\n');
}

/** Constancia para el consumidor */
export function complaintReceiptEmail(summary: ComplaintSummary, deadlineDays: number) {
	const subject = `Constancia de tu ${summary.claimTypeLabel.toLowerCase()} · ${summary.code}`;

	const text = [
		`Registramos tu ${summary.claimTypeLabel.toLowerCase()} en el Libro de reclamaciones de ${site.legal.companyName}.`,
		'',
		`Código de seguimiento: ${summary.code}`,
		`Fecha: ${summary.date}`,
		'',
		complaintText(summary),
		'',
		`Te responderemos en un plazo máximo de ${deadlineDays} días hábiles (Ley N° 29571).`,
	].join('\n');

	const html = layout(
		subject,
		`<p style="margin:0 0 16px;">Registramos tu <strong>${escapeHtml(summary.claimTypeLabel.toLowerCase())}</strong> en el Libro de reclamaciones de ${escapeHtml(site.legal.companyName)}.</p>
<p style="margin:0 0 8px;">Código de seguimiento:</p>
<p style="margin:0 0 16px;font-size:20px;font-weight:bold;color:${COLORS.blue};word-break:break-all;">${escapeHtml(summary.code)}</p>
<p style="margin:0 0 8px;">Fecha: ${escapeHtml(summary.date)}</p>
${complaintTable(summary)}
<p style="margin:24px 0 0;">Te responderemos en un plazo máximo de ${deadlineDays} días hábiles conforme a la Ley N° 29571.</p>`,
	);

	return { subject, text, html };
}

/** Aviso interno para el equipo */
export function complaintNotificationEmail(summary: ComplaintSummary) {
	const subject = `Nueva ${summary.claimTypeLabel.toLowerCase()} · ${summary.serviceLabel} · ${summary.code}`;
	const text = [`Código: ${summary.code}`, `Fecha: ${summary.date}`, '', complaintText(summary)].join('\n');
	const html = layout(
		subject,
		`<p style="margin:0 0 8px;font-size:18px;font-weight:bold;color:${COLORS.blue};">Nueva ${escapeHtml(summary.claimTypeLabel.toLowerCase())} registrada</p>
<p style="margin:0;">Código: <strong>${escapeHtml(summary.code)}</strong><br>Fecha: ${escapeHtml(summary.date)}</p>
${complaintTable(summary)}`,
	);
	return { subject, text, html };
}
