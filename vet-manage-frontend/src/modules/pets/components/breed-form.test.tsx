import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BreedForm } from './breed-form';

const species = [
  { id: 'sp-1', name: 'Canino' },
  { id: 'sp-2', name: 'Felino' },
];

describe('BreedForm', () => {
  it('muestra el error cuando el nombre está vacío', async () => {
    const onSubmit = vi.fn();
    render(<BreedForm species={species} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.selectOptions(screen.getByLabelText(/especie/i), 'sp-1');
    await userEvent.click(screen.getByRole('button', { name: /guardar raza/i }));

    expect(screen.getByText('El nombre de la raza es obligatorio')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('exige seleccionar una especie', async () => {
    const onSubmit = vi.fn();
    render(<BreedForm species={species} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/nombre de la raza/i), 'Labrador');
    await userEvent.click(screen.getByRole('button', { name: /guardar raza/i }));

    expect(screen.getByText('Debes asociar la raza a una especie')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('ofrece únicamente las especies recibidas como activas', () => {
    render(<BreedForm species={species} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const options = screen.getAllByRole('option').map((option) => option.textContent);
    expect(options).toEqual(['Selecciona una especie', 'Canino', 'Felino']);
  });

  it('envía los datos normalizados y permite omitir la descripción', async () => {
    const onSubmit = vi.fn(async () => undefined);
    render(<BreedForm species={species} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/nombre de la raza/i), '  Labrador  ');
    await userEvent.selectOptions(screen.getByLabelText(/especie/i), 'sp-1');
    await userEvent.click(screen.getByRole('button', { name: /guardar raza/i }));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Labrador', speciesId: 'sp-1', description: undefined });
  });

  it('envía la descripción sin espacios sobrantes', async () => {
    const onSubmit = vi.fn(async () => undefined);
    render(<BreedForm species={species} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/nombre de la raza/i), 'Siamés');
    await userEvent.selectOptions(screen.getByLabelText(/especie/i), 'sp-2');
    await userEvent.type(screen.getByLabelText(/descripción/i), '  Pelo corto  ');
    await userEvent.click(screen.getByRole('button', { name: /guardar raza/i }));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Siamés', speciesId: 'sp-2', description: 'Pelo corto' });
  });

  it('avisa y bloquea el guardado cuando no hay especies activas', () => {
    render(<BreedForm species={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent(/no hay especies activas/i);
    expect(screen.getByRole('button', { name: /guardar raza/i })).toBeDisabled();
  });

  it('cancela sin enviar y limpia el formulario', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<BreedForm species={species} onSubmit={onSubmit} onCancel={onCancel} />);

    const nameInput = screen.getByLabelText(/nombre de la raza/i);
    await userEvent.type(nameInput, 'Labrador');
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(nameInput).toHaveValue('');
  });

  it('rechaza una descripción de más de 500 caracteres', async () => {
    const onSubmit = vi.fn();
    render(<BreedForm species={species} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/nombre de la raza/i), 'Labrador');
    await userEvent.selectOptions(screen.getByLabelText(/especie/i), 'sp-1');
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'x'.repeat(501) } });
    await userEvent.click(screen.getByRole('button', { name: /guardar raza/i }));

    expect(screen.getByText('La descripción no puede exceder los 500 caracteres')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
