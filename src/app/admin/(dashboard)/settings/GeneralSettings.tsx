"use client";

import { useState } from "react";
import { saveSettingsAction } from "@/actions/settings";

export default function GeneralSettings({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [logoUrl, setLogoUrl] = useState(initialSettings["maykaba_logo_url"] || "");
  const [faviconUrl, setFaviconUrl] = useState(initialSettings["maykaba_favicon_url"] || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setIsLoading(true);
    setMessage("");
    
    const result = await saveSettingsAction([
      { key: "maykaba_logo_url", value: logoUrl },
      { key: "maykaba_favicon_url", value: faviconUrl },
    ]);

    if (result.error) {
      setMessage(`❌ ${result.error}`);
    } else {
      setMessage("✅ Paramètres enregistrés avec succès.");
      setTimeout(() => setMessage(""), 3000);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-800">Identité Visuelle</h3>
        <p className="text-gray-500 text-sm">Configurez le logo principal et l'icône de l'application.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Lien du Logo Principal (URL)</label>
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 border rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B]"
          />
          {logoUrl && (
            <div className="mt-2 p-2 border rounded-xl bg-gray-50 flex justify-center">
              <img src={logoUrl} alt="Logo Preview" className="h-16 object-contain" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Lien du Favicon (Petite icône)</label>
          <input
            type="text"
            value={faviconUrl}
            onChange={(e) => setFaviconUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 border rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B]"
          />
          {faviconUrl && (
            <div className="mt-2 p-2 border rounded-xl bg-gray-50 flex justify-center">
              <img src={faviconUrl} alt="Favicon Preview" className="h-8 object-contain" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4 pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-[#0F4C81] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#1E3A8A] transition disabled:opacity-50"
        >
          {isLoading ? "Enregistrement..." : "Sauvegarder"}
        </button>
        {message && <span className="text-sm font-medium text-gray-700">{message}</span>}
      </div>
    </div>
  );
}
