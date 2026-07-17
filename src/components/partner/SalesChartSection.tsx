"use client";

import { useState, useMemo } from "react";
import SalesChart from "./SalesChart";

interface SalesChartSectionProps {
  completedOrders: { createdAt: Date; totalAmount: number }[];
}

export default function SalesChartSection({ completedOrders }: SalesChartSectionProps) {
  const [days, setDays] = useState(7);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("fr-FR", { weekday: 'short', day: 'numeric' });
      
      const dayTotal = completedOrders
        .filter(o => new Date(o.createdAt).toDateString() === d.toDateString())
        .reduce((sum, o) => sum + o.totalAmount, 0);
        
      data.push({ date: dateStr, ventes: dayTotal });
    }
    return data;
  }, [completedOrders, days]);

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Évolution des Ventes ({days} derniers jours)</h3>
        <select 
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-1 focus:ring-[#F59E0B] outline-none"
        >
          <option value={7}>7 derniers jours</option>
          <option value={30}>30 derniers jours</option>
        </select>
      </div>
      <SalesChart data={chartData} />
    </div>
  );
}
