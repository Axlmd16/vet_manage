import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { seedInventory } from './inventory.seed.ts';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required to run the seed');

const { PrismaClient } = await import(new URL('../dist/generated/prisma/client.js', import.meta.url).href);
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

try {
  const result = await seedInventory(prisma);
  console.log(`Inventory seed completado: ${result.categories} categorías, ${result.brands} marcas, ${result.products} productos.`);
} finally {
  await prisma.$disconnect();
}
