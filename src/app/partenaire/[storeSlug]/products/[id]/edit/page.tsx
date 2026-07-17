export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ProductForm from "../../components/ProductForm";

export default async function PartnerEditProductPage(props: { params: Promise<{ id: string, storeSlug: string }> }) {
  const params = await props.params;
  const { id, storeSlug } = params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  const store = await prisma.store.findFirst({
    where: role === "ADMIN" ? { slug: storeSlug } : { ownerId: userId, slug: storeSlug },
    select: { id: true }
  });

  if (!store) redirect("/partenaire");

  const product = await prisma.product.findUnique({
    where: { id: id, storeId: store.id }
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="pb-10">
      <ProductForm storeId={store.id} storeSlug={storeSlug} initialData={product} />
    </div>
  );
}
