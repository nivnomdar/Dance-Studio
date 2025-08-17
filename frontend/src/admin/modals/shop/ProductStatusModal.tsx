import { apiService } from '../../../lib/api';
import { useState } from 'react';

interface ProductStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onSaved: () => Promise<void> | void;
}

export default function ProductStatusModal({ isOpen, onClose, product, onSaved }: ProductStatusModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  if (!isOpen || !product) return null;

  const current = product.is_active ? 'active' : 'inactive';
  const next = product.is_active ? 'inactive' : 'active';

  const onConfirm = async () => {
    try {
      setIsLoading(true);
      await apiService.shop.updateProduct(product.id, { is_active: !product.is_active });
      await onSaved();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-4 text-white">
          <h3 className="text-lg font-bold">שינוי סטטוס מוצר</h3>
          <p className="text-white/90 text-sm">אישור שינוי סטטוס עבור "{product.name}"</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/20 rounded-lg p-3">
            <div className="flex items-center justify-center gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${product.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {product.is_active ? 'פעיל' : 'לא פעיל'}
              </span>
              <svg className="w-4 h-4 text-[#4B2E83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${!product.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {product.is_active ? 'לא פעיל' : 'פעיל'}
              </span>
            </div>
          </div>
          <p className="text-sm text-[#4B2E83] text-center">האם לשנות את הסטטוס מ-"{product.is_active ? 'פעיל' : 'לא פעיל'}" ל-"{product.is_active ? 'לא פעיל' : 'פעיל'}"?</p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded-lg border">ביטול</button>
            <button onClick={onConfirm} disabled={isLoading} className="px-4 py-2 rounded-lg bg-[#EC4899] text-white disabled:opacity-50">אישור</button>
          </div>
        </div>
      </div>
    </div>
  );
}


