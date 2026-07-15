export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientId, storeId, items, totalAmount, deliveryAddress } = body;

    if (!clientId || !storeId || !items || !totalAmount || !deliveryAddress) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // 1. Calcul des frais de livraison (Logique simple pour l'instant : 2.50€ de base)
    const deliveryFee = 2.50; 
    // TODO: Plus tard, intégrer Google Distance Matrix API ici.

    // 2. Génération du Code PIN unique à 4 chiffres et du Numéro de commande
    const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
    const orderNumber = `CMD-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Création de la commande en base de données
    const order = await prisma.order.create({
      data: {
        clientId,
        storeId,
        status: 'PENDING',
        totalAmount,
        deliveryFee,
        deliveryAddress,
        pinCode,
        orderNumber,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      orderNumber: order.orderNumber,
      pinCode: order.pinCode // Renvoyé au client pour qu'il le donne au coursier
    });

  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
