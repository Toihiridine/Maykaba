"use client";

import { useState } from "react";
import { uploadMediaAction, deleteMediaAction } from "@/actions/media";

export default function MediaGallery({ initialFiles, publicUrlPrefix }: { initialFiles: any[], publicUrlPrefix: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    
    await uploadMediaAction(formData);
    setIsUploading(false);
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = async (path: string) => {
    if (confirm("Voulez-vous vraiment supprimer cette image ?")) {
      await deleteMediaAction(path);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Galerie de Médias (Logos & Images)</h3>
          <p className="text-gray-500 text-sm mt-1">Téléchargez vos images ici et copiez le lien pour l'utiliser lors de la création d'un magasin.</p>
        </div>
        <div>
          <label className={`cursor-pointer px-4 py-2 rounded-xl font-medium transition ${isUploading ? 'bg-gray-300 text-gray-600' : 'bg-[#0F4C81] text-white hover:bg-[#1E3A8A]'}`}>
            {isUploading ? "Upload en cours..." : "+ Ajouter une image"}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {initialFiles.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            Aucun média dans la galerie pour le moment.
          </div>
        ) : (
          initialFiles.map((file) => {
            const fullUrl = `${publicUrlPrefix}/${file.name}`;
            return (
              <div key={file.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm group">
                <div className="aspect-square bg-gray-50 flex justify-center items-center overflow-hidden">
                  <img src={fullUrl} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs text-gray-500 truncate" title={file.name}>{file.name}</p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleCopy(fullUrl)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${copiedUrl === fullUrl ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {copiedUrl === fullUrl ? "Copié !" : "Copier URL"}
                    </button>
                    <button 
                      onClick={() => handleDelete(file.name)}
                      className="px-2 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
