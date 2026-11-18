// Regla de formato de contraseñas: mínimo 8 caracteres con mayúscula, minúscula y número.
export const PASSWORD_PATTERN = /^(?=.*\p{Ll})(?=.*\p{Lu})(?=.*\d).{8,}$/u;

export const PASSWORD_POLICY_MESSAGE =
  'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';

export function isValidPassword(password: string): boolean {
  return PASSWORD_PATTERN.test(password);
}
