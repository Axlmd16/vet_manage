export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] as string);

type LayoutInput = {
  title: string;
  // Texto que algunos clientes muestran junto al asunto en la bandeja.
  preheader: string;
  // HTML del contenido; los valores dinámicos deben llegar ya escapados.
  body: string;
};

// Estructura común de los correos de VetManage: tablas y estilos en línea para que se vean igual en cualquier cliente.
export function renderEmailLayout({ title, preheader, body }: LayoutInput): string {
  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#26323d;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e8edf1;border-radius:16px;overflow:hidden;">
      <tr><td style="background:#4c7dff;padding:26px 32px;">
        <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">VetManage</div>
        <div style="margin-top:3px;font-size:12px;color:#dbe5ff;">Gestión veterinaria</div>
      </td></tr>
      <tr><td style="padding:32px;">${body}</td></tr>
      <tr><td style="padding:20px 32px;border-top:1px solid #eef1f4;background:#fbfcfd;font-size:11px;line-height:1.6;color:#99a4b0;">
        Este mensaje se generó automáticamente; no responda a esta dirección. Si no esperaba este correo, ignórelo o comuníquese con el administrador de su clínica.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
