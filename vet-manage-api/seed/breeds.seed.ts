type BreedSeedClient = {
  $transaction<T>(callback: (transaction: BreedSeedTransaction) => Promise<T>): Promise<T>;
};

type BreedSeedTransaction = {
  species: {
    findUnique(args: { where: { name: string } }): Promise<{ id: string } | null>;
  };
  breed: {
    upsert(args: {
      where: { speciesId_name: { speciesId: string; name: string } };
      update: Record<string, unknown>;
      create: Record<string, unknown>;
    }): Promise<{ id: string }>;
  };
};

export const BREEDS_DEMO = {
  breeds: [
    { species: 'Canino', name: 'Labrador Retriever', description: 'Perro de talla grande, dócil y activo.' },
    { species: 'Canino', name: 'Pastor Alemán', description: 'Perro de trabajo, inteligente y leal.' },
    { species: 'Canino', name: 'Mestizo', description: 'Perro de raza mixta o no definida.' },
    { species: 'Felino', name: 'Siamés', description: 'Gato de pelo corto y ojos azules.' },
    { species: 'Felino', name: 'Persa', description: 'Gato de pelo largo y rostro achatado.' },
    { species: 'Felino', name: 'Mestizo', description: 'Gato de raza mixta o no definida.' },
    { species: 'Bovino', name: 'Holstein', description: 'Ganado lechero de alta producción.' },
    { species: 'Equino', name: 'Criollo', description: 'Caballo de trabajo resistente.' },
  ],
} as const;

export async function seedBreeds(prisma: BreedSeedClient) {
  return prisma.$transaction(async (tx) => {
    let count = 0;
    for (const { species: speciesName, name, description } of BREEDS_DEMO.breeds) {
      const species = await tx.species.findUnique({ where: { name: speciesName } });
      if (!species) continue;
      await tx.breed.upsert({
        where: { speciesId_name: { speciesId: species.id, name } },
        update: { description, isActive: true },
        create: { speciesId: species.id, name, description, isActive: true },
      });
      count += 1;
    }
    return { breeds: count };
  });
}
