import { stripe } from "@/lib/stripe";

/**
 * Crée un PaymentIntent pour le paiement du client.
 * L'argent sera capturé et mis en "Escrow" sur le compte principal Maykaba.
 * Le transfert vers le magasin et le coursier se fera plus tard lors de la validation du PIN.
 */
export async function createPaymentIntentForOrder(orderId: string, amountEuro: number) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountEuro * 100), // En centimes
      currency: "eur",
      metadata: {
        orderId: orderId,
      },
      // Pas de on_behalf_of ou transfer_data ici, car on veut garder les fonds (Escrow)
      // jusqu'à ce que le PIN soit validé.
    });

    return { success: true, clientSecret: paymentIntent.client_secret, error: null };
  } catch (error: any) {
    console.error("Erreur création PaymentIntent:", error);
    return { success: false, clientSecret: null, error: error.message };
  }
}
