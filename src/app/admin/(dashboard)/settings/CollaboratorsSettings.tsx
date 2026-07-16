"use client";

import { useState } from "react";
import { createCollaboratorAction, updateCollaboratorPermissionsAction, deleteCollaboratorAction } from "@/actions/collaborators";

const AVAILABLE_PERMISSIONS = [
  { id: "admin_dashboard", label: "Tableau de Bord Principal" },
  { id: "admin_stores", label: "Gestion des Magasins" },
  { id: "admin_coursiers", label: "Validation des Coursiers" },
  { id: "admin_orders", label: "Suivi des Commandes" },
  { id: "admin_users", label: "Liste des Clients" },
  { id: "admin_settings", label: "Paramètres Globaux" },
];

export default function CollaboratorsSettings({ collaborators }: { collaborators: any[] }) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const togglePermission = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await createCollaboratorAction(formData, selectedPermissions);

    if (result.error) {
      setMessage(`❌ ${result.error}`);
    } else {
      setMessage("✅ Collaborateur créé avec succès.");
      e.currentTarget.reset();
      setSelectedPermissions([]);
      setTimeout(() => setMessage(""), 3000);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce collaborateur ?")) {
      await deleteCollaboratorAction(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Création */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Ajouter un Collaborateur</h3>
          <p className="text-gray-500 text-sm">Créez un compte pour un membre de votre équipe et assignez-lui des droits d'accès.</p>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${message.startsWith('❌') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Nom complet</label>
              <input required type="text" name="name" className="w-full px-3 py-2 border rounded-xl focus:ring-[#F59E0B] text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Adresse Email</label>
              <input required type="email" name="email" className="w-full px-3 py-2 border rounded-xl focus:ring-[#F59E0B] text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Mot de passe provisoire</label>
              <input required type="text" name="password" minLength={6} className="w-full px-3 py-2 border rounded-xl focus:ring-[#F59E0B] text-sm mt-1" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-3">Permissions & Droits d'accès</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVAILABLE_PERMISSIONS.map((perm) => (
                <label key={perm.id} className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedPermissions.includes(perm.id) ? 'border-[#0F4C81] bg-[#0F4C81]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                    className="w-4 h-4 text-[#0F4C81] rounded focus:ring-[#0F4C81]"
                  />
                  <span className="text-sm font-medium text-gray-700">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#0F4C81] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#1E3A8A] transition disabled:opacity-50"
            >
              {isLoading ? "Création..." : "Créer le compte"}
            </button>
          </div>
        </form>
      </div>

      {/* Liste des collaborateurs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Membres de l'équipe (Staff)</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4 font-medium">Collaborateur</th>
              <th className="px-6 py-4 font-medium">Droits d'accès</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {collaborators.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.permissions?.length > 0 ? (
                      user.permissions.map((p: string) => (
                        <span key={p} className="px-2 py-1 bg-blue-50 text-[#0F4C81] text-[10px] font-bold rounded-lg uppercase tracking-wider">
                          {p.replace('admin_', '')}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">Aucun droit spécifique</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                    Retirer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
