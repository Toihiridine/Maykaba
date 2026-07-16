const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const storeId = "cmrnf5u13000104jjqxnod2ur";
    console.log(`Fetching store: ${storeId}`);
    
    try {
      const storeWithOwner = await prisma.store.findUnique({
        where: { id: storeId },
        include: {
          owner: true,
          _count: {
            select: { products: true, orders: true }
          }
        }
      });
      console.log("Store with owner:", storeWithOwner);
    } catch (e) {
      console.error("Failed to fetch store with owner:", e.message);
    }

    const storeRaw = await prisma.store.findUnique({
      where: { id: storeId }
    });
    console.log("Raw Store:", storeRaw);

  } catch (err) {
    console.error("General error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
