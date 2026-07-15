export const dynamic = "force-dynamic";
import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
        <Link href="/admin/stores/new" className="bg-[#0F4C81] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#1E3A8A] transition text-sm">
          + Nouveau Magasin
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4 font-medium">Magasin</th>
              <th className="px-6 py-4 font-medium">Gérant (Admin)</th>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {store.logoUrl ? (
                        <img src={store.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                          {store.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-800">{store.name}</div>
                        <div className="text-xs text-gray-500 font-normal">/{store.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">{store.owner.name}</div>
                    <div className="text-xs text-gray-500">{store.owner.email}</div>
                  </td>
                  <td className="px-6 py-4 text-[#F59E0B] font-semibold">{store._count.products}</td>
                  <td className="px-6 py-4 text-[#10B981] font-semibold">{store._count.orders}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/stores/${store.id}`} className="text-gray-500 hover:text-[#0F4C81] text-sm font-medium transition-colors">
                      Détails &gt;
                    </Link>
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
