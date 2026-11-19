import { useCallback, useEffect, useState } from 'react';
import { PawIcon, PlusIcon } from '../../../common/components/icons';
import { useToast } from '../../../common/components/toast-context';
import { useAuth } from '../../auth/auth-context';
import { PetForm } from '../components/pet-form';
import { breedApi } from '../services/breed.service';
import { petApi } from '../services/pet.service';
import { speciesApi } from '../services/species.service';
import type { RegisterPetDraft, SpeciesOption } from '../types';
import './pets.css';

export function PetsPage() {
  const { hasPermission } = useAuth();
  const { showToast } = useToast();
  const [isModalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [species, setSpecies] = useState<SpeciesOption[]>([]);
  const [speciesLoading, setSpeciesLoading] = useState(false);
  // Cambia la key del formulario para empezar vacío cada vez que se abre el modal.
  const [formKey, setFormKey] = useState(0);

  const loadSpecies = useCallback(async () => {
    setSpeciesLoading(true);
    try {
      setSpecies(await speciesApi.listActiveSpecies());
    } catch (cause) {
      setSpecies([]);
      showToast(cause instanceof Error ? cause.message : 'No se pudieron cargar las especies', 'error');
    } finally {
      setSpeciesLoading(false);
    }
  }, [showToast]);

  const loadBreeds = useCallback((speciesId: string) => breedApi.listActiveBreeds(speciesId), []);
  const searchClients = useCallback((term: string) => petApi.searchActiveClients(term), []);

  const openModal = () => {
    setFormKey((key) => key + 1);
    setModalOpen(true);
    void loadSpecies();
  };

  const closeModal = useCallback(() => {
    if (!saving) setModalOpen(false);
  }, [saving]);

  // Escape cierra el modal, salvo mientras se guarda.
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  const handleRegister = async (draft: RegisterPetDraft) => {
    setSaving(true);
    try {
      await petApi.registerPet(draft);
      showToast('Paciente registrado exitosamente', 'success');
      setModalOpen(false);
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Error al registrar el paciente', 'error');
      throw cause;
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="pets-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Pacientes</span>
          <h2>Pacientes</h2>
          <p>Gestione los pacientes de la clínica y sus dueños.</p>
        </div>
        {hasPermission('pets:create') && (
          <button type="button" className="button button--primary" onClick={openModal}>
            <PlusIcon size={16} />
            Nuevo paciente
          </button>
        )}
      </div>

      <div className="pets-placeholder">
        <span className="pets-placeholder__icon"><PawIcon size={24} /></span>
        <strong>El listado de pacientes estará disponible próximamente</strong>
        <span>Desde aquí se podrán consultar los pacientes registrados.</span>
      </div>

      {isModalOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}
        >
          <div className="modal-card pet-modal" role="dialog" aria-modal="true" aria-labelledby="pet-modal-title">
            <div className="modal-card__heading">
              <div className="pet-modal__title">
                <span className="pet-modal__icon"><PawIcon size={20} /></span>
                <div>
                  <h3 id="pet-modal-title">Datos del paciente</h3>
                  <p>El código identificador se asigna automáticamente al guardar.</p>
                </div>
              </div>
              <button type="button" className="modal-card__close" aria-label="Cerrar" onClick={closeModal} disabled={saving}>
                ×
              </button>
            </div>

            <div className="modal-card__body">
              <PetForm
                key={formKey}
                species={species}
                speciesLoading={speciesLoading}
                loadBreeds={loadBreeds}
                searchClients={searchClients}
                onSubmit={handleRegister}
                onCancel={closeModal}
                isLoading={saving}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
