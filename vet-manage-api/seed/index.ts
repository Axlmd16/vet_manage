import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from '../src/common/security/password-hash.ts';
import { DEMO_PASSWORD, seedIdentity } from './identity.seed.ts';
import { seedInventory } from './inventory.seed.ts';
import { seedBreeds } from './breeds.seed.ts';
import { seedSpecies } from './species.seed.ts';
import { seedHu23Iva } from './modulo-3-tienda-productos/hu-23-iva.seed.ts';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required to run the seed');

const { PrismaClient } = await import(new URL('../dist/generated/prisma/client.js', import.meta.url).href);
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

try {
  const identity = await seedIdentity(prisma, { hashPassword });
  console.log(`Identity seed completado: ${identity.users} usuarios con ${identity.assignments} asignaciones de rol (contraseña: ${DEMO_PASSWORD}).`);

  const result = await seedInventory(prisma);
  console.log(`Inventory seed completado: ${result.categories} categorías, ${result.brands} marcas, ${result.products} productos.`);

  const hu23 = await seedHu23Iva(prisma);
  console.log(`HU-23 seed completado: ${hu23.categories} categorías, ${hu23.products} productos e IVA inicial configurado.`);

  const species = await seedSpecies(prisma);
  console.log(`Species seed completado: ${species.species} especies de ejemplo.`);

  const breeds = await seedBreeds(prisma);
  console.log(`Breeds seed completado: ${breeds.breeds} razas de ejemplo.`);
} finally {
  await prisma.$disconnect();
}
