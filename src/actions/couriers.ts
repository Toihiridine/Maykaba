"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function validateCourierAction(profileId: string) {
  try {
    await prisma.courierProfile.update({
      where: { id: profileId },
      data: {
        status: "APPROVED",
        rejectionReason: null,
      },
    });

    revalidatePath("/admin/couriers");
    revalidatePath(`/admin/couriers/[id]`, "page");
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la validation du coursier." };
  }
}

export async function rejectCourierAction(profileId: string, reason: string) {
  if (!reason || reason.trim().length < 5) {
    return { error: "Veuillez fournir un motif clair (minimum 5 caractères)." };
  }

  try {
    await prisma.courierProfile.update({
      where: { id: profileId },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
      },
    });

    revalidatePath("/admin/couriers");
    revalidatePath(`/admin/couriers/[id]`, "page");
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors du refus du coursier." };
  }
}
