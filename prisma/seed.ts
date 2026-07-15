import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du Seeding... 🌱');

  // 1. Nettoyage de la base de données existante (Optionnel, commenté par précaution)
  // await prisma.orderItem.deleteMany();
  // await prisma.order.deleteMany();
  // await prisma.product.deleteMany();
  // await prisma.store.deleteMany();
  // await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 2. Création de l'Administrateur
  const admin = await prisma.user.upsert({
    where: { email: 'admin@maykaba.com' },
    update: {},
    create: {
      email: 'admin@maykaba.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin créé:', admin.email);

  // 3. Création du Store Manager
  const storeManager = await prisma.user.upsert({
    where: { email: 'gerant@carrefour.com' },
    update: {},
    create: {
      email: 'gerant@carrefour.com',
      name: 'Gérant Carrefour',
      password: hashedPassword,
      role: 'STORE_MANAGER',
    },
  });
  console.log('✅ Store Manager créé:', storeManager.email);

  // 4. Création d'un Magasin (Store)
  const carrefour = await prisma.store.upsert({
    where: { slug: 'carrefour-mamoudzou' },
    update: {},
    create: {
      slug: 'carrefour-mamoudzou',
      name: 'Carrefour Mamoudzou',
      description: 'Supermarché principal',
      address: 'Route Nationale 1, Mamoudzou, Mayotte',
      ownerId: storeManager.id,
    },
  });
  console.log('✅ Magasin créé:', carrefour.name);

  // 5. Création de produits pour le magasin
  const product1 = await prisma.product.create({
    data: {
      name: 'Riz Parfumé 5kg',
      price: 6.5,
      storeId: carrefour.id,
    },
  });
  const product2 = await prisma.product.create({
    data: {
      name: 'Bouteille d\'eau 1.5L',
      price: 0.8,
      storeId: carrefour.id,
    },
  });
  console.log('✅ Produits créés pour', carrefour.name);

  // 6. Création d'un Client
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'Client Test',
      password: hashedPassword,
      role: 'CLIENT',
    },
  });
  console.log('✅ Client créé:', client.email);

  // 7. Création d'une commande (Order)
  const order = await prisma.order.create({
    data: {
      clientId: client.id,
      storeId: carrefour.id,
      status: 'PENDING',
      totalAmount: 7.3,
      deliveryFee: 2.0,
      deliveryAddress: 'Kaweni, Mamoudzou',
      items: {
        create: [
          { productId: product1.id, quantity: 1, price: 6.5 },
          { productId: product2.id, quantity: 1, price: 0.8 },
        ],
      },
    },
  });
  console.log('✅ Commande Test créée avec ID:', order.id);

  console.log('Fin du Seeding ! 🚀');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
