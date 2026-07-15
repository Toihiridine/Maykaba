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
