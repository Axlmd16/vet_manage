import { describe, expect, it } from 'vitest';
import { ApiError } from '../../../infrastructure/api/http-client';
import { buildSupplierInput, supplierApiErrorMessage, supplierApiFieldErrors, validateSupplierDraft } from './supplier';

describe('supplier form rules', () => {
  it('requires non-empty business name and RUC without imposing an RUC format', () => {
    expect(validateSupplierDraft({ businessName: '  ', ruc: '  ' })).toEqual({
      businessName: 'La razón social es obligatoria.',
      ruc: 'El RUC es obligatorio.',
    });
    expect(validateSupplierDraft({ businessName: 'Empresa', ruc: '00-ABC' })).toEqual({});
  });

  it('trims outer whitespace but preserves the RUC as text including zeroes', () => {
    expect(buildSupplierInput({ businessName: ' Empresa ', ruc: ' 000123 ' })).toEqual({
      businessName: 'Empresa',
      ruc: '000123',
    });
  });

  it.each([
    [400, 'Corrija los campos enviados.'],
    [403, 'No tiene permisos para realizar esta acción.'],
    [404, 'No se encontró el proveedor. Actualice el listado e inténtelo nuevamente.'],
    [409, 'El RUC ya está registrado.'],
  ])('presenta un mensaje controlado para HTTP %s', (status, message) => {
    const error = new ApiError('El RUC ya está registrado.', status);

    expect(supplierApiErrorMessage(error, 'Error')).toBe(status === 400 ? error.message : message);
  });

  it('asocia los conflictos 409 al campo RUC', () => {
    expect(supplierApiFieldErrors(new ApiError('El RUC ya está registrado.', 409))).toEqual({
      ruc: 'El RUC ya está registrado.',
    });
  });
});
