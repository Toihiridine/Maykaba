export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ProductForm from "../../components/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const store = await prisma.store.findFirst({
    where: { ownerId: userId },
    select: { id: true }
  });

  if (!store) redirect("/partenaire");

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product || product.storeId !== store.id) {
    notFound();
  }

  return (
    <div className="pb-10">
      <ProductForm storeId={store.id} initialData={product} />
    </div>
  );
}
