"use client";

import { useState, useEffect } from "react";
import { getPendingOrdersForAssignmentAction } from "@/actions/bi.actions";
import AssignCourierModal from "./AssignCourierModal";

export default function PendingOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getPendingOrdersForAssignmentAction();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500 animate-pulse">Recherche des commandes en attente...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-200 bg-orange-50/30">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">⚠️ Commandes à Assigner</h3>
          <p className="text-sm text-gray-500">Ces commandes sont payées et attendent qu'un coursier soit désigné.</p>
        </div>
        <span className="bg-[#F59E0B] text-white py-1 px-3 rounded-full text-xs font-bold">
          {orders.length} en attente
        </span>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500 font-medium">Toutes les commandes ont un coursier assigné.</p>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-xl border border-orange-100 shadow-sm">
              <div className="mb-3 md:mb-0">
                <p className="font-bold text-gray-900">Cmd: {order.id.slice(-6).toUpperCase()}</p>
                <p className="text-sm text-gray-600">Magasin: <span className="font-medium">{order.store.name}</span></p>
                <p className="text-sm text-gray-600">Client: {order.client.name || "N/A"}</p>
              </div>
              <div>
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
                >
                  Choisir un coursier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <AssignCourierModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          onAssigned={() => {
            setSelectedOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
