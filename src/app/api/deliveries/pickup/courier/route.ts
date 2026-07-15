export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderNumber, courierId } = body;

    if (!orderNumber || !courierId) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { store: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    if (order.courierValidatedPickup) {
      return NextResponse.json({ message: 'Vous avez déjà validé la récupération de cette commande.' });
    }

    // Mise à jour de la validation coursier
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        courierValidatedPickup: true,
        courierId: courierId, // On assigne officiellement le coursier ici
        // Si le magasin a déjà validé, on passe en PICKED_UP
        status: order.storeValidatedPickup ? 'PICKED_UP' : order.status
      }
    });

    // Si les deux ont validé (le magasin l'avait déjà fait ou vient de le faire)
    // Alors on débloque l'argent pour le MAGASIN.
    if (updatedOrder.status === 'PICKED_UP') {
      /* LOGIQUE STRIPE CONNECT POUR PAYER LE MAGASIN 
      const storeAmount = order.totalAmount * 100;
      if (order.store.stripeAccountId) {
        await stripe.transfers.create({
          amount: storeAmount,
          currency: 'eur',
          destination: order.store.stripeAccountId,
          transfer_group: order.id,
        });
      }
      */
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Validation coursier enregistrée.',
      status: updatedOrder.status
    });

  } catch (error) {
    console.error('Erreur validation coursier:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
