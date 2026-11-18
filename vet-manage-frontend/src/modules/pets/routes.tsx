import { Route } from 'react-router-dom';
import { SpeciesPage } from './pages/species-page';

export const petsRoutes = [
  <Route key="pets-species" path="pets/species" element={<SpeciesPage />} />,
  <Route key="pets-species-new" path="pets/species/new" element={<SpeciesPage />} />,
];
