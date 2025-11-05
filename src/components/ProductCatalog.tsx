import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function ProductCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const categories = useQuery(api.products.getCategories) || [];
  const products = useQuery(api.products.listProducts, {
    search: searchTerm || undefined,
    category: selectedCategory || undefined,
  }) || [];
  const addToCart = useMutation(api.cart.addToCart);

  const handleAddToCart = async (productId: Id<"products">) => {
    try {
      await addToCart({ productId, quantity: 1 });
      toast.success("Produit ajouté au panier");
    } catch (error) {
      toast.error("Erreur lors de l'ajout au panier");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6 lg:mb-8">
        Catalogue de Produits
      </h1>
      
      {/* Search and Filter */}
      <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher des produits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        
        <div className="w-full sm:w-auto sm:min-w-[200px] lg:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-40 sm:h-48 object-cover"
              />
            )}
            <div className="p-3 sm:p-4 flex flex-col flex-1">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-100 mb-2 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3 line-clamp-2 flex-1">
                {product.description}
              </p>
              <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {product.price.toFixed(2)} €
                </span>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                  {product.category}
                </span>
              </div>
              <button
                onClick={() => handleAddToCart(product._id)}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Ajouter au panier
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun produit trouvé</p>
        </div>
      )}
    </div>
  );
}
