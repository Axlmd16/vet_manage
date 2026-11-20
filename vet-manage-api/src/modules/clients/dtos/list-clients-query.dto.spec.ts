import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { ListClientsQueryDto } from './list-clients-query.dto.js';

const transform = (input: Record<string, unknown>) => plainToInstance(ListClientsQueryDto, input);

const messages = (input: Record<string, unknown>) =>
  validateSync(transform(input)).flatMap((error) => Object.values(error.constraints ?? {}));

describe('ListClientsQueryDto', () => {
  it('aplica page 1 y pageSize 20 por defecto', () => {
    const dto = transform({});

    expect(dto.page).toBe(1);
    expect(dto.pageSize).toBe(20);
    expect(validateSync(dto)).toEqual([]);
  });

  it('convierte los parámetros numéricos desde query string', () => {
    const dto = transform({ page: '2', pageSize: '10', search: 'mar', status: 'INACTIVE' });

    expect(dto).toMatchObject({ page: 2, pageSize: 10, search: 'mar', status: 'INACTIVE' });
    expect(validateSync(dto)).toEqual([]);
  });

  it.each(['0', '101', 'abc'])('rechaza pageSize %s con el mensaje del rango', (pageSize) => {
    expect(messages({ pageSize })).toContain('pageSize debe estar entre 1 y 100');
  });

  it('rechaza pageSize decimal', () => {
    expect(messages({ pageSize: '1.5' }).length).toBeGreaterThan(0);
  });

  it('rechaza page menor a 1', () => {
    expect(messages({ page: '0' })).toContain('page debe ser mayor o igual a 1');
  });

  it('rechaza un status fuera del catálogo', () => {
    expect(messages({ status: 'PENDING' })).toContain('status debe ser ACTIVE, INACTIVE o DEACTIVATED');
  });
});
