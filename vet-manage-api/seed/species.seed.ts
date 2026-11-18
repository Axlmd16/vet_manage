type SpeciesSeedClient = {
  $transaction<T>(callback: (transaction: SpeciesSeedTransaction) => Promise<T>): Promise<T>;
};

type SpeciesSeedTransaction = {
  species: {
    upsert(args: {
      where: { name: string };
      update: Record<string, unknown>;
      create: Record<string, unknown>;
    }): Promise<{ id: string }>;
  };
};

export const SPECIES_DEMO = {
  species: [
    { name: 'Canino', description: 'Perros domésticos y sus distintas razas.' },
    { name: 'Felino', description: 'Gatos domésticos y sus distintas razas.' },
    { name: 'Bovino', description: 'Ganado bovino de producción y compañía.' },
    { name: 'Equino', description: 'Caballos, yeguas y potros.' },
    { name: 'Porcino', description: 'Cerdos y ganado porcino.' },
    { name: 'Conejo', description: 'Conejos domésticos como mascotas.' },
    { name: 'Ave', description: 'Aves de compañía y corral.' },
    { name: 'Reptil', description: 'Reptiles domésticos como mascotas.' },
  ],
} as const;

export async function seedSpecies(prisma: SpeciesSeedClient) {
  return prisma.$transaction(async (tx) => {
    for (const definition of SPECIES_DEMO.species) {
      await tx.species.upsert({
        where: { name: definition.name },
        update: { description: definition.description, isActive: true },
        create: { ...definition, isActive: true },
      });
    }

    return { species: SPECIES_DEMO.species.length };
  });
}
