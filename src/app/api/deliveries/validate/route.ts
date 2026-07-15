export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
// import { stripe } from '@/lib/stripe'; // Pour plus tard quand on activera Stripe Connect



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, pinCode, courierId } = body;

    if (!orderId || !pinCode || !courierId) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // 1. Récupérer la commande
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    // 2. Vérifier le PIN
    if (order.pinCode !== pinCode) {
      return NextResponse.json({ error: 'Code PIN incorrect' }, { status: 403 });
    }

    // 3. Le PIN est bon ! On met à jour la base de données.
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        courierId: courierId, // Assigner le coursier final
      },
    });

    // 4. LOGIQUE STRIPE CONNECT (Déblocage des fonds pour le COURSIER uniquement)
    /* 
      Le magasin a déjà été payé lors du statut PICKED_UP.
      Ici on ne paie que la livraison au coursier.
      
      const courierFee = order.deliveryFee * 100;

      // Transfert vers le Coursier
      await stripe.transfers.create({
        amount: courierFee,
        currency: 'eur',
        destination: 'acct_1Coursier', // Remplacer par order.courier.stripeAccountId
        transfer_group: order.id,
      });
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Livraison validée avec succès. Les fonds ont été débloqués.'
    });

  } catch (error) {
    console.error('Erreur lors de la validation du PIN:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
