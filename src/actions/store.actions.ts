"use server";

import { prisma } from "@/lib/prisma";



export async function getStores() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        products: true,
      },
    });
    return { success: true, data: stores, error: null };
  } catch (error) {
    console.error("Error fetching stores:", error);
    return { success: false, data: null, error: "Erreur lors de la récupération des magasins" };
  }
}

export async function getStoreProducts(storeId: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        storeId,
        inStock: true,
      },
    });
    return { success: true, data: products, error: null };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, data: null, error: "Erreur lors de la récupération des produits" };
  }
}

export async function createStore(data: { name: string; address: string; ownerId: string }) {
  try {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const store = await prisma.store.create({
      data: {
        name: data.name,
        slug,
        address: data.address,
        ownerId: data.ownerId,
      },
    });
    return { success: true, data: store, error: null };
  } catch (error) {
    console.error("Error creating store:", error);
    return { success: false, data: null, error: "Erreur lors de la création du magasin" };
  }
}
