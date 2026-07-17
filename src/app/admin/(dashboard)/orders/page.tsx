export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import OrderTableActions from "@/components/admin/bi/OrderTableActions";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      client: true,
      store: true,
      courier: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg">En attente</span>;
      case "NEGOTIATED":
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg">Négocié</span>;
      case "PAID_ESCROW":
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg">Payé (Escrow)</span>;
      case "PICKED_UP":
        return <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg">En transit</span>;
      case "COMPLETED":
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">Terminé</span>;
      case "DISPUTED":
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg">Litige</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium text-gray-800">Toutes les Commandes</h3>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4 font-medium">N° Commande</th>
              <th className="px-6 py-4 font-medium">Client</th>
              <th className="px-6 py-4 font-medium">Magasin</th>
              <th className="px-6 py-4 font-medium">Coursier</th>
              <th className="px-6 py-4 font-medium">Montant</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Aucune commande pour le moment.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{order.orderNumber || order.id.slice(-8).toUpperCase()}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">{order.client.name || "Client"}</div>
                    <div className="text-xs text-gray-500">{order.client.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[#0F4C81]">{order.store.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    {order.courier ? (
                      <div>
                        <div className="text-sm font-medium text-gray-800">{order.courier.name}</div>
                        <div className="text-xs text-gray-500">{order.courier.phone || order.courier.email}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Non assigné</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{(order.totalAmount + order.deliveryFee).toFixed(2)} €</div>
                    <div className="text-xs text-gray-500">Livraison: {order.deliveryFee.toFixed(2)} €</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end">
                      <OrderTableActions order={order} />
                    </div>
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
