"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function PartnerSidebar({ storeName }: { storeName?: string }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Business Intelligence", path: "/partenaire", icon: "📊" },
    { name: "Commandes", path: "/partenaire/orders", icon: "🛒" },
    { name: "Produits", path: "/partenaire/products", icon: "📦" },
    { name: "Mon Magasin", path: "/partenaire/profile", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 bg-[#1F2937] text-white flex flex-col shadow-xl">
      <div className="p-6">
        <h1 className="font-bold text-2xl tracking-wider text-[#F59E0B]">MAYKABA</h1>
        <p className="text-sm text-gray-400 mt-1 truncate">{storeName || "Espace Partenaire"}</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/partenaire" && pathname?.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                isActive
                  ? "bg-[#F59E0B] text-white font-semibold shadow-md"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          onClick={() => signOut({ callbackUrl: "/partenaire/login" })}
          className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-2xl hover:bg-white/10 transition-all text-red-400"
        >
          <span className="text-xl">🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
