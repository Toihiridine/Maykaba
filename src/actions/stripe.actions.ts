"use server";

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";



/**
 * Crée un compte Stripe Connect (Express) pour un Magasin ou un Coursier.
 * Retourne l'URL d'onboarding (account link) pour que l'utilisateur saisisse son RIB.
 */
export async function createStripeConnectAccount(
  entityId: string,
  entityType: "store" | "courier",
  email: string,
  returnUrl: string,
  refreshUrl: string
) {
  try {
    let stripeAccountId: string | null = null;

    // 1. Vérifier si l'entité a déjà un compte Stripe
    if (entityType === "store") {
      const store = await prisma.store.findUnique({ where: { id: entityId } });
      if (!store) throw new Error("Magasin introuvable");
      stripeAccountId = store.stripeAccountId;
    } else {
      const user = await prisma.user.findUnique({ where: { id: entityId } });
      if (!user) throw new Error("Coursier introuvable");
      stripeAccountId = user.stripeAccountId;
    }

    // 2. Si pas de compte, le créer
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: email,
        business_type: entityType === "store" ? "company" : "individual",
        capabilities: {
          transfers: { requested: true }, // Permet de recevoir des fonds (Payouts)
        },
      });

      stripeAccountId = account.id;

      // Sauvegarder l'ID dans notre base de données
      if (entityType === "store") {
        await prisma.store.update({
          where: { id: entityId },
          data: { stripeAccountId: account.id },
        });
      } else {
        await prisma.user.update({
          where: { id: entityId },
          data: { stripeAccountId: account.id },
        });
      }
    }

    // 3. Générer le lien d'onboarding (Account Link)
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl, // Si l'utilisateur quitte ou si le lien expire
      return_url: returnUrl,   // Quand l'utilisateur a fini de saisir son RIB
      type: "account_onboarding",
    });

    return { success: true, url: accountLink.url, error: null };
  } catch (error: any) {
    console.error("Erreur création compte Stripe Connect:", error);
    return { success: false, url: null, error: error.message };
  }
}

