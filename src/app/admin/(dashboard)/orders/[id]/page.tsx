import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import OrderTableActions from "@/components/admin/bi/OrderTableActions";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      store: true,
      courier: true,
      items: {
        include: { product: true }
      }
    }
  });

  if (!order) return notFound();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-bold rounded-full">En attente</span>;
      case "NEGOTIATED":
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">Négocié</span>;
      case "PAID_ESCROW":
        return <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-bold rounded-full">Payé (Escrow)</span>;
      case "PICKED_UP":
        return <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full">En transit</span>;
      case "COMPLETED":
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">Terminé</span>;
      case "DISPUTED":
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">Litige</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-bold rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/admin/orders" className="text-gray-500 hover:text-gray-800 transition">
            &larr; Retour
          </Link>
          <h3 className="text-2xl font-bold text-gray-800">Commande {order.orderNumber || order.id.slice(-8).toUpperCase()}</h3>
          {getStatusBadge(order.status)}
        </div>
        <OrderTableActions order={order} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Détails Client et Magasin */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Client</h4>
              <p className="text-lg font-semibold text-gray-900">{order.client.name || "N/A"}</p>
              <p className="text-gray-500">{order.client.email}</p>
              <p className="text-gray-500">{order.client.phone || "Téléphone non renseigné"}</p>
            </div>
            <div className="text-right">
              <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Magasin</h4>
              <p className="text-lg font-semibold text-[#0F4C81]">{order.store.name}</p>
              <p className="text-gray-500">{order.store.address}</p>
              <p className="text-gray-500">{order.store.phone || ""}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wide">Articles Commandés</h4>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-400">{item.quantity}x</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{item.price.toFixed(2)} € l'unité</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">{(item.quantity * item.price).toFixed(2)} €</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
              <p className="text-gray-500">Frais de livraison</p>
              <p className="font-medium text-gray-800">{order.deliveryFee.toFixed(2)} €</p>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <p className="text-lg font-bold text-gray-800">Total à payer</p>
              <p className="text-2xl font-bold text-[#F59E0B]">{(order.totalAmount + order.deliveryFee).toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* Détails Livraison et Coursier */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wide">Informations de Livraison</h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-medium">Adresse de livraison</p>
                <p className="text-sm font-medium text-gray-800">{order.deliveryAddress}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Distance (estimée)</p>
                <p className="text-sm font-medium text-gray-800">{order.deliveryDistance != null ? `${order.deliveryDistance} km` : "Non calculée"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Temps de livraison</p>
                <p className="text-sm font-medium text-gray-800">{order.deliveryTimeMins != null ? `${order.deliveryTimeMins} minutes` : "Non calculé"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wide">Coursier Assigné</h4>
            {order.courier ? (
              <div className="flex items-center space-x-4">
                <div className="bg-[#0F4C81] w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {order.courier.name ? order.courier.name.charAt(0).toUpperCase() : "C"}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{order.courier.name}</p>
                  <p className="text-sm text-gray-500">{order.courier.phone || order.courier.email}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-2">Aucun coursier n'est encore assigné à cette commande.</p>
                {order.status === "PAID_ESCROW" && (
                   <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                     Utilisez le bouton "Assigner" en haut pour choisir un coursier.
                   </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
