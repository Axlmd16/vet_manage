import { ApiException } from '../../../src/common/errors/api-exception.js';

// Devuelve la excepción con la que se rechaza la promesa; falla si se resuelve.
export async function rejection(promise: Promise<unknown>): Promise<ApiException> {
  try {
    await promise;
  } catch (error) {
    return error as ApiException;
  }
  throw new Error('Se esperaba que la operación fuera rechazada, pero se completó');
}

// Status HTTP y mensaje de una ApiException (para comparar en un solo expect).
export function describeError(error: ApiException) {
  return { status: error.statusCode, message: error.message };
}

// Cédulas válidas de la semilla QA (módulo 10, provincia 11).
export const VALID_ID = {
  a: '1105018517',
  b: '1105018889',
  c: '1105019259',
  d: '1105019622',
};
