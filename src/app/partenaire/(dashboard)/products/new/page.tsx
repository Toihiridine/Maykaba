export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProductForm from "../components/ProductForm";

export default async function NewProductPage() {
  const session = await getServerSession();
  const userId = (session?.user as any)?.id;

  const store = await prisma.store.findFirst({
    where: { ownerId: userId },
    select: { id: true }
  });

  if (!store) redirect("/partenaire");

  return (
    <div className="pb-10">
      <ProductForm storeId={store.id} />
    </div>
  );
}
