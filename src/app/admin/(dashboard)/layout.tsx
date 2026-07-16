import React from "react";
import Sidebar from "@/components/admin/Sidebar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  if (!session || !session.user) {
    redirect("/admin/login");
  }

  const permissions = (session.user as any).permissions || [];
  const role = (session.user as any).role;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userPermissions={permissions} userRole={role} />
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
