import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface CartProps {
  onClose: () => void;
}

export function Cart({ onClose }: CartProps) {
  const cartItems = useQuery(api.cart.getCart) || [];
  const removeFromCart = useMutation(api.cart.removeFromCart);
  const updateCartItemQuantity = useMutation(api.cart.updateCartItemQuantity);
  const clearCart = useMutation(api.cart.clearCart);

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleRemoveItem = async (cartItemId: Id<"cartItems">) => {
    try {
      await removeFromCart({ cartItemId });
      toast.success("Produit retiré du panier");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    }
  };

  const handleUpdateQuantity = async (
    cartItemId: Id<"cartItems">,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    try {
      await updateCartItemQuantity({ cartItemId, quantity: newQuantity });
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success("Panier vidé");
    } catch (error) {
      toast.error("Erreur lors du vidage du panier");
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-2xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Panier</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl sm:text-2xl font-bold"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-8 sm:py-12 flex-1 flex flex-col justify-center">
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mb-4">Votre panier est vide</p>
            <button
              onClick={onClose}
              className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm sm:text-base"
            >
              Continuer les achats
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 flex-1 overflow-y-auto">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  {item.product.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full sm:w-20 h-40 sm:h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 w-full sm:w-auto">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100 mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 sm:mb-0">
                      {item.product.price.toFixed(2)} €
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item._id, item.quantity - 1)
                        }
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        aria-label="Diminuer quantité"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item._id, item.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        aria-label="Augmenter quantité"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base">
                        {(item.product.price * item.quantity).toFixed(2)} €
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        className="text-red-600 dark:text-red-400 text-xs sm:text-sm hover:text-red-800 dark:hover:text-red-300 mt-1"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Total</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {total.toFixed(2)} €
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleClearCart}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
                >
                  Vider le panier
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm sm:text-base"
                >
                  Commander
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

