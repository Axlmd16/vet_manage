import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SpeciesForm } from './species-form';

describe('SpeciesForm', () => {
  it('muestra el error cuando el nombre está vacío', async () => {
    const onSubmit = vi.fn();
    render(<SpeciesForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /guardar especie/i }));

    expect(screen.getByText('El nombre de la especie es obligatorio')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza un nombre compuesto solo por espacios', async () => {
    const onSubmit = vi.fn();
    render(<SpeciesForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/nombre de la especie/i), '   ');
    await userEvent.click(screen.getByRole('button', { name: /guardar especie/i }));

    expect(screen.getByText('El nombre de la especie es obligatorio')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envía el nombre y la descripción sin espacios sobrantes', async () => {
    const onSubmit = vi.fn(async () => undefined);
    render(<SpeciesForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/nombre de la especie/i), '  Canino  ');
    await userEvent.type(screen.getByLabelText(/descripción/i), '  Perros domésticos  ');
    await userEvent.click(screen.getByRole('button', { name: /guardar especie/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Canino',
      description: 'Perros domésticos',
    });
  });

  it('cancela y limpia el formulario', async () => {
    const onCancel = vi.fn();
    render(<SpeciesForm onSubmit={vi.fn()} onCancel={onCancel} />);

    const nameInput = screen.getByLabelText(/nombre de la especie/i);
    await userEvent.type(nameInput, 'Felino');
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(nameInput).toHaveValue('');
  });
});
