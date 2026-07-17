export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PartnerProductsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const store = await prisma.store.findFirst({
    where: { ownerId: userId },
    select: { id: true }
  });

  if (!store) redirect("/partenaire");

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Catalogue de Produits</h2>
          <p className="text-gray-500 text-sm">Gérez les articles visibles sur votre boutique.</p>
        </div>
        <Link 
          href="/partenaire/products/new"
          className="px-6 py-2 bg-[#0F4C81] text-white font-semibold rounded-xl hover:bg-[#1E3A8A] transition-colors"
        >
          + Ajouter un produit
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold text-sm">Produit</th>
              <th className="px-6 py-4 font-bold text-sm">Prix</th>
              <th className="px-6 py-4 font-bold text-sm">Disponibilité</th>
              <th className="px-6 py-4 font-bold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                  Votre catalogue est vide. Ajoutez votre premier produit !
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden shrink-0">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-xs">IMG</span>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900">{product.name}</span>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs">{product.description || "Aucune description"}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900">
                    {product.price.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.inStock ? 'En stock' : 'Rupture'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/partenaire/products/${product.id}/edit`}
                      className="inline-block px-3 py-2 text-gray-600 hover:text-[#0F4C81] text-sm font-bold transition-colors"
                    >
                      Modifier
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
