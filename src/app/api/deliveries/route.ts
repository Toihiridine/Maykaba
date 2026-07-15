import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Dans une vraie application, on vérifierait le token JWT du coursier ici.
    
    // On récupère les commandes qui sont prêtes à être livrées
    // (Statut NEGOTIATED ou PAID_ESCROW selon le flux exact choisi)
    const deliveries = await prisma.order.findMany({
      where: {
        status: {
          in: ['PENDING', 'PAID_ESCROW']
        },
        // S'assurer que la commande n'a pas déjà un coursier d'assigné
        courierId: null,
      },
      include: {
        store: { select: { name: true, address: true, latitude: true, longitude: true } },
        client: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, deliveries });

  } catch (error) {
    console.error('Erreur lors de la récupération des livraisons:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
