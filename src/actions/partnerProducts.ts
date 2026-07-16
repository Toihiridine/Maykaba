"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

const PARTNER_BUCKET_NAME = "partner-media";

// Initialize bucket if it doesn't exist
async function ensureBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const exists = buckets?.find((b) => b.name === PARTNER_BUCKET_NAME);
  
  if (!exists) {
    await supabaseAdmin.storage.createBucket(PARTNER_BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
    });
  }
}

export async function uploadProductImageAction(formData: FormData) {
  try {
    await ensureBucket();
    const file = formData.get("file") as File;
    
    if (!file) {
      return { error: "Aucun fichier fourni." };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const buffer = await file.arrayBuffer();
    
    const { error } = await supabaseAdmin.storage
      .from(PARTNER_BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase error:", error);
      return { error: "Erreur lors de l'upload de l'image." };
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(PARTNER_BUCKET_NAME).getPublicUrl(fileName);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error("Upload error:", err);
    return { error: "Erreur interne lors de l'upload." };
  }
}

export async function createProductAction(storeId: string, data: any) {
  try {
    await prisma.product.create({
      data: {
        storeId,
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        inStock: data.inStock,
        imageUrl: data.imageUrl,
      }
    });

    revalidatePath("/partenaire/products");
    return { success: true };
  } catch (error) {
    console.error("Create Product Error:", error);
    return { error: "Impossible de créer le produit." };
  }
}

export async function updateProductAction(productId: string, data: any) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        inStock: data.inStock,
        imageUrl: data.imageUrl,
      }
    });

    revalidatePath("/partenaire/products");
    return { success: true };
  } catch (error) {
    return { error: "Impossible de mettre à jour le produit." };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    await prisma.product.delete({
      where: { id: productId }
    });
    revalidatePath("/partenaire/products");
    return { success: true };
  } catch (error) {
    return { error: "Impossible de supprimer le produit. Vérifiez qu'il n'est pas lié à une commande." };
  }
}
