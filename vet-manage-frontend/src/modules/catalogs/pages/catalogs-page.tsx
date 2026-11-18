import { useState } from 'react';
import { BreedsPage } from '../../pets/pages/breeds-page';
import { SpeciesPage } from '../../pets/pages/species-page';

type CatalogTab = 'species' | 'breeds' | 'procedures';

const tabs: { id: CatalogTab; label: string }[] = [
  { id: 'species', label: 'Especies' },
  { id: 'breeds', label: 'Razas' },
  { id: 'procedures', label: 'Tipos de procedimiento' },
];

function ComingSoonCatalog({ title, description }: { title: string; description: string }) {
  return (
    <div className="catalog-card">
      <div className="empty-state">
        <strong>{title}</strong>
        <span>{description}</span>
        <span>Este catálogo estará disponible próximamente.</span>
      </div>
    </div>
  );
}

export function CatalogsPage() {
  const [activeTab, setActiveTab] = useState<CatalogTab>('species');

  return (
    <section className="inventory-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Configuración</span>
          <h2>Catálogos</h2>
          <p>Administra las especies, razas y tipos de procedimiento clínico de la clínica.</p>
        </div>
      </div>

      <div className="catalogs-tabs" role="tablist" aria-label="Catálogos">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`catalog-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`catalog-panel-${tab.id}`}
            className={activeTab === tab.id ? 'catalogs-tab catalogs-tab--active' : 'catalogs-tab'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`catalog-panel-${activeTab}`}
        aria-labelledby={`catalog-tab-${activeTab}`}
      >
        {activeTab === 'species' && <SpeciesPage />}
        {activeTab === 'breeds' && <BreedsPage />}
        {activeTab === 'procedures' && (
          <ComingSoonCatalog
            title="Tipos de procedimiento clínico"
            description="Aquí se clasificarán los procedimientos que se realizan durante la atención veterinaria."
          />
        )}
      </div>
    </section>
  );
}
