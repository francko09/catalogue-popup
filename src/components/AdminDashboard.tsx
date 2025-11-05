import { useState } from "react";
import { ProductsTab } from "./admin/ProductsTab";
import { AdsTab } from "./admin/AdsTab";
import { StatsTab } from "./admin/StatsTab";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"products" | "ads" | "stats">("products");

  const tabs = [
    { id: "products" as const, label: "Produits", icon: "📦" },
    { id: "ads" as const, label: "Publicités", icon: "📢" },
    { id: "stats" as const, label: "Statistiques", icon: "📊" },
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6 lg:mb-8">
        Tableau de Bord Administrateur
      </h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 lg:mb-8 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max sm:min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <span className="mr-1 sm:mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "products" && <ProductsTab />}
      {activeTab === "ads" && <AdsTab />}
      {activeTab === "stats" && <StatsTab />}
    </div>
  );
}
