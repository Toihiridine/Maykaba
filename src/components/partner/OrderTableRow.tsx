"use client";

import { useRouter } from "next/navigation";

export default function OrderTableRow({ order, storeSlug, children }: { order: any, storeSlug: string, children: React.ReactNode }) {
  const router = useRouter();
  return (
    <tr 
      onClick={() => router.push(`/partenaire/${storeSlug}/orders/${order.id}`)}
      className="hover:bg-gray-50 transition-colors cursor-pointer"
    >
      {children}
    </tr>
  );
}
