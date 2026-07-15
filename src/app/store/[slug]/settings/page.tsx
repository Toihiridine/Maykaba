"use client";

import React, { useState } from "react";
import { createStripeConnectAccount } from "@/actions/stripe.actions";

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MOCK: ID du magasin (à récupérer via Auth dans la vraie app)
  const MOCK_STORE_ID = "clsx123abc456"; 
  const MOCK_STORE_EMAIL = "magasin@exemple.com";

  const handleConnectStripe = async () => {
    setLoading(true);
    setError(null);

    const returnUrl = `${window.location.origin}/store/settings?stripe_success=true`;
    const refreshUrl = `${window.location.origin}/store/settings?stripe_refresh=true`;

    const result = await createStripeConnectAccount(
      MOCK_STORE_ID,
      "store",
      MOCK_STORE_EMAIL,
      returnUrl,
      refreshUrl
    );

    if (result.success && result.url) {
      // Rediriger vers Stripe
      window.location.href = result.url;
    } else {
      setError(result.error || "Une erreur est survenue");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h3 className="text-xl font-semibold text-gray-800">Paramètres du Magasin</h3>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h4 className="text-lg font-medium text-ocean-blue mb-2">Paiements & Virements (Stripe)</h4>
        <p className="text-gray-600 mb-6 text-sm">
          Pour recevoir les paiements de vos commandes directement sur votre compte bancaire, 
          vous devez configurer vos informations financières avec notre partenaire Stripe.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleConnectStripe}
          disabled={loading}
          className="bg-ocean-blue text-white px-6 py-3 rounded-2xl font-medium hover:bg-opacity-90 transition flex items-center disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirection vers Stripe...
            </span>
          ) : (
            "Configurer mes paiements (Stripe)"
          )}
        </button>
      </div>
    </div>
  );
}
