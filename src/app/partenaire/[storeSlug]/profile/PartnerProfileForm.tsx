"use client";

import { useState } from "react";
import { uploadProductImageAction } from "@/actions/partnerProducts"; // Reusing the same upload logic for simplicity
import { updateStoreProfileAction } from "@/actions/partnerProfile";

interface PartnerProfileFormProps {
  store: any;
}

export default function PartnerProfileForm({ store }: PartnerProfileFormProps) {
  const [name, setName] = useState(store.name || "");
  const [description, setDescription] = useState(store.description || "");
  const [address, setAddress] = useState(store.address || "");
  const [logoUrl, setLogoUrl] = useState(store.logoUrl || "");
  const [lowStockThreshold, setLowStockThreshold] = useState(store.lowStockThreshold?.toString() || "5");
  
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    
    const res = await uploadProductImageAction(formData);
    if (res.success && res.url) {
      setLogoUrl(res.url);
    } else {
      alert("Erreur lors de l'upload: " + res.error);
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const data = { 
      name, 
      description, 
      address, 
      logoUrl,
      lowStockThreshold: parseInt(lowStockThreshold) || 5
    };
    const result = await updateStoreProfileAction(store.id, data);

    if (result.error) {
      setMessage(`❌ ${result.error}`);
    } else {
      setMessage("✅ Profil mis à jour avec succès !");
      setTimeout(() => setMessage(""), 3000);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      {message && (
        <div className={`mb-6 p-3 rounded-xl text-sm font-medium ${message.startsWith('❌') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Section */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Logo du Magasin</label>
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs text-center px-2">Aucun<br/>logo</span>
              )}
            </div>
            <div>
              <label className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold transition ${isUploading ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}`}>
                {isUploading ? "Upload en cours..." : "Modifier le logo"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
              </label>
              <p className="text-xs text-gray-400 mt-2">Un logo propre rassure les clients.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nom public</label>
            <input 
              required type="text" value={name} onChange={(e)=>setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Adresse complète</label>
            <input 
              required type="text" value={address} onChange={(e)=>setAddress(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
          <textarea 
            rows={4} value={description} onChange={(e)=>setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-colors resize-none"
            placeholder="Présentez votre magasin, vos spécialités..."
          />
        </div>

        {/* Stock Management Section */}
        <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl">
          <h4 className="font-bold text-gray-800 text-sm mb-4">Gestion de Stock</h4>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Seuil d'alerte de stock faible</label>
            <input 
              required type="number" min="0" value={lowStockThreshold} onChange={(e)=>setLowStockThreshold(e.target.value)}
              className="w-full md:w-1/2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-colors bg-white"
              placeholder="Ex: 5"
            />
            <p className="text-xs text-gray-500 mt-2">
              Le tableau de bord affichera une alerte pour les produits dont le stock atteint ou descend en dessous de ce nombre.
            </p>
          </div>
        </div>

        {/* Stripe Info Box */}
        <div className="p-4 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-2xl">
          <h4 className="font-bold text-[#b47304] text-sm">Paiements via Stripe</h4>
          <p className="text-xs text-[#b47304]/80 mt-1">
            Votre compte est actuellement géré par l'administrateur. Pour modifier vos informations bancaires de virements, veuillez contacter le support Maykaba.
          </p>
        </div>

        <div className="pt-6 border-t flex justify-end">
          <button 
            type="submit" disabled={isLoading}
            className="px-6 py-3 bg-[#0F4C81] text-white font-semibold rounded-xl hover:bg-[#1E3A8A] transition-colors disabled:opacity-50"
          >
            {isLoading ? "Enregistrement..." : "Mettre à jour le profil"}
          </button>
        </div>
      </form>
    </div>
  );
}
