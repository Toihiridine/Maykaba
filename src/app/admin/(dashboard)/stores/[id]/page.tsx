import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StoreDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const storeId = resolvedParams.id;

  let store: any;
  try {
    store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: true,
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });
  } catch (error) {
    // Fallback if the owner relation is broken in the database
    store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });
    if (store) {
      store.owner = null;
    }
  }

  if (!store) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/admin/stores" className="text-gray-500 hover:text-gray-800 transition">
            &larr; Retour
          </Link>
          <h3 className="text-2xl font-bold text-[#0F4C81]">Détails du Magasin</h3>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition">
            Suspendre
          </button>
          <button className="px-4 py-2 bg-[#0F4C81] text-white rounded-xl font-medium hover:bg-[#1E3A8A] transition">
            Éditer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informations Principales */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-start space-x-6">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt="Logo" className="w-24 h-24 rounded-2xl object-cover bg-gray-50 shadow-sm" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-3xl shadow-sm">
                {store.name.charAt(0)}
              </div>
            )}
            
            <div className="space-y-1 flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
              <p className="text-gray-500 font-medium">Slug: <span className="text-gray-800">/{store.slug}</span></p>
              <p className="text-gray-500 flex items-center mt-2">
                📍 {store.address}
              </p>
            </div>
          </div>

          <div className="border-t pt-6 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Date de création</h4>
              <p className="text-gray-800 font-medium">
                {new Date(store.createdAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Stripe Connect</h4>
              {store.stripeAccountId ? (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">Connecté</span>
              ) : (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg">En attente</span>
              )}
            </div>
          </div>
        </div>

        {/* Administrateur du Magasin */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Gérant (Admin)</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Nom Complet</p>
              <p className="font-medium text-gray-900">{store.owner?.name || "Gérant introuvable"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-[#0F4C81]">{store.owner?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut du compte</p>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">Actif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques Rapides */}
      <h3 className="text-xl font-bold text-gray-800 pt-4">Performances</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <p className="text-gray-500 text-sm font-medium">Produits Actifs</p>
          <p className="text-3xl font-bold text-[#F59E0B] mt-2">{store._count.products}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <p className="text-gray-500 text-sm font-medium">Commandes Totales</p>
          <p className="text-3xl font-bold text-[#10B981] mt-2">{store._count.orders}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center opacity-50">
          <p className="text-gray-500 text-sm font-medium">Chiffre d'Affaires</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">-- €</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center opacity-50">
          <p className="text-gray-500 text-sm font-medium">Paniers Abandonnés</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">--</p>
        </div>
      </div>
    </div>
  );
}
