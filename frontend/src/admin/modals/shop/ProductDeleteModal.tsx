import { useState } from 'react';
import { apiService } from '../../../lib/api';

interface ProductDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
  onDeleted: () => Promise<void> | void;
}

export default function ProductDeleteModal({ isOpen, onClose, product, onDeleted }: ProductDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await apiService.shop.deleteProduct(product.id);
      await onDeleted();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-3 md:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-full overflow-hidden border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-3 sm:p-4 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <h3 className="text-base sm:text-lg font-bold">אישור מחיקת מוצר</h3>
            <p className="text-xs sm:text-sm text-white/90 mt-1">האם למחוק את "{product.name}"? פעולה זו אינה הפיכה</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              </div>
              <div className="text-[13px] sm:text-sm text-red-800">
                המחיקה תסיר את המוצר מהחנות לצמיתות. לא ניתן לשחזר לאחר המחיקה.
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded-lg border">ביטול</button>
            <button onClick={handleDelete} disabled={isLoading} className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50">מחקי</button>
          </div>
        </div>
      </div>
    </div>
  );
}


