"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

const BUCKET_NAME = "media";

// Initialize bucket if it doesn't exist
async function ensureBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const exists = buckets?.find((b) => b.name === BUCKET_NAME);
  
  if (!exists) {
    await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
      public: true, // We want the images to be publicly accessible
      allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
    });
  }
}

export async function uploadMediaAction(formData: FormData) {
  try {
    await ensureBucket();
    const file = formData.get("file") as File;
    
    if (!file) {
      return { error: "Aucun fichier fourni." };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const buffer = await file.arrayBuffer();
    
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.error(error);
      return { error: "Erreur lors de l'upload sur Supabase." };
    }

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: "Erreur interne lors de l'upload." };
  }
}

export async function deleteMediaAction(path: string) {
  try {
    const { error } = await supabaseAdmin.storage.from(BUCKET_NAME).remove([path]);
    
    if (error) {
      return { error: "Erreur lors de la suppression." };
    }
    
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    return { error: "Erreur interne." };
  }
}
