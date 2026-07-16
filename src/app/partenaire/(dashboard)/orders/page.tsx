export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PartnerOrdersPage() {
  const session = await getServerSession();
  const userId = (session?.user as any)?.id;

  const store = await prisma.store.findFirst({
    where: { ownerId: userId },
    select: { id: true }
  });

  if (!store) redirect("/partenaire");

  const orders = await prisma.order.findMany({
    where: { storeId: store.id },
    include: {
      client: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "NEGOTIATED": return "bg-purple-100 text-purple-800";
      case "PAID_ESCROW": return "bg-blue-100 text-blue-800";
      case "PREPARING": return "bg-orange-100 text-orange-800";
      case "READY_FOR_PICKUP": return "bg-emerald-100 text-emerald-800";
      case "COMPLETED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "Nouvelle demande";
      case "NEGOTIATED": return "En négociation";
      case "PAID_ESCROW": return "Payée (En attente de prépa)";
      case "PREPARING": return "En préparation";
      case "READY_FOR_PICKUP": return "Prête pour le coursier";
      case "COMPLETED": return "Terminée";
      default: return status;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Commandes</h2>
          <p className="text-gray-500 text-sm">Gérez le flux de préparation de vos commandes.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold text-sm">N° Commande</th>
              <th className="px-6 py-4 font-bold text-sm">Date</th>
              <th className="px-6 py-4 font-bold text-sm">Client</th>
              <th className="px-6 py-4 font-bold text-sm">Montant</th>
              <th className="px-6 py-4 font-bold text-sm">Statut Actuel</th>
              <th className="px-6 py-4 font-bold text-sm text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                  Aucune commande pour le moment.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900">{order.orderNumber || "Non défini"}</span>
                    <div className="text-xs text-gray-500 mt-1">{order.items.length} article(s)</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{order.client.name}</div>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900">
                    {order.totalAmount.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/partenaire/orders/${order.id}`}
                      className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                    >
                      Détails & Action
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
