export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export default async function AdminCollaboratorsPage() {
  const staff = await prisma.user.findMany({
    where: { 
      role: {
        in: ["ADMIN", "STORE_MANAGER"],
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium text-gray-800">Collaborateurs & Gérants</h3>
        <button className="bg-[#0F4C81] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#1E3A8A] transition text-sm">
          + Inviter un collaborateur
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4 font-medium">Nom / Email</th>
              <th className="px-6 py-4 font-medium">Rôle (Accès)</th>
              <th className="px-6 py-4 font-medium">Date de création</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-800">{user.name || "Staff"}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  {user.role === "ADMIN" && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">Super Admin</span>
                  )}
                  {user.role === "STORE_MANAGER" && (
                    <span className="px-3 py-1 bg-[#0F4C81]/10 text-[#0F4C81] text-xs font-bold rounded-full">Gérant Magasin</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
