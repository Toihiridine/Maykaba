"use client";

import { useState } from "react";
import { uploadProductImageAction, createProductAction, updateProductAction, deleteProductAction } from "@/actions/partnerProducts";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConfirm } from "@/providers/ConfirmProvider";

interface ProductFormProps {
  storeId: string;
  storeSlug: string;
  initialData?: any; // If editing
  aiEnabled?: boolean;
}

export default function ProductForm({ storeId, storeSlug, initialData, aiEnabled }: ProductFormProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const isEditing = !!initialData;
  
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [inStock, setInStock] = useState(initialData ? initialData.inStock : true);
  const [stockQuantity, setStockQuantity] = useState(initialData?.stockQuantity?.toString() || "0");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  
  const [aiExtractText, setAiExtractText] = useState(true);
  const [aiExtractImage, setAiExtractImage] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const handleAiExtract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!aiExtractText && !aiExtractImage) {
      // Nothing selected, just return
      return;
    }
    
    setIsAiProcessing(true);
    setMessage("");
    
    const formData = new FormData();
    // Allow up to 2 files
    const maxFiles = Math.min(e.target.files.length, 2);
    for (let i = 0; i < maxFiles; i++) {
      formData.append("files", e.target.files[i]);
    }
    formData.append("extractText", aiExtractText.toString());
    formData.append("extractImage", aiExtractImage.toString());
    
    try {
      let textSuccess = false;
      let imageSuccess = false;

      // 1. Extract Text
      if (aiExtractText) {
        const resText = await fetch("/api/ai/extract-product", {
          method: "POST",
          body: formData,
        });
        const dataText = await resText.json();
        
        if (dataText.success) {
          if (dataText.name) setName(dataText.name);
          if (dataText.description) setDescription(dataText.description);
          textSuccess = true;
        } else {
          setMessage(`❌ Erreur texte: ${dataText.error}`);
        }
      }

      // 2. Remove Background (Banania/Gemini Image Ecosystem)
      if (aiExtractImage) {
        const resImage = await fetch("/api/ai/remove-background", {
          method: "POST",
          body: formData,
        });
        const dataImage = await resImage.json();

        if (dataImage.success && dataImage.url) {
          setImageUrl(dataImage.url);
          imageSuccess = true;
        } else {
          setMessage((prev) => prev + ` | ❌ Erreur image: ${dataImage.error}`);
        }
      }

      if ((aiExtractText && textSuccess) || (aiExtractImage && imageSuccess)) {
        if ((aiExtractText && !textSuccess) || (aiExtractImage && !imageSuccess)) {
          // Partial success handled by appending message
        } else {
          setMessage("✅ Traitement IA réussi !");
        }
      }
      
    } catch (error) {
      console.error("AI Processing Error:", error);
      setMessage("❌ Erreur de communication avec l'IA.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    
    const res = await uploadProductImageAction(formData);
    if (res.success && res.url) {
      setImageUrl(res.url);
    } else {
      await confirm({ 
        title: "Erreur", 
        description: "Erreur lors de l'upload: " + res.error, 
        type: "danger", 
        confirmText: "Fermer", 
        hideCancel: true 
      });
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
      price, 
      inStock, 
      stockQuantity: parseInt(stockQuantity) || 0,
      imageUrl 
    };
    
    const result = isEditing 
      ? await updateProductAction(initialData.id, data)
      : await createProductAction(storeId, data);

    if (result.error) {
      setMessage(`❌ ${result.error}`);
      setIsLoading(false);
    } else {
      router.push(`/partenaire/${storeSlug}/products`);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: "Suppression du produit",
      description: "Voulez-vous vraiment supprimer ce produit ?",
      type: "danger",
      confirmText: "Supprimer"
    });

    if (isConfirmed) {
      const res = await deleteProductAction(initialData.id);
      if (res.success) {
        router.push(`/partenaire/${storeSlug}/products`);
      } else {
        setMessage(`❌ ${res.error}`);
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{isEditing ? "Modifier le produit" : "Ajouter un nouveau produit"}</h2>
          <p className="text-gray-500 text-sm mt-1">Renseignez les détails de votre article.</p>
        </div>
        {isEditing && (
          <button onClick={handleDelete} className="text-red-500 hover:text-red-700 font-medium text-sm">
            Supprimer le produit
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-6 p-3 rounded-xl text-sm font-medium ${message.includes('❌') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {aiEnabled && !isEditing && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-[#0F4C81] flex items-center gap-2">
                <span className="text-xl">✨</span> Assistant IA Gemini
              </h3>
              <p className="text-sm text-blue-800/80 mt-1">
                L'IA peut analyser vos photos pour remplir le formulaire et détourer l'image.
              </p>
            </div>
          </div>
          
          <div className="bg-white/60 p-4 rounded-xl border border-blue-100/50 space-y-3">
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                id="aiText" 
                checked={aiExtractText}
                onChange={(e) => setAiExtractText(e.target.checked)}
                className="w-5 h-5 text-[#0F4C81] rounded focus:ring-[#0F4C81] border-gray-300"
              />
              <label htmlFor="aiText" className="text-sm font-medium text-gray-800 cursor-pointer">
                📝 Extraire le nom et la description
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                id="aiImage" 
                checked={aiExtractImage}
                onChange={(e) => setAiExtractImage(e.target.checked)}
                className="w-5 h-5 text-[#0F4C81] rounded focus:ring-[#0F4C81] border-gray-300"
              />
              <label htmlFor="aiImage" className="text-sm font-medium text-gray-800 cursor-pointer">
                ✂️ Détourer la photo (Enlever le fond)
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <label className={`cursor-pointer px-6 py-3 rounded-xl font-bold text-white transition-all shadow-sm flex items-center gap-2 ${
              isAiProcessing ? 'bg-gray-400' : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5'
            }`}>
              {isAiProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement IA en cours...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                  Prendre la photo
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                multiple 
                className="hidden" 
                onChange={handleAiExtract} 
                disabled={isAiProcessing} 
              />
            </label>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Section */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Photo du produit</label>
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs text-center px-2">Aucune<br/>image</span>
              )}
            </div>
            <div>
              <label className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold transition ${isUploading ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}`}>
                {isUploading ? "Envoi en cours..." : "Choisir une photo"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
              </label>
              <p className="text-xs text-gray-400 mt-2">Formats acceptés: JPG, PNG, WEBP.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nom du produit</label>
            <input 
              required type="text" value={name} onChange={(e)=>setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-colors"
              placeholder="Ex: Coca-Cola 1.5L"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Prix TTC (€)</label>
            <input 
              required type="number" step="0.01" value={price} onChange={(e)=>setPrice(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-colors"
              placeholder="Ex: 2.50"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Description (Optionnelle)</label>
          <textarea 
            rows={3} value={description} onChange={(e)=>setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-colors resize-none"
            placeholder="Petite description du produit..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100 h-full">
            <input 
              type="checkbox" id="inStock" checked={inStock} onChange={(e)=>setInStock(e.target.checked)}
              className="w-5 h-5 text-[#F59E0B] rounded focus:ring-[#F59E0B] border-gray-300"
            />
            <label htmlFor="inStock" className="text-sm font-medium text-gray-800 cursor-pointer">
              Produit disponible (En stock)
            </label>
          </div>
          
          {inStock && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Quantité en stock</label>
              <input 
                required type="number" min="0" value={stockQuantity} onChange={(e)=>setStockQuantity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B] transition-colors"
                placeholder="Ex: 50"
              />
            </div>
          )}
        </div>

        <div className="pt-6 border-t flex justify-end space-x-4">
          <Link href={`/partenaire/${storeSlug}/products`} className="px-6 py-3 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            Annuler
          </Link>
          <button 
            type="submit" disabled={isLoading}
            className="px-6 py-3 bg-[#0F4C81] text-white font-semibold rounded-xl hover:bg-[#1E3A8A] transition-colors disabled:opacity-50"
          >
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
