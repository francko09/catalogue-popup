interface AdPopupProps {
  ad: {
    title: string;
    imageUrl: string | null;
    link?: string;
  };
  onClose: () => void;
}

export function AdPopup({ ad, onClose }: AdPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl sm:text-2xl font-bold"
          aria-label="Fermer"
        >
          ✕
        </button>
        
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 pr-8 text-gray-800 dark:text-gray-100">{ad.title}</h3>
        
        {ad.imageUrl && (
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-40 sm:h-48 object-cover rounded mb-3 sm:mb-4"
          />
        )}
        
        <div className="flex flex-col sm:flex-row gap-2">
          {ad.link && (
            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 text-center text-sm sm:text-base"
            >
              En savoir plus
            </a>
          )}
          <button
            onClick={onClose}
            className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600 text-sm sm:text-base"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
