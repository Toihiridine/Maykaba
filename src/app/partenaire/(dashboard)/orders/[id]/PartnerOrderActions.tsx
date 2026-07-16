"use client";

import { useState } from "react";
import { updatePartnerOrderStatusAction } from "@/actions/partnerOrders";

interface PartnerOrderActionsProps {
  orderId: string;
  currentStatus: string;
}

export default function PartnerOrderActions({ orderId, currentStatus }: PartnerOrderActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleStatusUpdate = async (newStatus: string) => {
    setIsLoading(true);
    setMessage("");

    const result = await updatePartnerOrderStatusAction(orderId, newStatus);
    if (result.error) {
      setMessage(`❌ ${result.error}`);
    } else {
      setMessage("✅ Statut mis à jour avec succès.");
      setTimeout(() => setMessage(""), 3000);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
      <h3 className="text-lg font-bold text-gray-800 border-b pb-4">Actions Requises</h3>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.startsWith('❌') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        {currentStatus === "PENDING" && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Le client a passé commande. Veuillez valider la disponibilité et le prix final.</p>
            <button
              onClick={() => handleStatusUpdate("NEGOTIATED")}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-[#0F4C81] text-white font-semibold rounded-xl hover:bg-[#1E3A8A] transition-colors disabled:opacity-50"
            >
              Accepter & Valider le montant
            </button>
          </div>
        )}

        {currentStatus === "NEGOTIATED" && (
          <div className="text-center p-4 bg-yellow-50 rounded-xl text-yellow-800 text-sm font-medium">
            En attente du paiement sécurisé du client.
          </div>
        )}

        {currentStatus === "PAID_ESCROW" && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Le paiement est sécurisé. Vous pouvez préparer la commande.</p>
            <button
              onClick={() => handleStatusUpdate("PREPARING")}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-[#F59E0B] text-white font-semibold rounded-xl hover:bg-[#D97706] transition-colors disabled:opacity-50"
            >
              Démarrer la préparation
            </button>
          </div>
        )}

        {currentStatus === "PREPARING" && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Lorsque la commande est prête, informez le coursier.</p>
            <button
              onClick={() => handleStatusUpdate("READY_FOR_PICKUP")}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-[#10B981] text-white font-semibold rounded-xl hover:bg-[#059669] transition-colors disabled:opacity-50"
            >
              Commande Prête ! (Appeler un coursier)
            </button>
          </div>
        )}

        {currentStatus === "READY_FOR_PICKUP" && (
          <div className="text-center p-4 bg-emerald-50 rounded-xl text-emerald-800 text-sm font-medium">
            En attente du coursier pour le retrait.
          </div>
        )}

        {["COMPLETED", "DISPUTED"].includes(currentStatus) && (
          <div className="text-center p-4 bg-gray-100 rounded-xl text-gray-500 text-sm font-medium">
            Cette commande est clôturée.
          </div>
        )}
      </div>
    </div>
  );
}
