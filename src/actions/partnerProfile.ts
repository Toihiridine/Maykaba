"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateStoreProfileAction(storeId: string, data: any) {
  try {
    await prisma.store.update({
      where: { id: storeId },
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        logoUrl: data.logoUrl,
      }
    });

    revalidatePath("/partenaire", "layout");
    return { success: true };
  } catch (error) {
    console.error("Update Store Error:", error);
    return { error: "Impossible de mettre à jour le profil du magasin." };
  }
}
