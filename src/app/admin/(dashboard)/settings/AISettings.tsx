"use client";

import { useState } from "react";
import { saveSettingsAction } from "@/actions/settings";
import { useConfirm } from "@/providers/ConfirmProvider";

interface AISettingsProps {
  initialSettings: Record<string, string>;
}

export default function AISettings({ initialSettings }: AISettingsProps) {
  const [apiKey, setApiKey] = useState(initialSettings["gemini_api_key"] || "");
  const [isLoading, setIsLoading] = useState(false);
  const { confirm } = useConfirm();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await saveSettingsAction([{ key: "gemini_api_key", value: apiKey }]);

    if (result.success) {
      await confirm({
        title: "Succès",
        description: "La clé API Gemini a été sauvegardée.",
        type: "info",
        confirmText: "OK",
        hideCancel: true
      });
    } else {
      await confirm({
        title: "Erreur",
        description: result.error,
        type: "danger",
        confirmText: "Fermer",
        hideCancel: true
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span>✨</span> Intelligence Artificielle (Gemini)
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Configurez votre clé API Google Gemini pour activer la création automatisée de fiches produits depuis les photos.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
          <label className="text-sm font-bold text-[#0F4C81] block mb-2">Clé API Secrète (Gemini)</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-colors"
            placeholder="AIzaSy..."
          />
          <p className="text-xs text-blue-600/70 mt-2">
            Cette clé est stockée de manière sécurisée et ne sera utilisée que par le serveur pour analyser les photos des produits.
            Vous pouvez obtenir une clé sur <a href="https://aistudio.google.com/" target="_blank" className="underline font-bold">Google AI Studio</a>.
          </p>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-[#0F4C81] text-white font-semibold rounded-xl hover:bg-[#1E3A8A] transition-colors disabled:opacity-50"
          >
            {isLoading ? "Sauvegarde..." : "Sauvegarder la clé"}
          </button>
        </div>
      </form>
    </div>
  );
}
