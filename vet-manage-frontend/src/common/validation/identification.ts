const COEFFICIENTS = [2, 1, 2, 1, 2, 1, 2, 1, 2];

// Cédula ecuatoriana: 10 dígitos, provincia 01-24 o 30, tercer dígito menor que 6 y verificador módulo 10.
export function isValidIdentification(value: string): boolean {
  if (!/^\d{10}$/.test(value)) return false;

  const province = Number(value.slice(0, 2));
  if ((province < 1 || province > 24) && province !== 30) return false;
  if (Number(value[2]) >= 6) return false;

  const sum = COEFFICIENTS.reduce((total, coefficient, index) => {
    const product = Number(value[index]) * coefficient;
    return total + (product > 9 ? product - 9 : product);
  }, 0);

  return (10 - (sum % 10)) % 10 === Number(value[9]);
}
