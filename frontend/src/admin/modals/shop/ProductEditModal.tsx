import { useEffect, useState } from 'react';
import { apiService } from '../../../lib/api';
import ResponsiveSelect from '../../../components/ui/ResponsiveSelect';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
  categories: any[];
  onSaved: () => Promise<void> | void;
}

export default function ProductEditModal({ isOpen, onClose, product, categories, onSaved }: ProductEditModalProps) {
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    stock_quantity: '',
    main_image: '',
    gallery_images: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        category_id: product.category_id || '',
        description: product.description || '',
        price: product.price != null ? String(product.price) : '',
        stock_quantity: product.stock_quantity != null ? String(product.stock_quantity) : '',
        main_image: product.main_image || '',
        gallery_images: Array.isArray(product.gallery_images) ? product.gallery_images.join(', ') : ''
      });
    } else {
      setForm({ name: '', category_id: '', description: '', price: '', stock_quantity: '', main_image: '', gallery_images: '' });
    }
  }, [product]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: any = {
        name: form.name.trim(),
        category_id: form.category_id,
        description: form.description.trim(),
        price: Number(form.price || 0),
        stock_quantity: Number(form.stock_quantity || 0),
        main_image: form.main_image.trim() || null,
        gallery_images: form.gallery_images
          ? form.gallery_images.split(',').map(s => s.trim()).filter(Boolean)
          : []
      };
      if (product && product.id) {
        await apiService.shop.updateProduct(product.id, payload);
      } else {
        await apiService.shop.createProduct(payload);
      }
      await onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isNew = !product;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-visible shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v4H3V3zm0 6h18v12H3V9zm6 2v8m6-8v8" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{isNew ? 'הוספת מוצר חדש' : 'עריכת מוצר'}</h2>
                <p className="text-white/80 text-sm mt-1">{isNew ? 'צרי מוצר חדש בחנות' : 'ערכי את פרטי המוצר'}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white text-3xl font-light transition-colors duration-200 hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center">×</button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)] overscroll-contain">
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Base & Price */}
            <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-[#4B2E83] mb-3 sm:mb-4">פרטי בסיס ומחיר</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">שם המוצר *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none" />
                </div>
                <div>
                  <ResponsiveSelect
                    id="product-category"
                    name="product-category"
                    label="קטגוריה *"
                    value={form.category_id}
                    onChange={(v) => setForm({ ...form, category_id: v })}
                    placeholder="בחרי קטגוריה"
                    options={(categories || []).map((c: any) => ({ value: String(c.id), label: c.name }))}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">מחיר (₪) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none [field-sizing:content]" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">מלאי *</label>
                  <input type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none [field-sizing:content]" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">תיאור</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none" />
              </div>
            </div>

            {/* Media */}
            <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-[#4B2E83] mb-3 sm:mb-4">מדיה</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">תמונה ראשית (URL)</label>
                  <input value={form.main_image} onChange={e => setForm({ ...form, main_image: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">גלרייה (URLs, מופרדים בפסיקים)</label>
                  <input value={form.gallery_images} onChange={e => setForm({ ...form, gallery_images: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
              <button onClick={onClose} className="px-4 sm:px-6 py-2 border border-[#4B2E83] text-[#4B2E83] rounded-lg font-medium hover:bg-[#4B2E83] hover:text-white transition-all duration-300 text-sm">ביטול</button>
              <button disabled={saving || !form.name.trim() || !form.category_id} onClick={handleSave} className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 disabled:opacity-50">שמירה</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


