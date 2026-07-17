"use client";

import { useState, useEffect } from "react";
import { getCouriersPerformanceAction } from "@/actions/bi.actions";

export default function CouriersPerformance() {
  const [couriers, setCouriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCouriersPerformanceAction().then(data => {
      setCouriers(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500 animate-pulse">Chargement des performances...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4">🛵 Efficacité des Coursiers</h3>
      <p className="text-sm text-gray-500 mb-6">Classement basé sur le nombre de commandes réalisées et le taux d'acceptation.</p>
      
      {couriers.length === 0 ? (
        <p className="text-gray-500">Aucun coursier n'est enregistré pour le moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-4 py-3 font-medium">Coursier</th>
                <th className="px-4 py-3 font-medium text-center">Commandes Réalisées</th>
                <th className="px-4 py-3 font-medium text-center text-green-600">Acceptées</th>
                <th className="px-4 py-3 font-medium text-center text-red-500">Refusées</th>
                <th className="px-4 py-3 font-medium text-right">Taux d'Acceptation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {couriers.map(courier => (
                <tr key={courier.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{courier.name}</div>
                    <div className="text-xs text-gray-500">{courier.phone || "Sans téléphone"}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-gray-800">
                    {courier.completedDeliveries}
                  </td>
                  <td className="px-4 py-3 text-center text-green-600 font-medium">
                    {courier.acceptedCount}
                  </td>
                  <td className="px-4 py-3 text-center text-red-500 font-medium">
                    {courier.refusedCount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-1 rounded-lg font-bold text-xs ${
                      parseFloat(courier.acceptRatio) >= 80 ? 'bg-green-100 text-green-700' : 
                      parseFloat(courier.acceptRatio) >= 50 ? 'bg-orange-100 text-orange-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {courier.acceptRatio}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
