export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PartnerProfileForm from "./PartnerProfileForm";

export default async function PartnerProfilePage(props: { params: Promise<{ storeSlug: string }> }) {
  const params = await props.params;
  const { storeSlug } = params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const role = (session?.user as any)?.role;

  const store = await prisma.store.findFirst({
    where: role === "ADMIN" ? { slug: storeSlug } : { ownerId: userId, slug: storeSlug }
  });

  if (!store) {
    // If no store exists, they need to create one (or contact admin)
    // Normally the admin creates the store and assigns the owner.
    return (
      <div className="max-w-3xl mx-auto text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-800">Aucun magasin associé</h2>
        <p className="text-gray-500 mt-2">Veuillez contacter l'administrateur Maykaba pour lier votre compte à un magasin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold text-[#1F2937]">Mon Magasin</h2>
        <p className="text-gray-500 text-sm">Gérez les informations publiques de votre boutique.</p>
      </div>

      <PartnerProfileForm store={store} />
    </div>
  );
}
