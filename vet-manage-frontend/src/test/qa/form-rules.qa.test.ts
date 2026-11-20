// QA Sprint 1 · Validaciones de formularios en el frontend · nivel unitario (Vitest + jsdom).
// HU-51 (usuarios), HU-01 (clientes), HU-07 (pacientes) y HU-13 (especies).
// Los mensajes esperados son los textos de los criterios de aceptación de cada HU.
import { describe, expect, it } from 'vitest';
import { ApiError } from '../../infrastructure/api/http-client';
import * as clientRules from '../../modules/clients/form-rules';
import { isValidBirthDate, maskBirthDate, parseMeasure, validatePatientDraft as validatePetDraft, emptyPatientForm as emptyPetForm } from '../../modules/pets/schemas/patient';
import { validateSpeciesDraft } from '../../modules/pets/schemas/species';
import * as userRules from '../../modules/users/form-rules';

const user = (patch: Partial<userRules.Form> = {}): userRules.Form => ({
  identification: '1105018517', firstName: 'Pablo', lastName: 'Andrade', email: 'pablo.andrade@vetmanage.test',
  phone: '0991234567', roles: ['veterinarian'], ...patch,
});
const client = (patch: Partial<clientRules.Form> = {}): clientRules.Form => ({
  identification: '1105019994', firstName: 'Mateo', lastName: 'Cueva', email: 'mateo.cueva@correo.test',
  phone: '0987654321', address: '', ...patch,
});
const pet = (patch: Partial<typeof emptyPetForm> = {}) => ({
  ...emptyPetForm, name: 'Max', speciesId: 's1', breedId: 'b1', gender: 'MALE' as const, birthDate: '10-02-2024',
  weightKg: '20,5', heightCm: '55', reproductiveStatus: 'NOT_STERILIZED' as const, clientId: 'c1', ...patch,
});
const TODAY = new Date(2026, 10, 19);

describe('HU-51 formulario de registro de usuario', () => {
  it('CP-51-01 un formulario válido no tiene errores', () => {
    expect(userRules.validateRegistration(user())).toEqual({ errors: {}, missing: false });
  });

  it('CP-51-05 resalta el correo vacío con "Complete los campos obligatorios"', () => {
    const { errors, missing } = userRules.validateRegistration(user({ email: '' }));
    expect(missing).toBe(true);
    expect(errors.email).toBe('Complete los campos obligatorios');
  });

  it('CP-51-06 resalta la falta de roles', () => {
    expect(userRules.validateRegistration(user({ roles: [] })).errors.roles).toBe('Complete los campos obligatorios');
  });

  it.each(['11045', '110501000', '11050100011', '1105010002'])('CP-51-08/09/10 rechaza la cédula %s', (identification) => {
    expect(userRules.validateRegistration(user({ identification })).errors.identification).toBe('La cédula debe tener 10 dígitos válidos');
  });

  it('CP-51-04 acepta el teléfono vacío', () => {
    expect(userRules.validateRegistration(user({ phone: '' })).errors.phone).toBeUndefined();
  });

  it('CP-51-07 resalta la cédula cuando la API responde USER_IDENTIFICATION_TAKEN', () => {
    const error = new ApiError('Número de cédula ya registrado', 409, { code: 'USER_IDENTIFICATION_TAKEN' });
    expect(userRules.describeApiError(error).errors.identification).toBe('Número de cédula ya registrado');
  });

  it('CP-51-13 muestra advertencia cuando no se pudo enviar el correo', () => {
    const outcome = userRules.registrationOutcome({ existingPerson: false, passwordAssigned: true, credentialsSent: false });
    expect(outcome).toEqual({ type: 'warning', message: userRules.MAIL_FAILED });
  });

  it('CP-51-01 muestra "Usuario registrado correctamente" al registrar', () => {
    const outcome = userRules.registrationOutcome({ existingPerson: false, passwordAssigned: true, credentialsSent: true });
    expect(outcome.type).toBe('success');
    expect(outcome.message.startsWith('Usuario registrado correctamente')).toBe(true);
  });
});

describe('HU-01 formulario de registro de cliente', () => {
  it('CP-01-01 un formulario válido no tiene errores', () => {
    expect(clientRules.validateRegistration(client())).toEqual({ errors: {}, missing: false });
  });

  it('CP-01-01 muestra "Cliente registrado exitosamente" al registrar', () => {
    const outcome = clientRules.registrationOutcome({ existingPerson: false, passwordAssigned: true, credentialsSent: true });
    expect(outcome.message.startsWith('Cliente registrado exitosamente')).toBe(true);
  });

  it('CP-01-04 resalta los obligatorios vacíos con "Por favor, complete todos los campos obligatorios"', () => {
    const { errors, missing } = clientRules.validateRegistration(client({ identification: '', firstName: '', lastName: '', email: '' }));
    expect(missing).toBe(true);
    expect(errors.firstName).toBe('Por favor, complete todos los campos obligatorios');
  });

  it('CP-01-05 resalta el teléfono vacío (obligatorio en la HU)', () => {
    expect(clientRules.validateRegistration(client({ phone: '' })).errors.phone).toBeDefined();
  });

  it.each(['11050A0001', '110501000'])('CP-01-07/08 resalta la cédula %s con "Número de cédula no válido"', (identification) => {
    expect(clientRules.validateRegistration(client({ identification })).errors.identification).toBe('Número de cédula no válido');
  });

  it('CP-01-09 resalta el correo sin formato con el mensaje de la HU', () => {
    expect(clientRules.validateRegistration(client({ email: 'mateo.correo.test' })).errors.email)
      .toBe('Por favor, ingrese un correo y número de teléfono válido');
  });

  it.each([['con letras', '09876ABCDE'], ['de 9 dígitos', '098765432'], ['de 11 dígitos', '09876543210'], ['con prefijo inválido', '1987654321']])(
    'CP-01-10/11/12 resalta el teléfono %s',
    (_, phone) => {
      expect(clientRules.validateRegistration(client({ phone })).errors.phone).toBe('Por favor, ingrese un correo y número de teléfono válido');
    },
  );

  it('CP-01-13 acepta 0999999999 (10 dígitos con prefijo 09)', () => {
    expect(clientRules.validateRegistration(client({ phone: '0999999999' })).errors.phone).toBeUndefined();
  });

  it('CP-01-15 resalta una dirección de 256 caracteres y acepta 255', () => {
    expect(clientRules.validateRegistration(client({ address: 'x'.repeat(256) })).errors.address).toBe('Dirección no válida');
    expect(clientRules.validateRegistration(client({ address: 'x'.repeat(255) })).errors.address).toBeUndefined();
  });

  it('CP-01-01 siempre envía el rol Cliente', () => {
    expect(clientRules.buildClientInput(client()).roles).toEqual(['client']);
  });
});

describe('HU-07 formulario de registro de paciente', () => {
  it('CP-07-01 un formulario válido produce el borrador (coma decimal aceptada)', () => {
    const result = validatePetDraft(pet(), TODAY);
    expect(result.valid).toBe(true);
    expect(result.value?.weightKg).toBe(20.5);
  });

  it('CP-07-02 marca los obligatorios vacíos', () => {
    const result = validatePetDraft(pet({ name: '', weightKg: '' }), TODAY);
    expect(result.message).toBe('Por favor, complete todos los campos obligatorios');
    expect(Object.keys(result.errors ?? {})).toEqual(expect.arrayContaining(['name', 'weightKg']));
  });

  it('CP-07-03 el color es opcional', () => {
    expect(validatePetDraft(pet({ color: '' }), TODAY).value?.color).toBeUndefined();
  });

  it('CP-07-04 exige seleccionar cliente', () => {
    expect(validatePetDraft(pet({ clientId: '' }), TODAY).message).toBe('Debe seleccionar un cliente registrado');
  });

  it.each([['inexistente', '31-02-2024'], ['futura', '20-11-2026'], ['ISO', '2024-02-10']])('CP-07-07/08/09 rechaza la fecha %s', (_, birthDate) => {
    expect(validatePetDraft(pet({ birthDate }), TODAY).message).toBe('Fecha de nacimiento inválida');
  });

  it('CP-07-10 acepta la fecha de hoy (valor límite)', () => {
    expect(isValidBirthDate('19-11-2026', TODAY)).toBe(true);
  });

  it.each([['cero', '0'], ['negativa', '-5'], ['no numérica', 'abc']])('CP-07-12/13 rechaza una medida %s', (_, heightCm) => {
    expect(validatePetDraft(pet({ heightCm }), TODAY).message).toBe('El peso y la talla deben ser valores numéricos mayores que cero');
  });

  it('CP-07-14 interpreta 0,01 como medida válida mínima', () => {
    expect(parseMeasure('0,01')).toBe(0.01);
  });

  it('CP-07-09 la máscara de fecha arma DD-MM-YYYY mientras se escribe', () => {
    expect(maskBirthDate('10022024')).toBe('10-02-2024');
    expect(maskBirthDate('1002')).toBe('10-02');
  });
});

describe('HU-13 formulario de registro de especie', () => {
  it('CP-13-01 un nombre válido produce el borrador', () => {
    expect(validateSpeciesDraft({ name: ' Roedor ', description: 'Hámsters' })).toEqual({
      valid: true, value: { name: 'Roedor', description: 'Hámsters' }, error: null,
    });
  });

  it.each([[''], ['   ']])('CP-13-02/03 rechaza el nombre "%s"', (name) => {
    expect(validateSpeciesDraft({ name, description: '' }).error).toBe('El nombre de la especie es obligatorio');
  });

  it('CP-13-04 la descripción vacía es opcional', () => {
    expect(validateSpeciesDraft({ name: 'Pez', description: ' ' }).value?.description).toBeUndefined();
  });
});
