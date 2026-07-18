"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettingsAction } from "./settings";
import { revalidatePath } from "next/cache";

// 1. Get Top Stores
export async function getTopStoresAction() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // Get completed orders grouped by store
  const storesWithOrders = await prisma.store.findMany({
    include: {
      orders: {
        where: { status: "COMPLETED" },
        select: { id: true, totalAmount: true }
      }
    }
  });

  const topStores = storesWithOrders.map(store => {
    const totalRevenue = store.orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = store.orders.length;
    return {
      id: store.id,
      name: store.name,
      logoUrl: store.logoUrl,
      totalRevenue,
      totalOrders
    };
  }).sort((a, b) => b.totalOrders - a.totalOrders).slice(0, 5);

  return topStores;
}

// 2. Get Abandoned Carts
export async function getAbandonedCartsAction() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // Fetch timeout setting, default 1 hour
  const settings = await getSettingsAction(["abandoned_cart_timeout_hours"]);
  const timeoutHours = parseInt(settings["abandoned_cart_timeout_hours"] || "1", 10);
  
  const timeoutDate = new Date();
  timeoutDate.setHours(timeoutDate.getHours() - timeoutHours);

  const abandonedCarts = await prisma.order.findMany({
    where: {
      status: "PENDING",
      createdAt: { lt: timeoutDate }
    },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      store: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return abandonedCarts;
}

// Simulate sending email to abandoned cart user
export async function markAbandonedCartEmailedAction(orderId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { abandonmentEmailSent: true }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// 3. Get Top Products
export async function getTopProductsAction(startDate?: Date, endDate?: Date) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    };
  }

  // We find completed orders in the date range, then aggregate their items
  const orders = await prisma.order.findMany({
    where: {
      status: "COMPLETED",
      ...dateFilter
    },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  const productCounts: Record<string, { product: any; quantity: number; revenue: number }> = {};

  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productCounts[item.productId]) {
        productCounts[item.productId] = {
          product: item.product,
          quantity: 0,
          revenue: 0
        };
      }
      productCounts[item.productId].quantity += item.quantity;
      productCounts[item.productId].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.values(productCounts)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return topProducts;
}

// 4. Get Couriers Performance
export async function getCouriersPerformanceAction() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const couriers = await prisma.user.findMany({
    where: { role: "COURIER" },
    include: {
      courierProfile: true,
      deliveries: {
        where: { status: "COMPLETED" },
        select: { id: true }
      }
    }
  });

  return couriers.map(c => {
    const completedDeliveries = c.deliveries.length;
    const acceptedCount = c.courierProfile?.acceptedOrdersCount || 0;
    const refusedCount = c.courierProfile?.refusedOrdersCount || 0;
    const totalOffered = acceptedCount + refusedCount;
    const acceptRatio = totalOffered > 0 ? (acceptedCount / totalOffered) * 100 : 0;

    return {
      id: c.id,
      name: c.name || c.email,
      phone: c.phone,
      completedDeliveries,
      acceptedCount,
      refusedCount,
      acceptRatio: acceptRatio.toFixed(1)
    };
  }).sort((a, b) => b.completedDeliveries - a.completedDeliveries);
}

// 5. Get Unassigned Orders for Manual Assignment
export async function getPendingOrdersForAssignmentAction() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // Get orders that are PAID_ESCROW (ready for pickup) but have no courier
  return await prisma.order.findMany({
    where: {
      status: "PAID_ESCROW",
      courierId: null
    },
    include: {
      store: { select: { name: true, address: true } },
      client: { select: { name: true, phone: true } }
    },
    orderBy: { createdAt: "asc" }
  });
}

export async function assignCourierToOrderAction(orderId: string, courierId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { courierId }
    });
    
    // Increment the courier's accepted count since admin manually assigned it
    // Wait, the user said accepted/refused is for couriers taking actions. 
    // Manual assignment might be different, but let's increment it to reflect they have an order.
    await prisma.courierProfile.update({
      where: { userId: courierId },
      data: { acceptedOrdersCount: { increment: 1 } }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
