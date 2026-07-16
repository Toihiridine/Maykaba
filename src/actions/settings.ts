"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveSettingsAction(settings: { key: string; value: string }[]) {
  try {
    for (const setting of settings) {
      await prisma.globalSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }
    
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error saving settings:", error);
    return { error: "Erreur lors de l'enregistrement des paramètres." };
  }
}

export async function getSettingsAction(keys: string[]) {
  try {
    const settings = await prisma.globalSetting.findMany({
      where: { key: { in: keys } },
    });
    
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {};
  }
}
