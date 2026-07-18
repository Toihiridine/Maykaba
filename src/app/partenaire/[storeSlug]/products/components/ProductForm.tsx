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
}

export default function ProductForm({ storeId, storeSlug, initialData }: ProductFormProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const isEditing = !!initialData;
  
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [inStock, setInStock] = useState(initialData ? initialData.inStock : true);
  const [stockQuantity, setStockQuantity] = useState(initialData?.stockQuantity?.toString() || "0");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  
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
        <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
          {message}
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
