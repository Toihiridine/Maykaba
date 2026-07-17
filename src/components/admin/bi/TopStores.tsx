"use client";

import { useState, useEffect } from "react";
import { getTopStoresAction } from "@/actions/bi.actions";

export default function TopStores() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopStoresAction().then(data => {
      setStores(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500 animate-pulse">Chargement des top magasins...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Top Magasins (Performance)</h3>
      {stores.length === 0 ? (
        <p className="text-gray-500">Aucune donnée disponible.</p>
      ) : (
        <div className="space-y-4">
          {stores.map((store, index) => (
            <div key={store.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-[#0F4C81] text-white flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{store.name}</h4>
                  <p className="text-xs text-gray-500">{store.totalOrders} commandes terminées</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#10B981]">{store.totalRevenue.toFixed(2)} €</p>
                <p className="text-xs text-gray-500">Chiffre d'Affaires</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
