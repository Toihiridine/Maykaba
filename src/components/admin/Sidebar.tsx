"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Tableau de bord", path: "/admin" },
    { name: "Magasins", path: "/admin/stores" },
    { name: "Coursiers", path: "/admin/couriers" },
    { name: "Commandes", path: "/admin/orders" },
    { name: "Utilisateurs", path: "/admin/users" },
  ];

  return (
    <aside className="w-64 bg-[#0F4C81] text-white flex flex-col shadow-xl">
      <div className="p-6 font-bold text-2xl tracking-wider">
        MAYKABA <span className="text-[#F59E0B] text-sm block font-normal mt-1">Admin</span>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/admin" && pathname?.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-4 py-2 rounded-2xl transition-all ${
                isActive ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/admin/settings"
          className={`block px-4 py-2 rounded-2xl transition-all ${
            pathname?.startsWith("/admin/settings") ? "bg-white/10" : "hover:bg-white/5"
          }`}
        >
          Paramètres
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full text-left block px-4 py-2 rounded-2xl hover:bg-white/5 transition-all text-red-300"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
