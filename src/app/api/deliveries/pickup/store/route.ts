export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderNumber, storeId } = body;

    if (!orderNumber || !storeId) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    if (order.storeId !== storeId) {
      return NextResponse.json({ error: 'Cette commande n\'appartient pas à ce magasin' }, { status: 403 });
    }

    if (order.storeValidatedPickup) {
      return NextResponse.json({ message: 'Vous avez déjà validé cette commande.' });
    }

    // Mise à jour de la validation magasin
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        storeValidatedPickup: true,
        // Si le coursier a déjà validé de son côté, on passe en PICKED_UP
        status: order.courierValidatedPickup ? 'PICKED_UP' : order.status
      }
    });

    // Si les deux ont validé (le coursier l'avait déjà fait), déclencher le paiement magasin
    if (updatedOrder.status === 'PICKED_UP') {
      // LOGIQUE STRIPE CONNECT POUR LE MAGASIN ICI
      // ex: await stripe.transfers.create({ amount: ... destination: store.stripeAccountId })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Validation magasin enregistrée. En attente de la validation du coursier.',
      status: updatedOrder.status
    });

  } catch (error) {
    console.error('Erreur validation magasin:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
