export const dynamic = "force-dynamic";
import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminCouriersPage() {
  const couriers = await prisma.user.findMany({
    where: { role: "COURIER" },
    include: {
      courierProfile: true,
      _count: { select: { deliveries: true } },
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium text-gray-800">Gestion des Coursiers</h3>
        <button className="bg-[#0F4C81] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#1E3A8A] transition text-sm">
          Exporter la liste
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4 font-medium">Coursier</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Statut du compte</th>
              <th className="px-6 py-4 font-medium">Courses</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {couriers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucun coursier inscrit pour le moment.</td>
              </tr>
            ) : (
              couriers.map((courier) => (
                <tr key={courier.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {courier.courierProfile?.selfieUrl ? (
                        <img src={courier.courierProfile.selfieUrl} alt="Selfie" className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                          {courier.name?.charAt(0) || "?"}
                        </div>
                      )}
                      <div className="font-medium text-gray-800">{courier.name || "Non renseigné"}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-800">{courier.email}</div>
                    <div className="text-xs text-gray-500">{courier.phone || "Pas de téléphone"}</div>
                  </td>
                  <td className="px-6 py-4">
                    {courier.courierProfile?.status === "PENDING" && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">En attente</span>
                    )}
                    {courier.courierProfile?.status === "APPROVED" && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Actif</span>
                    )}
                    {courier.courierProfile?.status === "REJECTED" && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Refusé</span>
                    )}
                    {!courier.courierProfile && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">Incomplet</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-700">{courier._count.deliveries}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/couriers/${courier.id}`} className="text-gray-500 hover:text-[#0F4C81] text-sm font-medium transition-colors">
                      Examiner &gt;
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
