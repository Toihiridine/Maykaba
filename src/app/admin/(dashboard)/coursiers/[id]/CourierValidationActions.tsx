"use client";

import { useState } from "react";
import { validateCourierAction, rejectCourierAction } from "@/actions/couriers";

export default function CourierValidationActions({
  profileId,
  currentStatus,
}: {
  profileId: string;
  currentStatus: string;
}) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleValidate = async () => {
    setIsLoading(true);
    setError("");
    const result = await validateCourierAction(profileId);
    if (result.error) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleReject = async () => {
    setIsLoading(true);
    setError("");
    const result = await rejectCourierAction(profileId, reason);
    if (result.error) {
      setError(result.error);
    } else {
      setIsRejecting(false);
      setReason("");
    }
    setIsLoading(false);
  };

  return (
    <div className="pt-4 border-t border-gray-100">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {isRejecting ? (
        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h4 className="font-medium text-gray-800 text-sm">Motif du refus</h4>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-[#F59E0B] focus:border-[#F59E0B]"
            rows={3}
            placeholder="Ex: La photo de votre pièce d'identité est trop floue."
          ></textarea>
          <div className="flex space-x-3 justify-end">
            <button
              disabled={isLoading}
              onClick={() => setIsRejecting(false)}
              className="px-4 py-2 text-gray-600 font-medium text-sm hover:text-gray-900 transition"
            >
              Annuler
            </button>
            <button
              disabled={isLoading}
              onClick={handleReject}
              className="px-4 py-2 bg-red-600 text-white font-medium text-sm rounded-xl hover:bg-red-700 transition disabled:opacity-50"
            >
              {isLoading ? "Envoi..." : "Confirmer le refus"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex space-x-3">
          {currentStatus !== "APPROVED" && (
            <button
              onClick={handleValidate}
              disabled={isLoading}
              className="flex-1 bg-[#10B981] text-white px-4 py-3 rounded-xl font-medium hover:bg-green-600 transition disabled:opacity-50"
            >
              {isLoading ? "Chargement..." : "Valider le dossier"}
            </button>
          )}

          {currentStatus !== "REJECTED" && (
            <button
              onClick={() => setIsRejecting(true)}
              disabled={isLoading}
              className="flex-1 bg-white border border-red-200 text-red-600 px-4 py-3 rounded-xl font-medium hover:bg-red-50 transition disabled:opacity-50"
            >
              Demander une modification
            </button>
          )}
        </div>
      )}
    </div>
  );
}
