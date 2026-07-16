export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import CourierValidationActions from "./CourierValidationActions";

export default async function CourierDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const courier = await prisma.user.findUnique({
    where: { id: params.id, role: "COURIER" },
    include: {
      courierProfile: true,
      _count: { select: { deliveries: true } },
    },
  });

  if (!courier) {
    notFound();
  }

  const profile = courier.courierProfile;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/couriers" className="text-gray-500 hover:text-gray-800 transition">
          &larr; Retour aux coursiers
        </Link>
        <h3 className="text-2xl font-bold text-[#0F4C81]">Dossier Coursier</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Infos du coursier */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex flex-col items-center space-y-3">
            {profile?.selfieUrl ? (
              <img src={profile.selfieUrl} alt="Selfie" className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-sm" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-4xl shadow-sm">
                {courier.name?.charAt(0) || "?"}
              </div>
            )}
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">{courier.name || "Non renseigné"}</h1>
              <p className="text-gray-500 font-medium">{courier.email}</p>
              <p className="text-gray-500 font-medium">{courier.phone || "Pas de téléphone"}</p>
            </div>
            
            <div className="w-full border-t pt-4 mt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Statut du dossier :</span>
                {profile?.status === "PENDING" && <span className="text-yellow-600 font-bold">En attente</span>}
                {profile?.status === "APPROVED" && <span className="text-green-600 font-bold">Validé</span>}
                {profile?.status === "REJECTED" && <span className="text-red-600 font-bold">Refusé</span>}
                {!profile && <span className="text-gray-500 font-bold">Incomplet</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Documents et Validation */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Pièce d'Identité Fournie</h3>
          
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-2 flex justify-center items-center h-64 overflow-hidden">
            {profile?.idCardUrl ? (
              <img src={profile.idCardUrl} alt="ID Card" className="max-h-full object-contain" />
            ) : (
              <p className="text-gray-400 font-medium text-sm">Aucun document fourni</p>
            )}
          </div>

          {profile?.rejectionReason && profile.status === "REJECTED" && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-800 font-medium">Motif du refus actuel :</p>
              <p className="text-sm text-red-600 mt-1">{profile.rejectionReason}</p>
            </div>
          )}

          {/* Actions de validation */}
          {profile && <CourierValidationActions profileId={profile.id} currentStatus={profile.status} />}
        </div>
      </div>
    </div>
  );
}
