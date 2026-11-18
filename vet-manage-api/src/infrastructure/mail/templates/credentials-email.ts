import { escapeHtml, renderEmailLayout } from './email-layout.js';

export type CredentialsEmailInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: string[];
  loginUrl: string;
};

export type RenderedEmail = { subject: string; text: string; html: string };

// Correo de bienvenida con la contraseña temporal de una cuenta nueva.
export function renderCredentialsEmail(input: CredentialsEmailInput): RenderedEmail {
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const roles = input.roles.join(', ');
  const subject = 'Su cuenta de VetManage está lista';

  const text = [
    `Hola ${input.firstName},`,
    '',
    'Se creó su cuenta en VetManage. Estos son sus datos de acceso:',
    '',
    `Correo de acceso: ${input.email}`,
    `Contraseña temporal: ${input.password}`,
    roles ? `Roles: ${roles}` : '',
    '',
    `Inicie sesión en: ${input.loginUrl}`,
    '',
    'Por seguridad, deberá cambiar esta contraseña en su primer ingreso. No comparta estas credenciales.',
  ].filter((line, index, lines) => line !== '' || lines[index - 1] !== '').join('\n');

  const row = (label: string, value: string) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e3eaff;font-size:12px;color:#7b88a3;width:38%;vertical-align:top;">${label}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e3eaff;font-size:14px;color:#26323d;font-weight:600;vertical-align:top;">${value}</td>
        </tr>`;

  const body = `
      <h1 style="margin:0 0 10px;font-size:22px;line-height:1.3;color:#17202a;">Hola, ${escapeHtml(input.firstName)}</h1>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#596674;">
        Se creó una cuenta para <strong>${escapeHtml(fullName)}</strong> en VetManage. Use estos datos para iniciar sesión por primera vez.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8ff;border:1px solid #dce7ff;border-radius:12px;padding:6px 20px;margin-bottom:26px;">
        ${row('Correo de acceso', escapeHtml(input.email))}
        ${row('Contraseña temporal', `<span style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',monospace;font-size:16px;letter-spacing:1px;color:#2f55c4;">${escapeHtml(input.password)}</span>`)}
        ${roles ? row('Roles', escapeHtml(roles)) : ''}
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:26px;"><tr><td style="background:#4c7dff;border-radius:10px;">
        <a href="${escapeHtml(input.loginUrl)}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Iniciar sesión</a>
      </td></tr></table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ea;border:1px solid #f5dfb8;border-radius:10px;"><tr><td style="padding:14px 16px;font-size:12px;line-height:1.6;color:#9a6420;">
        <strong>Importante:</strong> por seguridad deberá cambiar esta contraseña en su primer ingreso. No comparta estas credenciales con nadie.
      </td></tr></table>`;

  return { subject, text, html: renderEmailLayout({ title: subject, preheader: 'Sus datos de acceso a VetManage', body }) };
}
