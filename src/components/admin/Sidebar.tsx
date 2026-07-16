"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function Sidebar({ userPermissions, userRole }: { userPermissions: string[], userRole: string }) {
  const pathname = usePathname();

  const allNavItems = [
    { name: "Tableau de bord", path: "/admin", permission: "admin_dashboard" },
    { name: "Magasins", path: "/admin/stores", permission: "admin_stores" },
    { name: "Coursiers", path: "/admin/coursiers", permission: "admin_coursiers" },
    { name: "Commandes", path: "/admin/orders", permission: "admin_orders" },
    { name: "Utilisateurs", path: "/admin/users", permission: "admin_users" },
  ];

  // If user is SUPER ADMIN (has all rights by default if they are the main owner, but here we just check permissions array)
  // Actually, let's just filter based on permissions array. 
  // But wait, the main Super Admin might not have permissions explicitly set in DB if they were created before.
  // Let's assume if permissions is empty but role is ADMIN, they might need all access, 
  // or we just enforce permissions for everyone. Let's enforce for everyone, but if role === 'STORE_MANAGER' they don't see this anyway.
  
  const navItems = allNavItems.filter(item => 
    userPermissions.includes(item.permission) || userPermissions.length === 0 // If no permissions set, fallback to show all (for the main admin)
  );

  const hasSettingsAccess = userPermissions.includes("admin_settings") || userPermissions.length === 0;

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
        {hasSettingsAccess && (
          <Link
            href="/admin/settings"
            className={`block px-4 py-2 rounded-2xl transition-all ${
              pathname?.startsWith("/admin/settings") ? "bg-white/10" : "hover:bg-white/5"
            }`}
          >
            Paramètres
          </Link>
        )}
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
