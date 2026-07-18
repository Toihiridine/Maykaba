export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import PartnerOrderActions from "./PartnerOrderActions";

export default async function PartnerOrderDetailPage(props: { params: Promise<{ id: string, storeSlug: string }> }) {
  const { id, storeSlug } = await props.params;
  const order = await prisma.order.findUnique({
    where: { id: id },
    include: {
      client: true,
      items: { include: { product: true } },
      courier: true,
    }
  });

  if (!order) notFound();

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
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/partenaire/${storeSlug}/orders`} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937] flex items-center space-x-3">
            <span>Commande {order.orderNumber || order.id.slice(-6).toUpperCase()}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Passée le {new Date(order.createdAt).toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Articles */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Articles à préparer</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-xs">IMG</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Prix unitaire: {item.price.toFixed(2)} €</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">x {item.quantity}</p>
                    <p className="text-sm font-semibold text-[#0F4C81]">{(item.price * item.quantity).toFixed(2)} €</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <span className="font-medium text-gray-600">Total de la commande</span>
              <span className="text-2xl font-black text-[#1F2937]">{order.totalAmount.toFixed(2)} €</span>
            </div>
          </div>

          {/* Client Details */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Informations Client</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 font-medium mb-1">Nom</p>
                <p className="font-semibold text-gray-900">{order.client.name}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">Téléphone</p>
                <p className="font-semibold text-gray-900">{order.client.phone || "Non renseigné"}</p>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-gray-500 font-medium mb-1">Adresse de livraison</p>
                <p className="font-semibold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">{order.deliveryAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <PartnerOrderActions 
            orderId={order.id} 
            currentStatus={order.status} 
            storeValidatedPickup={order.storeValidatedPickup} 
          />

          {/* Courier Info if any */}
          {order.courier && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Coursier Assigné</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#0F4C81] text-white rounded-full flex items-center justify-center font-bold">
                  {order.courier.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{order.courier.name}</p>
                  <p className="text-xs text-gray-500">{order.courier.phone || "Contact masqué"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
