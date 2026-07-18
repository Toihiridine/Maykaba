"use client";

import { useState } from "react";
import { updateStoreAction, toggleStoreStatusAction, deleteStoreAction } from "@/actions/admin-actions";
import { useConfirm } from "@/providers/ConfirmProvider";
import { useRouter } from "next/navigation";

export default function StoreActions({ store }: { store: any }) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggleStatus() {
    const isConfirmed = await confirm({
      title: "Confirmation",
      description: `Voulez-vous vraiment ${store.status === "ACTIVE" ? "suspendre" : "réactiver"} ce magasin ?`,
      type: "warning",
      confirmText: store.status === "ACTIVE" ? "Suspendre" : "Réactiver"
    });

    if (isConfirmed) {
      setIsLoading(true);
      await toggleStoreStatusAction(store.id);
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    const isConfirmed = await confirm({
      title: "Suppression dangereuse",
      description: "ATTENTION : Cette action va supprimer définitivement le magasin ET le compte du gérant associé. Continuer ?",
      type: "danger",
      confirmText: "Supprimer définitivement"
    });

    if (isConfirmed) {
      setIsLoading(true);
      await deleteStoreAction(store.id);
      router.push("/admin/stores");
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    await updateStoreAction(store.id, formData);
    setIsLoading(false);
    setIsEditing(false);
  }

  return (
    <>
      <div className="flex space-x-3">
        <button
          onClick={handleToggleStatus}
          disabled={isLoading}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition disabled:opacity-50"
        >
          {store.status === "ACTIVE" ? "Suspendre" : "Réactiver"}
        </button>

        {store.status === "ACTIVE" ? (
          <button
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
            className="px-4 py-2 bg-[#0F4C81] text-white rounded-xl font-medium hover:bg-[#1E3A8A] transition disabled:opacity-50"
          >
            Éditer
          </button>
        ) : (
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50"
          >
            Supprimer
          </button>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Modifier le magasin</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="hidden" name="ownerId" value={store.ownerId || ""} />
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Nom du magasin</label>
                <input required type="text" name="storeName" defaultValue={store.name} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Slug</label>
                <input required type="text" name="storeSlug" defaultValue={store.slug} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Adresse</label>
                <input type="text" name="address" defaultValue={store.address} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Numéro de téléphone</label>
                <input type="tel" name="storePhone" defaultValue={store.phone || ""} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Nom du Gérant</label>
                <input type="text" name="ownerName" defaultValue={store.owner?.name || ""} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              
              <div className="pt-4 border-t space-y-2">
                <h4 className="font-semibold text-[#0F4C81] flex items-center gap-2"><span>✨</span> Fonctionnalités Avancées</h4>
                <div className="flex items-center space-x-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <input 
                    type="checkbox" 
                    id="aiEnabled" 
                    name="aiEnabled" 
                    defaultChecked={store.aiEnabled} 
                    className="w-5 h-5 text-[#0F4C81] rounded focus:ring-[#0F4C81] border-gray-300"
                  />
                  <label htmlFor="aiEnabled" className="text-sm font-medium text-gray-800 cursor-pointer">
                    Activer la création de produits par IA (Gemini)
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl">
                  Annuler
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-[#0F4C81] text-white rounded-xl hover:bg-[#1E3A8A] disabled:opacity-50">
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
