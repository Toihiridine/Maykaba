export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase";
import { getSettingsAction } from "@/actions/settings";
import SettingsTabs from "./SettingsTabs";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const BUCKET_NAME = "media";
  let files: any[] = [];
  let publicUrlPrefix = "";

  try {
    const { data } = await supabaseAdmin.storage.from(BUCKET_NAME).list();
    if (data) {
      files = data.filter((file) => file.name !== ".emptyFolderPlaceholder");
    }
    
    const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl("");
    publicUrlPrefix = publicUrlData.publicUrl.replace(/\/$/, "");
  } catch (e) {
    console.error("Error fetching media from Supabase:", e);
  }

  // Fetch all global settings
  const initialSettings = await getSettingsAction([
    "maykaba_logo_url",
    "maykaba_favicon_url",
    "stripe_test_publishable_key",
    "stripe_test_secret_key",
    "stripe_prod_publishable_key",
    "stripe_prod_secret_key",
    "stripe_live_mode",
  ]);

  // Fetch collaborators
  const collaborators = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, permissions: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0F4C81]">Paramètres & Configuration</h2>
        <p className="text-gray-500">Configurez l'ensemble de votre application (Identité, Paiements, Médias, Droits).</p>
      </div>

      <SettingsTabs 
        initialFiles={files} 
        publicUrlPrefix={publicUrlPrefix} 
        initialSettings={initialSettings} 
        collaborators={collaborators}
      />
    </div>
  );
}
