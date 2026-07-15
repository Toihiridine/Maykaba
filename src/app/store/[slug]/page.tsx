export default function StoreDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-medium text-gray-800 mb-4">Aperçu du Magasin</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Nouvelles Commandes</p>
            <p className="text-3xl font-semibold text-ocean-blue">0</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Commandes en cours</p>
            <p className="text-3xl font-semibold text-terracotta">0</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Produits en stock</p>
            <p className="text-3xl font-semibold text-emerald-green">0</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Ventes du jour</p>
            <p className="text-3xl font-semibold text-gray-800">0,00 €</p>
          </div>
        </div>
      </div>
    </div>
  );
}
