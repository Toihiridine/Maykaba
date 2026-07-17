"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePartnerOrderStatusAction(orderId: string, newStatus: string) {
  try {
    const validStatuses = ["PENDING", "NEGOTIATED", "PAID_ESCROW", "PREPARING", "READY_FOR_PICKUP", "COMPLETED", "DISPUTED"];
    if (!validStatuses.includes(newStatus)) {
      return { error: "Statut invalide." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus as any },
    });

    revalidatePath("/partenaire", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error updating order:", error);
    return { error: "Erreur lors de la mise à jour de la commande." };
  }
}
