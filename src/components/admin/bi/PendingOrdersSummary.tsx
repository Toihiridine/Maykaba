"use client";

import { useState, useEffect } from "react";
import { getPendingOrdersForAssignmentAction } from "@/actions/bi.actions";
import Link from "next/link";

export default function PendingOrdersSummary() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPendingOrdersForAssignmentAction().then(data => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500 animate-pulse">Vérification des commandes en attente...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-200 bg-orange-50/30 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <div className="flex items-center space-x-4">
        <div className="bg-[#F59E0B] text-white w-12 h-12 flex items-center justify-center rounded-xl font-bold text-xl">
          {orders.length}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Commandes en attente de coursier</h3>
          <p className="text-sm text-gray-500">
            {orders.length === 0 
              ? "Toutes les commandes ont un coursier."
              : "Ces commandes sont payées et nécessitent d'être acceptées ou assignées."}
          </p>
        </div>
      </div>
      
      {orders.length > 0 && (
        <Link 
          href="/admin/orders"
          className="px-6 py-2 bg-[#0F4C81] text-white font-medium rounded-xl hover:bg-[#1E3A8A] transition whitespace-nowrap"
        >
          Voir et Assigner
        </Link>
      )}
    </div>
  );
}
