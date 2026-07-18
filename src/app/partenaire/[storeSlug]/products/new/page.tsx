export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProductForm from "../components/ProductForm";

export default async function PartnerNewProductPage(props: { params: Promise<{ storeSlug: string }> }) {
  const params = await props.params;
  const { storeSlug } = params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const role = (session?.user as any)?.role;

  const store = await prisma.store.findFirst({
    where: role === "ADMIN" ? { slug: storeSlug } : { ownerId: userId, slug: storeSlug },
    select: { id: true, aiEnabled: true }
  });

  if (!store) redirect("/partenaire");

  return (
    <div className="pb-10">
      <ProductForm storeId={store.id} storeSlug={storeSlug} aiEnabled={store.aiEnabled} />
    </div>
  );
}
