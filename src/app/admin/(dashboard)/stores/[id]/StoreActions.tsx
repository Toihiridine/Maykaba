"use client";

import { useState } from "react";
import { updateStoreAction, toggleStoreStatusAction, deleteStoreAction } from "@/actions/admin-actions";
import { useRouter } from "next/navigation";

export default function StoreActions({ store }: { store: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggleStatus() {
    if (confirm(`Voulez-vous vraiment ${store.status === "ACTIVE" ? "suspendre" : "réactiver"} ce magasin ?`)) {
      setIsLoading(true);
      await toggleStoreStatusAction(store.id);
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (confirm("ATTENTION : Cette action va supprimer définitivement le magasin ET le compte du gérant associé. Continuer ?")) {
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
