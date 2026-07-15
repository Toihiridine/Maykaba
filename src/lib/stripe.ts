import Stripe from "stripe";

// Stripe key will be provided via admin config or env later.

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key_for_build", {
  apiVersion: "2026-06-24.dahlia", // Use the latest API version or your preferred one
  appInfo: {
    name: "Maykaba",
    version: "0.1.0",
  },
});
