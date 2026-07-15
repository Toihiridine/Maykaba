import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-ocean-blue text-white flex flex-col shadow-xl">
        <div className="p-6 font-bold text-2xl tracking-wider">
          MAYKABA <span className="text-terracotta text-sm block font-normal mt-1">Admin</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a href="/admin" className="block px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 transition-all">Tableau de bord</a>
          <a href="/admin/stores" className="block px-4 py-2 rounded-2xl hover:bg-white/10 transition-all">Magasins</a>
          <a href="/admin/orders" className="block px-4 py-2 rounded-2xl hover:bg-white/10 transition-all">Commandes</a>
          <a href="/admin/users" className="block px-4 py-2 rounded-2xl hover:bg-white/10 transition-all">Utilisateurs</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow-sm flex items-center px-8">
          <h2 className="text-xl font-semibold text-gray-800">Administration</h2>
        </header>
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
