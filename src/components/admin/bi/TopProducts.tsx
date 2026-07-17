"use client";

import { useState, useEffect } from "react";
import { getTopProductsAction } from "@/actions/bi.actions";

export default function TopProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date filters
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchProducts = async () => {
    setLoading(true);
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    // Adjust end date to end of day if specified
    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    const data = await getTopProductsAction(start, end);
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [startDate, endDate]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
        <h3 className="text-xl font-bold text-gray-800">📦 Produits les plus achetés</h3>
        
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">De :</span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 focus:ring-[#0F4C81]"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">À :</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 focus:ring-[#0F4C81]"
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(""); setEndDate(""); }}
              className="mt-4 text-xs text-red-500 hover:underline"
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500 animate-pulse">Chargement des produits...</div>
      ) : products.length === 0 ? (
        <p className="text-gray-500">Aucun produit vendu sur cette période.</p>
      ) : (
        <div className="space-y-3">
          {products.map((item, index) => (
            <div key={item.product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition">
              <div className="flex items-center space-x-4">
                <span className="font-bold text-gray-400 w-4">{index + 1}.</span>
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">IMG</div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-800">{item.product.name}</h4>
                  <p className="text-xs text-gray-500">{item.quantity} unités vendues</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#0F4C81]">{item.revenue.toFixed(2)} €</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
