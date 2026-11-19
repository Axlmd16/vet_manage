type InventorySeedClient = {
  $transaction<T>(callback: (transaction: InventorySeedTransaction) => Promise<T>): Promise<T>;
};

type InventorySeedTransaction = {
  category: { upsert(args: { where: { name: string }; update: Record<string, unknown>; create: Record<string, unknown> }): Promise<{ id: string }> };
  marca: { upsert(args: { where: { name: string }; update: Record<string, unknown>; create: Record<string, unknown> }): Promise<{ id: string }> };
  product: { upsert(args: { where: { code: string }; update: Record<string, unknown>; create: Record<string, unknown> }): Promise<{ id: string }> };
};

export const INVENTORY_DEMO = {
  categories: [
    { name: 'Alimentos', description: 'Alimentos y nutrición para mascotas.' },
    { name: 'Medicamentos', description: 'Medicamentos y tratamientos veterinarios.' },
    { name: 'Higiene', description: 'Productos de higiene y cuidado.' },
    { name: 'Accesorios', description: 'Accesorios para cuidado y paseo.' },
    { name: 'Juguetes', description: 'Juguetes y enriquecimiento para mascotas.' },
  ],
  brands: [
    { name: 'Dog Chow', description: 'Nutrición para perros.' },
    { name: 'Royal Canin', description: 'Alimento especializado para mascotas.' },
    { name: 'Zoetis', description: 'Productos y medicamentos veterinarios.' },
    { name: "Hill's", description: 'Nutrición clínica y alimentos especializados.' },
    { name: 'Kong', description: 'Juguetes y accesorios de enriquecimiento.' },
  ],
  products: [
    {
      code: 'PR-DEMO-001', name: 'Alimento seco para perro adulto',
      description: 'Alimento balanceado para perros adultos.', unitPrice: 25.5,
      category: 'Alimentos', brand: 'Dog Chow',
    },
    {
      code: 'PR-DEMO-002', name: 'Alimento gastrointestinal felino',
      description: 'Fórmula especializada para gatos con sensibilidad digestiva.', unitPrice: 34.9,
      category: 'Alimentos', brand: 'Royal Canin',
    },
    {
      code: 'PR-DEMO-003', name: 'Antiparasitario veterinario',
      description: 'Tratamiento antiparasitario de uso veterinario.', unitPrice: 18.75,
      category: 'Medicamentos', brand: 'Zoetis',
    },
    {
      code: 'PR-DEMO-004', name: 'Shampoo dermatológico',
      description: 'Shampoo para higiene y cuidado de la piel.', unitPrice: 14.25,
      category: 'Higiene', brand: 'Zoetis',
    },
    {
      code: 'PR-DEMO-005', name: 'Alimento puppy raza mediana',
      description: 'Fórmula para cachorros de razas medianas.', unitPrice: 29.9,
      category: 'Alimentos', brand: "Hill's",
    },
    {
      code: 'PR-DEMO-006', name: 'Alimento senior para perro',
      description: 'Nutrición para perros adultos mayores.', unitPrice: 31.5,
      category: 'Alimentos', brand: 'Royal Canin',
    },
    {
      code: 'PR-DEMO-007', name: 'Vacuna múltiple canina',
      description: 'Vacuna múltiple para el calendario preventivo canino.', unitPrice: 22,
      category: 'Medicamentos', brand: 'Zoetis',
    },
    {
      code: 'PR-DEMO-008', name: 'Pipeta antipulgas para perro',
      description: 'Protección mensual contra pulgas y garrapatas.', unitPrice: 16.8,
      category: 'Medicamentos', brand: 'Zoetis',
    },
    {
      code: 'PR-DEMO-009', name: 'Arena sanitaria aglomerante',
      description: 'Arena de fácil limpieza para gatos.', unitPrice: 11.99,
      category: 'Higiene', brand: "Hill's",
    },
    {
      code: 'PR-DEMO-010', name: 'Correa retráctil mediana',
      description: 'Correa retráctil para paseos seguros.', unitPrice: 24.5,
      category: 'Accesorios', brand: 'Kong',
    },
    {
      code: 'PR-DEMO-011', name: 'Comedero de acero inoxidable',
      description: 'Comedero resistente y fácil de higienizar.', unitPrice: 12.75,
      category: 'Accesorios', brand: 'Kong',
    },
    {
      code: 'PR-DEMO-012', name: 'Juguete dispensador de alimento',
      description: 'Juguete de enriquecimiento para reducir el aburrimiento.', unitPrice: 19.95,
      category: 'Juguetes', brand: 'Kong',
    },
    {
      code: 'PR-DEMO-013', name: 'Pelota resistente para perro',
      description: 'Pelota durable para juego y entrenamiento.', unitPrice: 13.4,
      category: 'Juguetes', brand: 'Kong',
    },
  ],
} as const;

export async function seedInventory(prisma: InventorySeedClient) {
  return prisma.$transaction(async (tx) => {
    const categories = new Map<string, string>();
    for (const definition of INVENTORY_DEMO.categories) {
      const category = await tx.category.upsert({
        where: { name: definition.name },
        update: { description: definition.description, isActive: true },
        create: { ...definition, isActive: true },
      });
      categories.set(definition.name, category.id);
    }

    const brands = new Map<string, string>();
    for (const definition of INVENTORY_DEMO.brands) {
      const brand = await tx.marca.upsert({
        where: { name: definition.name },
        update: { description: definition.description, isActive: true },
        create: { ...definition, isActive: true },
      });
      brands.set(definition.name, brand.id);
    }

    for (const definition of INVENTORY_DEMO.products) {
      const categoryId = categories.get(definition.category);
      const brandId = brands.get(definition.brand);
      if (!categoryId || !brandId) throw new Error(`Referencia de seed no encontrada para ${definition.code}`);

      await tx.product.upsert({
        where: { code: definition.code },
        update: {
          name: definition.name,
          description: definition.description,
          unitPrice: definition.unitPrice,
          categoryId,
          brandId,
          isActive: true,
        },
        create: {
          code: definition.code,
          name: definition.name,
          description: definition.description,
          unitPrice: definition.unitPrice,
          categoryId,
          brandId,
          isActive: true,
        },
      });
    }

    return {
      categories: INVENTORY_DEMO.categories.length,
      brands: INVENTORY_DEMO.brands.length,
      products: INVENTORY_DEMO.products.length,
    };
  });
}
