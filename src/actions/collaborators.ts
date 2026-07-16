"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createCollaboratorAction(formData: FormData, permissions: string[]) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password || !name) {
      return { error: "Tous les champs sont requis." };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Cet email est déjà utilisé." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        permissions: permissions,
      },
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Create Collaborator Error:", error);
    return { error: "Erreur lors de la création du collaborateur." };
  }
}

export async function updateCollaboratorPermissionsAction(userId: string, permissions: string[]) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { permissions },
    });
    
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la mise à jour." };
  }
}

export async function deleteCollaboratorAction(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la suppression." };
  }
}
