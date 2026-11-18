export type CatalogItem = {
  id: string;
  name: string;
  description?: string | null;
};

export type Product = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  unitPrice: string;
  category: CatalogItem;
  brand: CatalogItem;
  createdAt: string;
};

export type ProductDraft = {
  code: string;
  name: string;
  description: string;
  unitPrice: string;
  category: { id?: string; name?: string };
  brand: { id?: string; name?: string };
};
