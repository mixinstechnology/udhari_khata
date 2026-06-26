import React from 'react';

interface PopupImageProps {
  imageUrl: string;
  title?: string;
  onClose: () => void;
}

const PopupImage: React.FC<PopupImageProps> = ({ imageUrl, title, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl font-bold"
        >
          ×
        </button>
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
        <img
          src={imageUrl}
          alt="Popup"
          className="w-full h-auto max-h-[70vh] object-contain rounded"
        />
      </div>
    </div>
  );
};

export default PopupImage;
