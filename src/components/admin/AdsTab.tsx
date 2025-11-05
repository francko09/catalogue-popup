import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";

export function AdsTab() {
  const ads = useQuery(api.advertisements.listAllAds) || [];
  const createAd = useMutation(api.advertisements.createAd);
  const updateAd = useMutation(api.advertisements.updateAd);
  const deleteAd = useMutation(api.advertisements.deleteAd);
  const generateUploadUrl = useMutation(api.advertisements.generateUploadUrl);
  const randomAd = useQuery(api.advertisements.getRandomActiveAd);

  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTestPopup, setShowTestPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageId: Id<"_storage"> | undefined;

      if (imageFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        const json = await result.json();
        if (!result.ok) {
          throw new Error(`Upload failed: ${JSON.stringify(json)}`);
        }
        imageId = json.storageId;
      }

      if (editingAd) {
        await updateAd({
          id: editingAd._id,
          ...formData,
          imageId: imageId || editingAd.imageId,
        });
        toast.success("Publicité mise à jour!");
      } else {
        await createAd({
          ...formData,
          imageId,
        });
        toast.success("Publicité créée!");
      }

      resetForm();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (ad: any) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      link: ad.link || "",
      isActive: ad.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: Id<"advertisements">) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette publicité ?")) {
      try {
        await deleteAd({ id });
        toast.success("Publicité supprimée!");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      link: "",
      isActive: true,
    });
    setImageFile(null);
    setEditingAd(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Gestion des Publicités</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTestPopup(true)}
            disabled={!randomAd}
            className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
          >
            Tester Pop-up
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            Ajouter une publicité
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            {editingAd ? "Modifier la publicité" : "Nouvelle publicité"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titre
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lien (optionnel)
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Publicité active
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
              >
                {isSubmitting ? "..." : (editingAd ? "Mettre à jour" : "Créer")}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ads List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {ads.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm sm:text-base">Aucune publicité trouvée. Commencez par ajouter votre première publicité!</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Publicité
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Lien
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {ads.map((ad) => (
                    <tr key={ad._id}>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center">
                          {ad.imageUrl && (
                            <img
                              src={ad.imageUrl}
                              alt={ad.title}
                              className="h-10 w-10 rounded mr-3 object-cover"
                            />
                          )}
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{ad.title}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {ad.link ? (
                          <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                            {ad.link.length > 30 ? ad.link.substring(0, 30) + "..." : ad.link}
                          </a>
                        ) : (
                          "Aucun lien"
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ad.isActive
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        }`}>
                          {ad.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => handleEdit(ad)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(ad._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {ads.map((ad) => (
                <div key={ad._id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {ad.imageUrl && (
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="h-16 w-16 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{ad.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ad.isActive
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        }`}>
                          {ad.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {ad.link && (
                        <a 
                          href={ad.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all block mb-2"
                        >
                          {ad.link.length > 40 ? ad.link.substring(0, 40) + "..." : ad.link}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="flex-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm px-3 py-1 border border-blue-600 dark:border-blue-400 rounded"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(ad._id)}
                      className="flex-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm px-3 py-1 border border-red-600 dark:border-red-400 rounded"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Test Popup */}
      {showTestPopup && randomAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{randomAd.title}</h3>
              <button
                onClick={() => setShowTestPopup(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            {randomAd.imageUrl && (
              <img
                src={randomAd.imageUrl}
                alt={randomAd.title}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            {randomAd.link && (
              <a
                href={randomAd.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                En savoir plus
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
