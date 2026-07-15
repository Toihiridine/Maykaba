export const dynamic = "force-dynamic";
import React from "react";
import { prisma } from "@/lib/prisma";



export default async function AdminStoresPage() {
  const stores = await prisma.store.findMany({
    include: {
      owner: true,
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium text-gray-800">Gestion des Magasins</h3>
        <button className="bg-ocean-blue text-white px-4 py-2 rounded-xl font-medium hover:bg-opacity-90 transition">
          + Nouveau Magasin
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4 font-medium">Nom du Magasin</th>
              <th className="px-6 py-4 font-medium">Propriétaire</th>
              <th className="px-6 py-4 font-medium">Produits</th>
              <th className="px-6 py-4 font-medium">Commandes</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stores.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucun magasin trouvé.</td>
              </tr>
            ) : (
              stores.map((store) => (
                <tr key={store.id}>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {store.name}
                    <span className="block text-xs text-gray-500 font-normal">/{store.slug}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{store.owner.email}</td>
                  <td className="px-6 py-4 text-terracotta font-semibold">{store._count.products}</td>
                  <td className="px-6 py-4 text-emerald-green font-semibold">{store._count.orders}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-500 hover:text-ocean-blue text-sm font-medium">
                      Gérer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
