const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const storeSlug = 'carrefour';
  const role = "STORE_MANAGER";
  
  const store = await prisma.store.findFirst({
    where: role === "ADMIN" ? { slug: storeSlug } : { slug: storeSlug },
    include: {
      orders: {
        include: { items: { include: { product: true } }, client: true },
        orderBy: { createdAt: "desc" },
      },
      products: true,
    }
  });

  if (!store) {
    console.log("No store found");
    return;
  }

  console.log("Store found:", store.name);
  console.log("Orders count:", store.orders.length);
  console.log("Products count:", store.products.length);

  try {
    const waitingOrders = store.orders.filter(o => ["NEGOTIATED", "PAID_ESCROW", "PREPARING"].includes(o.status));
    const processedOrders = store.orders.filter(o => ["READY_FOR_PICKUP", "PICKED_UP", "COMPLETED"].includes(o.status));
    const completedOrders = store.orders.filter(o => o.status === "COMPLETED");
    const abandonedCarts = store.orders.filter(o => 
      o.status === "PENDING" && 
      (new Date().getTime() - new Date(o.createdAt).getTime()) > 60 * 60 * 1000
    );
    const outOfStockProducts = store.products.filter(p => !p.inStock);
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const todayRevenue = completedOrders
      .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const productSales = {};
    store.orders.forEach(order => {
      if (order.status === "COMPLETED") {
        order.items.forEach(item => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = { name: item.product?.name || "Produit inconnu", quantity: 0, revenue: 0 };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += (item.quantity * item.price);
        });
      }
    });
    console.log("All computations passed.");
  } catch (e) {
    console.error("Error during computations:", e);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
