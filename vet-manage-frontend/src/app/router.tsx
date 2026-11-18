import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../common/layouts/app-shell';
import { DashboardPage } from '../modules/dashboard/pages/dashboard-page';
import { CatalogPage } from '../modules/inventory/pages/catalog-page';
import { ProductFormPage } from '../modules/inventory/pages/product-form-page';
import { ProductsPage } from '../modules/inventory/pages/products-page';
import { CatalogsPage } from '../modules/catalogs/pages/catalogs-page';

function ComingSoonPage() {
  return <section className="empty-page"><span className="eyebrow">Módulo en preparación</span><h2>Esta sección será implementada por el equipo</h2><p>La arquitectura y el hot reload ya están listos para comenzar.</p></section>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="pets" element={<ComingSoonPage />} />
        <Route path="catalogs" element={<CatalogsPage />} />
        <Route path="pets/species" element={<Navigate to="/catalogs" replace />} />
        <Route path="pets/species/new" element={<Navigate to="/catalogs" replace />} />
        <Route path="clients" element={<ComingSoonPage />} />
        <Route path="appointments" element={<ComingSoonPage />} />
        <Route path="inventory/products" element={<ProductsPage />} />
        <Route path="inventory/products/new" element={<ProductFormPage />} />
        <Route path="inventory/products/:id/edit" element={<ProductFormPage />} />
        <Route path="inventory/categories" element={<CatalogPage type="category" />} />
        <Route path="inventory/brands" element={<CatalogPage type="brand" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
