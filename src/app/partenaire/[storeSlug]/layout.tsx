import React from "react";
import PartnerSidebar from "@/components/partner/Sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function PartnerLayout(props: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  try {
    const params = await props.params;
    const { storeSlug } = params;
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      redirect("/partenaire/login");
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    if (role !== "STORE_MANAGER" && role !== "ADMIN") {
      redirect("/partenaire/login"); // Redirect to login so they can log in with correct account
    }

    // Fetch the store name for the sidebar
    // For now, assuming a store manager owns 1 store. We fetch the first store they own.
    const store = await prisma.store.findFirst({
      where: role === "ADMIN" ? { slug: storeSlug } : { ownerId: userId, slug: storeSlug },
      select: { id: true, name: true }
    });

    if (!store) {
      redirect("/partenaire"); // Enforce correct store access
    }

    const waitingOrdersCount = await prisma.order.count({
      where: {
        storeId: store.id,
        status: { in: ["NEGOTIATED", "PAID_ESCROW", "PREPARING"] }
      }
    });

    return (
      <div className="min-h-screen bg-gray-50 flex">
        <PartnerSidebar storeName={store.name} storeSlug={storeSlug} waitingOrdersCount={waitingOrdersCount} />
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Header */}
          <header className="h-16 bg-white shadow-sm flex justify-between items-center px-8 shrink-0 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-700">Dashboard Partenaire</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Mode Gérant
              </span>
              <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {session.user.name ? session.user.name.charAt(0).toUpperCase() : "P"}
              </div>
            </div>
          </header>
          
          {/* Page Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-8">
            {props.children}
          </div>
        </main>
      </div>
    );
  } catch (err: any) {
    if (err.message === "NEXT_REDIRECT") {
      throw err; // Allow Next.js redirect to work
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-10">
        <div className="p-10 bg-red-50 border border-red-200 rounded-2xl w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-red-700 mb-4">CRASH DETECTED IN LAYOUT.TSX</h2>
          <pre className="whitespace-pre-wrap text-sm text-red-600 bg-white p-4 rounded border border-red-100">
            {err.stack || err.message || String(err)}
          </pre>
        </div>
      </div>
    );
  }
}
