import React from "react";
import { prisma } from "@/lib/prisma";



export default async function AdminDashboard() {
  // Fetch real data from the database
  const totalStores = await prisma.store.count();
  const totalUsers = await prisma.user.count();
  const totalOrders = await prisma.order.count();
  
  // Calculate total revenue from completed orders
  const completedOrders = await prisma.order.findMany({
    where: { status: "COMPLETED" }
  });
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Fetch recent orders
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { client: true, store: true }
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-medium text-gray-800 mb-4">Vue Globale (Statistiques en temps réel)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-1">Total Utilisateurs</p>
            <p className="text-3xl font-semibold text-ocean-blue">{totalUsers}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-1">Magasins Partenaires</p>
            <p className="text-3xl font-semibold text-terracotta">{totalStores}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-1">Commandes Passées</p>
            <p className="text-3xl font-semibold text-emerald-green">{totalOrders}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-1">Volume d'Affaires</p>
            <p className="text-3xl font-semibold text-gray-800">{totalRevenue.toFixed(2)} €</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-medium text-gray-800 mb-4">5 Dernières Commandes</h3>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500">Aucune commande pour le moment.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">ID Commande</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Magasin</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 font-medium text-gray-800">{order.id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4 text-gray-600">{order.client.name || order.client.email}</td>
                  <td className="px-6 py-4 text-gray-600">{order.store.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-ocean-blue">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">{order.totalAmount.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
