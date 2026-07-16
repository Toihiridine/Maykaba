"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface SalesChartProps {
  data: { date: string; ventes: number }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="h-[300px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }} 
            dx={-10}
            tickFormatter={(value) => `${value}€`}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#374151' }}
            itemStyle={{ color: '#F59E0B', fontWeight: 'bold' }}
            formatter={(value: number) => [`${value.toFixed(2)} €`, 'Ventes']}
          />
          <Area
            type="monotone"
            dataKey="ventes"
            stroke="#F59E0B"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorVentes)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
