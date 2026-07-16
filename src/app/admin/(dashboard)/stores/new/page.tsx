"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStoreAction } from "@/actions/admin-actions";

export default function NewStorePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createStoreAction(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push("/admin/stores");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium text-gray-800">Ajouter un Nouveau Magasin</h3>
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          Retour
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations Magasin */}
          <section className="space-y-4">
            <h4 className="text-lg font-semibold text-[#0F4C81] border-b pb-2">1. Informations du Magasin</h4>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nom du magasin *</label>
                <input required type="text" name="storeName" className="w-full px-4 py-2 border rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B]" placeholder="Ex: Maykaba Supermarché" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Identifiant (Slug) *</label>
                <input required type="text" name="storeSlug" className="w-full px-4 py-2 border rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B]" placeholder="Ex: maykaba-super" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Lien du Logo (URL)</label>
              <input type="url" name="logoUrl" className="w-full px-4 py-2 border rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B]" placeholder="https://..." />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Adresse Physique</label>
              <input type="text" name="address" className="w-full px-4 py-2 border rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B]" placeholder="Ex: 12 Rue de Kawéni, Mamoudzou" />
            </div>
          </section>

          {/* Compte Administrateur du magasin */}
          <section className="space-y-4">
            <h4 className="text-lg font-semibold text-[#0F4C81] border-b pb-2">2. Compte Gérant (Admin du Magasin)</h4>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nom Complet</label>
              <input required type="text" name="ownerName" className="w-full px-4 py-2 border rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B]" placeholder="Ex: Jean Dupont" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email de connexion *</label>
                <input required type="email" name="ownerEmail" className="w-full px-4 py-2 border rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B]" placeholder="gerant@magasin.com" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Mot de passe initial *</label>
                <input required type="text" name="ownerPassword" minLength={6} className="w-full px-4 py-2 border rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B]" placeholder="Secret123!" />
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#0F4C81] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#1E3A8A] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Création en cours..." : "Créer le Magasin et le Compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
