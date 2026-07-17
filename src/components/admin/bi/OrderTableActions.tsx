"use client";

import { useState } from "react";
import AssignCourierModal from "./AssignCourierModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrderTableActions({ order }: { order: any }) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const router = useRouter();

  const isPendingAssignment = order.status === "PAID_ESCROW" && !order.courierId;

  return (
    <div className="flex items-center space-x-2">
      <Link 
        href={`/admin/orders/${order.id}`}
        className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-medium transition"
      >
        Voir détails
      </Link>
      
      {isPendingAssignment && (
        <button
          onClick={() => setShowAssignModal(true)}
          className="px-3 py-1 bg-[#F59E0B] text-white hover:bg-orange-600 rounded-lg text-xs font-medium transition"
        >
          Assigner
        </button>
      )}

      {showAssignModal && (
        <AssignCourierModal
          order={order}
          onClose={() => setShowAssignModal(false)}
          onAssigned={() => {
            setShowAssignModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
