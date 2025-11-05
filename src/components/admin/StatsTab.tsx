import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function StatsTab() {
  const stats = useQuery(api.stats.getStats);

  if (!stats) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800 dark:text-gray-100">Statistiques</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-2xl sm:text-3xl mr-3 sm:mr-4">📦</div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Produits</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalProducts}</p>
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">{stats.activeProducts} actifs</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-2xl sm:text-3xl mr-3 sm:mr-4">📢</div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Publicités</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalAds}</p>
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">{stats.activeAds} actives</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-2xl sm:text-3xl mr-3 sm:mr-4">👥</div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Connexions Récentes</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.recentLogins}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Dernières 24h</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-2xl sm:text-3xl mr-3 sm:mr-4">📊</div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Clients vs Admins</p>
              <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                Clients: {stats.loginsByRole.client || 0}
              </p>
              <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                Admins: {stats.loginsByRole.admin || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Logins */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-100">Dernières Connexions</h3>
        <div className="space-y-2 sm:space-y-3">
          {stats.lastLogins.map((login, index) => (
            <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div className="flex items-center">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-3 ${
                  login.role === "admin"
                    ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                    : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                }`}>
                  {login.role}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{login.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
