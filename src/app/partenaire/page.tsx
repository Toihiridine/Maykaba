import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function PartnerIndexPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/partenaire/login");
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  // Si c'est un partenaire, on cherche son magasin et on le redirige vers son dashboard
  if (role === "STORE_MANAGER" || role === "ADMIN") {
    const store = await prisma.store.findFirst({
      where: role === "ADMIN" ? {} : { ownerId: userId },
      select: { slug: true }
    });

    if (store && store.slug) {
      redirect(`/partenaire/${store.slug}`);
    } else {
      // S'il n'a pas de magasin, on le redirige vers l'accueil (ou une page d'erreur)
      redirect("/");
    }
  } else {
    // S'il n'est ni STORE_MANAGER ni ADMIN, on le redirige vers le login
    redirect("/partenaire/login");
  }
}
