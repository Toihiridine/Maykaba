export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import SalesChart from "@/components/partner/SalesChart";
import Link from "next/link";

export default async function PartnerDashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  // 1. Fetch the store belonging to this manager
  const store = await prisma.store.findFirst({
    where: { ownerId: userId },
    include: {
      orders: {
        include: { items: { include: { product: true } }, client: true },
        orderBy: { createdAt: "desc" },
      },
      products: true,
    }
  });

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Aucun magasin trouvé</h2>
        <p className="text-gray-500 mt-2">Veuillez configurer votre magasin dans la section "Mon Magasin".</p>
        <Link href="/partenaire/profile" className="mt-4 px-6 py-2 bg-[#F59E0B] text-white font-semibold rounded-xl">
          Configurer mon magasin
        </Link>
      </div>
    );
  }

  // 2. Business Intelligence Aggregations
  const activeOrders = store.orders.filter(o => ["PENDING", "NEGOTIATED", "PAID_ESCROW", "PREPARING", "READY_FOR_PICKUP"].includes(o.status));
  const completedOrders = store.orders.filter(o => o.status === "COMPLETED");
  
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const todayRevenue = completedOrders
    .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Top Products Logic
  const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
  store.orders.forEach(order => {
    if (order.status === "COMPLETED") {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.product.name, quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += (item.quantity * item.price);
      });
    }
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  // Sales Chart Data Logic (Last 7 days)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("fr-FR", { weekday: 'short', day: 'numeric' });
    
    const dayTotal = completedOrders
      .filter(o => new Date(o.createdAt).toDateString() === d.toDateString())
      .reduce((sum, o) => sum + o.totalAmount, 0);
      
    chartData.push({ date: dateStr, ventes: dayTotal });
  }

  return (
    <div className="space-y-8 pb-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 font-medium text-sm">Chiffre d'Affaires (Total)</p>
          <p className="text-3xl font-black text-[#1F2937] mt-2">{totalRevenue.toFixed(2)} €</p>
          <p className="text-xs text-green-500 font-bold mt-1">Aujourd'hui: +{todayRevenue.toFixed(2)} €</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 font-medium text-sm">Commandes Actives</p>
          <p className="text-3xl font-black text-[#F59E0B] mt-2">{activeOrders.length}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Nécessitent votre attention</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 font-medium text-sm">Produits au catalogue</p>
          <p className="text-3xl font-black text-[#1F2937] mt-2">{store.products.length}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">{store.products.filter(p => !p.inStock).length} en rupture de stock</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 font-medium text-sm">Satisfaction Client</p>
          <p className="text-3xl font-black text-[#10B981] mt-2">4.8/5</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Basé sur 24 avis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Évolution des Ventes (7 derniers jours)</h3>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-1 focus:ring-[#F59E0B] outline-none">
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
            </select>
          </div>
          <SalesChart data={chartData} />
        </div>

        {/* Top Products Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Meilleures Ventes</h3>
          {topProducts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
              Pas encore de ventes terminées.
            </div>
          ) : (
            <div className="space-y-5">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center font-bold text-sm">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.quantity} unités vendues</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-[#10B981]">{p.revenue.toFixed(2)} €</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Orders Alert */}
      {activeOrders.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-[#F59E0B]/30 overflow-hidden">
          <div className="bg-[#F59E0B]/10 p-4 border-b border-[#F59E0B]/20 flex justify-between items-center">
            <h3 className="font-bold text-[#b47304] flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F59E0B]"></span>
              </span>
              Commandes nécessitant une action immédiate
            </h3>
            <Link href="/partenaire/orders" className="text-sm font-semibold text-[#b47304] hover:underline">
              Voir tout &rarr;
            </Link>
          </div>
          <div className="p-0">
            {activeOrders.slice(0, 3).map(order => (
              <div key={order.id} className="p-4 border-b last:border-0 border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{order.orderNumber || "Nouvelle Commande"}</span>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-full">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{order.items.length} article(s) • Client: {order.client.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{order.totalAmount.toFixed(2)} €</p>
                  <Link href={`/partenaire/orders/${order.id}`} className="text-xs font-semibold text-[#0F4C81] hover:underline mt-1 inline-block">
                    Traiter la commande
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
