import { describe, expect, it } from 'vitest';
import { renderCredentialsEmail } from './credentials-email.js';

const input = {
  firstName: 'María',
  lastName: 'López',
  email: 'maria@clinica.test',
  password: 'Ab3dEfGh7jKm',
  roles: ['Veterinario', 'Gerente'],
  loginUrl: 'http://localhost:5174/login',
};

describe('renderCredentialsEmail', () => {
  it('incluye los datos de acceso en el texto y en el HTML', () => {
    const { subject, text, html } = renderCredentialsEmail(input);

    expect(subject).toBe('Su cuenta de VetManage está lista');
    for (const part of [input.email, input.password, 'Veterinario, Gerente', input.loginUrl]) {
      expect(text).toContain(part);
      expect(html).toContain(part);
    }
    expect(text).toContain('deberá cambiar esta contraseña en su primer ingreso');
    expect(html).toContain('Iniciar sesión');
  });

  it('escapa los valores dinámicos en el HTML', () => {
    const { html } = renderCredentialsEmail({ ...input, firstName: '<script>x</script>', lastName: 'O\'Brien & Co', password: 'a<b>"c' });

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;x&lt;/script&gt;');
    expect(html).toContain('O&#39;Brien &amp; Co');
    expect(html).toContain('a&lt;b&gt;&quot;c');
  });

  it('omite la fila de roles cuando no hay roles', () => {
    const { text, html } = renderCredentialsEmail({ ...input, roles: [] });

    expect(text).not.toContain('Roles:');
    expect(html).not.toContain('>Roles<');
  });

  it('no depende de imágenes externas', () => {
    expect(renderCredentialsEmail(input).html).not.toMatch(/<img/i);
  });
});
