"use client";

import React, { useState } from "react";

export default function StoreProductsPage() {
  // MOCK: Dans une vraie application, on ferait un fetch /api/stores/[slug]/products
  const [products, setProducts] = useState([
    { id: "1", name: "Riz Parfumé 5kg", price: 6.5, inStock: true },
    { id: "2", name: "Huile de Tournesol 1L", price: 2.2, inStock: true },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;

    const newProduct = {
      id: Math.random().toString(),
      name: newProductName,
      price: parseFloat(newProductPrice),
      inStock: true,
    };

    setProducts([...products, newProduct]);
    setIsAdding(false);
    setNewProductName("");
    setNewProductPrice("");
  };

  const toggleStock = (id: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium text-gray-800">Catalogue des Produits</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-ocean-blue text-white px-4 py-2 rounded-xl font-medium hover:bg-opacity-90 transition"
        >
          {isAdding ? "Annuler" : "+ Ajouter un produit"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Nouveau Produit</h4>
          <form onSubmit={handleAddProduct} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Nom du produit</label>
              <input 
                type="text" 
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="Ex: Coca-Cola 1.5L"
                required
              />
            </div>
            <div className="w-32">
              <label className="block text-sm text-gray-600 mb-1">Prix (€)</label>
              <input 
                type="number" 
                step="0.01"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="2.50"
                required
              />
            </div>
            <button type="submit" className="bg-terracotta text-white px-6 py-2 rounded-xl font-medium h-[42px]">
              Enregistrer
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4 font-medium">Produit</th>
              <th className="px-6 py-4 font-medium">Prix</th>
              <th className="px-6 py-4 font-medium">En Stock</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                <td className="px-6 py-4 text-ocean-blue font-semibold">{product.price.toFixed(2)} €</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.inStock ? 'Oui' : 'Non (Épuisé)'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => toggleStock(product.id)}
                    className="text-gray-500 hover:text-ocean-blue text-sm font-medium"
                  >
                    {product.inStock ? 'Marquer épuisé' : 'Remettre en stock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
