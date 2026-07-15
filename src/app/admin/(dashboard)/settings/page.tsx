export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase";
import MediaGallery from "./MediaGallery";

export default async function SettingsPage() {
  const BUCKET_NAME = "media";
  let files: any[] = [];
  let publicUrlPrefix = "";

  try {
    const { data } = await supabaseAdmin.storage.from(BUCKET_NAME).list();
    if (data) {
      // Filter out hidden folders/files like .emptyFolderPlaceholder
      files = data.filter((file) => file.name !== ".emptyFolderPlaceholder");
    }
    
    const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl("");
    publicUrlPrefix = publicUrlData.publicUrl.replace(/\/$/, "");
  } catch (e) {
    console.error("Error fetching media from Supabase:", e);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Paramètres Généraux</h2>
        <p className="text-gray-500">Gérez les médias et la configuration globale de l'application.</p>
      </div>

      {/* Module Galerie de Médias */}
      <MediaGallery initialFiles={files} publicUrlPrefix={publicUrlPrefix} />

      {/* Autres paramètres (Placeholder pour l'avenir) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-50">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Configuration Stripe Connect</h3>
        <p className="text-sm text-gray-500">Ce module sera activé prochainement pour gérer les pourcentages de commission.</p>
      </div>
    </div>
  );
}
