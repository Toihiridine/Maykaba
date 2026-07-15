export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaymentIntentForOrder } from "@/services/stripe.service";



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeId, clientId, items } = body;
    // items: Array<{ productId: string, quantity: number }>

    if (!storeId || !clientId || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: "Données invalides" }, { status: 400 });
    }

    // Calculer le total (en vrai, on vérifie les prix en DB pour des raisons de sécurité)
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      totalAmount += product.price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Ajouter frais de livraison fictifs (ex: 2€)
    const deliveryFee = 2.0;
    totalAmount += deliveryFee;

    // Créer la commande en DB (Statut PENDING)
    const order = await prisma.order.create({
      data: {
        clientId,
        storeId,
        totalAmount,
        deliveryFee,
        deliveryAddress: "Adresse à déterminer", // Simulé pour l'instant
        items: {
          create: orderItemsData,
        }
      }
    });

    // Demander à Stripe un PaymentIntent pour cette commande
    const stripeResult = await createPaymentIntentForOrder(order.id, totalAmount);

    if (!stripeResult.success || !stripeResult.clientSecret) {
      return NextResponse.json({ success: false, error: "Erreur paiement Stripe" }, { status: 500 });
    }

    // Retourner le client_secret à Flutter pour qu'il affiche la Payment Sheet
    return NextResponse.json({ 
      success: true, 
      clientSecret: stripeResult.clientSecret,
      orderId: order.id,
      totalAmount: totalAmount 
    });

  } catch (error: any) {
    console.error("Error API POST /checkout:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
