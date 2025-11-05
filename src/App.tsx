import {
  Authenticated,
  Unauthenticated,
  useQuery,
  useMutation,
} from 'convex/react';
import { api } from '../convex/_generated/api';
import { SignInForm } from './SignInForm';
import { SignOutButton } from './SignOutButton';
import { Toaster, toast } from 'sonner';
import { ProductCatalog } from './components/ProductCatalog';
import { AdminDashboard } from './components/AdminDashboard';
import { AdPopup } from './components/AdPopup';
import { Cart } from './components/Cart';
import { useState, useEffect } from 'react';
import { useTheme } from './contexts/ThemeContext';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const updateLastLogin = useMutation(api.users.updateLastLogin);
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [showCart, setShowCart] = useState(false);

  // Charger les publicités et le panier (les queries gèrent maintenant l'absence d'authentification)
  const allActiveAdsResult = useQuery(api.advertisements.getAllActiveAds);
  const allActiveAds = Array.isArray(allActiveAdsResult)
    ? allActiveAdsResult
    : [];

  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [hasUpdatedLogin, setHasUpdatedLogin] = useState(false);

  const cartItemCountResult = useQuery(api.cart.getCartItemCount);
  const cartItemCount =
    typeof cartItemCountResult === 'number' ? cartItemCountResult : 0;

  // Update last login when user profile is loaded (only once per session)
  useEffect(() => {
    if (userProfile && !hasUpdatedLogin) {
      updateLastLogin()
        .then(() => {
          setHasUpdatedLogin(true);
        })
        .catch((error) => {
          console.error('Failed to update last login:', error);
        });
    }
  }, [userProfile, updateLastLogin, hasUpdatedLogin]);

  // Auto popup every 3-5 minutes for clients - affiche les popups à tour de rôle
  useEffect(() => {
    if (userProfile?.role === 'client' && allActiveAds.length > 0) {
      const interval = setInterval(
        () => {
          setShowAdPopup(true);
        }, //Math.random() * (5 - 3) * 60 * 1000 + 3 * 60 * 1000); // 3-5 minutes
        //Math.random() * (2 - 1) * 60 * 1000 + 1 * 60 * 1000); // 1 à 2 minutes
        Math.random() * (10 - 5) * 1000 + 5 * 1000
      ); // 5 à 10 secondes

      return () => clearInterval(interval);
    }
  }, [userProfile?.role, allActiveAds.length]);

  // Réinitialiser l'index si la liste des publicités change
  useEffect(() => {
    if (allActiveAds.length > 0 && currentAdIndex >= allActiveAds.length) {
      setCurrentAdIndex(0);
    }
  }, [allActiveAds.length, currentAdIndex]);

  // Gérer la rotation des publicités à chaque fermeture de popup
  const handleCloseAdPopup = () => {
    setShowAdPopup(false);
    if (allActiveAds.length > 0) {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % allActiveAds.length);
    }
  };

  // Récupérer la publicité actuelle basée sur l'index
  const currentAd =
    allActiveAds.length > 0 ? allActiveAds[currentAdIndex] : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-16 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 shadow-sm px-3 sm:px-4">
        <h2 className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400 truncate">
          ProductCatalog
        </h2>
        <div className="flex items-center gap-2 sm:gap-4">
          <Authenticated>
            {userProfile?.role === 'client' && (
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="Panier"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>
            )}
            {userProfile && (
              <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-300 truncate max-w-[150px] lg:max-w-none">
                {userProfile.user?.email} ({userProfile.role})
              </span>
            )}
          </Authenticated>
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label={
              theme === 'dark'
                ? 'Activer le mode clair'
                : 'Activer le mode sombre'
            }
          >
            {theme === 'dark' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1">
        <Unauthenticated>
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-8">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-3 sm:mb-4">
                  Bienvenue sur ProductCatalog
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300">
                  Connectez-vous pour accéder au catalogue
                </p>
              </div>
              <SignInForm />
            </div>
          </div>
        </Unauthenticated>

        <Authenticated>
          {userProfile === undefined ? (
            <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : userProfile === null ? (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
              <RoleSelection />
            </div>
          ) : userProfile?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <ProductCatalog />
          )}
        </Authenticated>
      </main>

      {showAdPopup && currentAd && (
        <AdPopup ad={currentAd} onClose={handleCloseAdPopup} />
      )}

      {showCart && <Cart onClose={() => setShowCart(false)} />}

      <Toaster />
    </div>
  );
}

function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<'client' | 'admin'>(
    'client'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createUserProfile = useMutation(api.users.createUserProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createUserProfile({ role: selectedRole });
      toast.success(`Profil ${selectedRole} créé avec succès!`);
    } catch (error) {
      toast.error('Erreur lors de la création du profil');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">
          Choisissez votre rôle
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="radio"
                name="role"
                value="client"
                checked={selectedRole === 'client'}
                onChange={(e) => setSelectedRole(e.target.value as 'client')}
                className="mr-3"
              />
              <div>
                <div className="font-semibold text-gray-800 dark:text-gray-100">
                  Client
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Consulter le catalogue, rechercher des produits
                </div>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={selectedRole === 'admin'}
                onChange={(e) => setSelectedRole(e.target.value as 'admin')}
                className="mr-3"
              />
              <div>
                <div className="font-semibold text-gray-800 dark:text-gray-100">
                  Administrateur
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Gérer les produits et les publicités
                </div>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Création...' : 'Continuer'}
          </button>
        </form>
      </div>
    </div>
  );
}
