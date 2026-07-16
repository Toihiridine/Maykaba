"use client";

import { useState } from "react";
import { saveSettingsAction } from "@/actions/settings";

export default function StripeSettings({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [testPublishableKey, setTestPublishableKey] = useState(initialSettings["stripe_test_publishable_key"] || "");
  const [testSecretKey, setTestSecretKey] = useState(initialSettings["stripe_test_secret_key"] || "");
  
  const [prodPublishableKey, setProdPublishableKey] = useState(initialSettings["stripe_prod_publishable_key"] || "");
  const [prodSecretKey, setProdSecretKey] = useState(initialSettings["stripe_prod_secret_key"] || "");

  const [isLiveMode, setIsLiveMode] = useState(initialSettings["stripe_live_mode"] === "true");
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setIsLoading(true);
    setMessage("");
    
    const result = await saveSettingsAction([
      { key: "stripe_test_publishable_key", value: testPublishableKey },
      { key: "stripe_test_secret_key", value: testSecretKey },
      { key: "stripe_prod_publishable_key", value: prodPublishableKey },
      { key: "stripe_prod_secret_key", value: prodSecretKey },
      { key: "stripe_live_mode", value: isLiveMode ? "true" : "false" },
    ]);

    if (result.error) {
      setMessage(`❌ ${result.error}`);
    } else {
      setMessage("✅ Paramètres Stripe enregistrés avec succès.");
      setTimeout(() => setMessage(""), 3000);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Configuration Stripe</h3>
          <p className="text-gray-500 text-sm">Gérez vos clés API Stripe pour les paiements et le mode de fonctionnement.</p>
        </div>
        <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
          <span className={`text-sm font-medium ${!isLiveMode ? "text-[#F59E0B]" : "text-gray-400"}`}>Mode Test</span>
          <button 
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`w-12 h-6 rounded-full p-1 transition-colors relative ${isLiveMode ? "bg-[#10B981]" : "bg-gray-300"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isLiveMode ? "translate-x-6" : "translate-x-0"}`} />
          </button>
          <span className={`text-sm font-medium ${isLiveMode ? "text-[#10B981]" : "text-gray-400"}`}>Mode Production</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Test Keys */}
        <div className="space-y-4 opacity-80">
          <h4 className="font-semibold text-gray-700 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
            <span>Clés de Test (Sandbox)</span>
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Publishable Key (pk_test_...)</label>
              <input
                type="text"
                value={testPublishableKey}
                onChange={(e) => setTestPublishableKey(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B] text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Secret Key (sk_test_...)</label>
              <input
                type="password"
                value={testSecretKey}
                onChange={(e) => setTestSecretKey(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B] text-sm mt-1"
              />
            </div>
          </div>
        </div>

        {/* Production Keys */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            <span>Clés de Production (Live)</span>
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Publishable Key (pk_live_...)</label>
              <input
                type="text"
                value={prodPublishableKey}
                onChange={(e) => setProdPublishableKey(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B] text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Secret Key (sk_live_...)</label>
              <input
                type="password"
                value={prodSecretKey}
                onChange={(e) => setProdSecretKey(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:ring-[#F59E0B] focus:border-[#F59E0B] text-sm mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-[#0F4C81] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#1E3A8A] transition disabled:opacity-50"
        >
          {isLoading ? "Enregistrement..." : "Sauvegarder"}
        </button>
        {message && <span className="text-sm font-medium text-gray-700">{message}</span>}
      </div>
    </div>
  );
}
