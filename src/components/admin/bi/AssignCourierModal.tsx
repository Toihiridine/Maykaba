"use client";

import { useState, useEffect } from "react";
import { getCouriersPerformanceAction, assignCourierToOrderAction } from "@/actions/bi.actions";
import { useConfirm } from "@/providers/ConfirmProvider";

export default function AssignCourierModal({ order, onClose, onAssigned }: { order: any, onClose: () => void, onAssigned: () => void }) {
  const [couriers, setCouriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    getCouriersPerformanceAction().then(data => {
      setCouriers(data);
      setLoading(false);
    });
  }, []);

  const handleAssign = async (courierId: string, courierName: string) => {
    const isConfirmed = await confirm({
      title: "Assignation de la commande",
      description: `Êtes-vous sûr de vouloir assigner cette commande à ${courierName} ?`,
      type: "info",
      confirmText: "Assigner"
    });

    if (isConfirmed) {
      setAssigningId(courierId);
      const res = await assignCourierToOrderAction(order.id, courierId);
      setAssigningId(null);
      if (res.success) {
        onAssigned();
      } else {
        alert("Erreur lors de l'assignation: " + res.error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Assigner un coursier</h3>
            <p className="text-xs text-gray-500">Commande {order.id.slice(-6).toUpperCase()} - Magasin: {order.store.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-gray-500 animate-pulse py-10">Chargement des coursiers disponibles...</p>
          ) : couriers.length === 0 ? (
            <p className="text-center text-gray-500 py-10">Aucun coursier n'est inscrit sur la plateforme.</p>
          ) : (
            <div className="space-y-3">
              {couriers.map(courier => (
                <div key={courier.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-[#0F4C81] transition">
                  <div>
                    <h4 className="font-semibold text-gray-800">{courier.name}</h4>
                    <p className="text-xs text-gray-500">
                      Taux d'acceptation : <span className="font-bold text-[#10B981]">{courier.acceptRatio}%</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => handleAssign(courier.id, courier.name)}
                    disabled={assigningId === courier.id}
                    className="px-4 py-2 bg-[#0F4C81] text-white text-sm font-medium rounded-lg hover:bg-[#1E3A8A] transition disabled:opacity-50"
                  >
                    {assigningId === courier.id ? "En cours..." : "Sélectionner"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
