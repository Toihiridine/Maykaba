"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createStoreAction(formData: FormData) {
  try {
    const storeName = formData.get("storeName") as string;
    const storeSlug = formData.get("storeSlug") as string;
    const logoUrl = formData.get("logoUrl") as string;
    const address = formData.get("address") as string;

    const storePhone = formData.get("storePhone") as string;

    const ownerName = formData.get("ownerName") as string;
    const ownerEmail = formData.get("ownerEmail") as string;
    const ownerPassword = formData.get("ownerPassword") as string;

    if (!storeName || !storeSlug || !ownerEmail || !ownerPassword) {
      return { error: "Tous les champs obligatoires doivent être remplis." };
    }

    // Check if user already exists
    let owner = await prisma.user.findUnique({ where: { email: ownerEmail } });

    if (!owner) {
      const hashedPassword = await bcrypt.hash(ownerPassword, 10);
      owner = await prisma.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          password: hashedPassword,
          role: "STORE_MANAGER",
        },
      });
    }

    // Create the store
    const store = await prisma.store.create({
      data: {
        name: storeName,
        slug: storeSlug,
        logoUrl: logoUrl || null,
        address: address || "Adresse non définie",
        phone: storePhone || null,
        ownerId: owner.id,
      },
    });

    revalidatePath("/admin/stores");
    return { success: true, storeId: store.id };
  } catch (error: any) {
    console.error("Create Store Error:", error);
    if (error.code === "P2002") {
      return { error: "Ce slug ou cet email est déjà utilisé." };
    }
    return { error: "Une erreur interne est survenue." };
  }
}

export async function updateStoreAction(storeId: string, formData: FormData) {
  try {
    const storeName = formData.get("storeName") as string;
    const storeSlug = formData.get("storeSlug") as string;
    const address = formData.get("address") as string;
    const storePhone = formData.get("storePhone") as string;
    
    const ownerName = formData.get("ownerName") as string;
    const ownerId = formData.get("ownerId") as string;

    if (!storeName || !storeSlug) {
      return { error: "Le nom et le slug sont obligatoires." };
    }

    await prisma.store.update({
      where: { id: storeId },
      data: {
        name: storeName,
        slug: storeSlug,
        address: address || "Adresse non définie",
        phone: storePhone || null,
        aiEnabled: formData.get("aiEnabled") === "on",
      },
    });

    if (ownerId && ownerName) {
      await prisma.user.update({
        where: { id: ownerId },
        data: { name: ownerName },
      });
    }

    revalidatePath(`/admin/stores/${storeId}`);
    revalidatePath("/admin/stores");
    return { success: true };
  } catch (error: any) {
    console.error("Update Store Error:", error);
    if (error.code === "P2002") {
      return { error: "Ce slug est déjà utilisé." };
    }
    return { error: "Erreur lors de la mise à jour." };
  }
}

export async function toggleStoreStatusAction(storeId: string) {
  try {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return { error: "Magasin introuvable." };

    const newStatus = store.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    await prisma.store.update({
      where: { id: storeId },
      data: { status: newStatus },
    });

    revalidatePath(`/admin/stores/${storeId}`);
    revalidatePath("/admin/stores");
    return { success: true, status: newStatus };
  } catch (error) {
    console.error("Toggle Status Error:", error);
    return { error: "Impossible de modifier le statut." };
  }
}

export async function deleteStoreAction(storeId: string) {
  try {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return { error: "Magasin introuvable." };

    // We must delete the store first, then the owner (if they have no other stores)
    // The user requested to delete the manager's account as well.
    await prisma.store.delete({
      where: { id: storeId }
    });

    if (store.ownerId) {
      await prisma.user.delete({
        where: { id: store.ownerId }
      });
    }

    revalidatePath("/admin/stores");
    return { success: true };
  } catch (error) {
    console.error("Delete Store Error:", error);
    return { error: "Erreur lors de la suppression du magasin." };
  }
}
