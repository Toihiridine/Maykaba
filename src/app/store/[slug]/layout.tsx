import React from "react";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Store */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 font-bold text-2xl tracking-wider text-ocean-blue">
          MAYKABA <span className="text-gray-500 text-sm block font-normal mt-1">Espace Partenaire</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a href={`/store/${slug}`} className="block px-4 py-2 text-ocean-blue font-medium bg-ocean-blue/5 rounded-2xl transition-all">Tableau de bord</a>
          <a href={`/store/${slug}/products`} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-2xl transition-all">Catalogue Produits</a>
          <a href={`/store/${slug}/orders`} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-2xl transition-all">Commandes</a>
          <a href={`/store/${slug}/settings`} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-2xl transition-all">Paramètres</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow-sm flex items-center px-8 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Magasin : {slug.toUpperCase()}</h2>
        </header>
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
