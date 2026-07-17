"use client";

import { useState, useEffect } from "react";
import { getAbandonedCartsAction, markAbandonedCartEmailedAction } from "@/actions/bi.actions";
import { useConfirm } from "@/providers/ConfirmProvider";

export default function AbandonedCarts() {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { confirm } = useConfirm();

  const fetchCarts = async () => {
    setLoading(true);
    const data = await getAbandonedCartsAction();
    setCarts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const handleSendEmail = async (orderId: string, clientEmail: string) => {
    const isConfirmed = await confirm({
      title: "Relance Panier Abandonné",
      description: `Voulez-vous envoyer un e-mail de relance à ${clientEmail} ?`,
      type: "warning",
      confirmText: "Envoyer l'email"
    });

    if (isConfirmed) {
      // API call to mark as sent (and in reality, trigger email)
      await markAbandonedCartEmailedAction(orderId);
      await fetchCarts(); // Refresh
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500 animate-pulse">Chargement des paniers abandonnés...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">🛒 Paniers Abandonnés</h3>
        <span className="bg-orange-100 text-[#F59E0B] py-1 px-3 rounded-full text-xs font-bold">
          {carts.length} panier(s)
        </span>
      </div>

      {carts.length === 0 ? (
        <p className="text-gray-500">Aucun panier abandonné pour le moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Magasin</th>
                <th className="px-4 py-3 font-medium text-right">Montant</th>
                <th className="px-4 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {carts.map(cart => (
                <tr key={cart.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(cart.createdAt).toLocaleString("fr-FR", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{cart.client.name || "Client"}</div>
                    <div className="text-xs text-gray-500">{cart.client.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{cart.store.name}</td>
                  <td className="px-4 py-3 font-bold text-right text-gray-900">{cart.totalAmount.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-center">
                    {cart.abandonmentEmailSent ? (
                      <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">Relancé ✅</span>
                    ) : (
                      <button 
                        onClick={() => handleSendEmail(cart.id, cart.client.email)}
                        className="text-xs font-bold text-white bg-[#F59E0B] hover:bg-[#D97706] px-3 py-1.5 rounded-lg transition"
                      >
                        Envoyer Relance
                      </button>
                    )}
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
