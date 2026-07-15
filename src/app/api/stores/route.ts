export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        products: {
          where: { inStock: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: stores });
  } catch (error: any) {
    console.error("Error API GET /stores:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
