import { useEffect, useState } from 'react';
import { apiService } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import { StatusModal } from '../../../components/common/StatusModal';
import ResponsiveSelect from '../../../components/ui/ResponsiveSelect';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
  categories: any[];
  products: any[];
  onSaved: () => Promise<void> | void;
}

export default function ProductEditModal({ isOpen, onClose, product, categories, products, onSaved }: ProductEditModalProps) {
  const numericSizes = ["35","36","37","38","39","40","41","42"];
  const clothingSizes = ["S","M","L","XL"];
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    stock_quantity: '',
    main_image: '',
    gallery_images: '',
    // Shoes
    sizes: [] as string[],
    heel_height: '',
    sole_type: '',
    materials: '',
    // Identifiers & SEO
    slug: '',
    keywords: '',
    meta_description: '',
    // Marketing
    related_products: [] as string[],
    trending: false,
    recommended: false
  });
  const [saving, setSaving] = useState(false);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [dragActiveMain, setDragActiveMain] = useState(false);
  const [dragActiveGallery, setDragActiveGallery] = useState(false);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);

  // Existing gallery URLs from the saved product (comma-separated in form)
  const existingGalleryUrls = (form.gallery_images
    ? form.gallery_images.split(',').map(s => s.trim()).filter(Boolean)
    : []);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        category_id: product.category_id || '',
        description: product.description || '',
        price: product.price != null ? String(product.price) : '',
        stock_quantity: product.stock_quantity != null ? String(product.stock_quantity) : '',
        main_image: product.main_image || '',
        gallery_images: Array.isArray(product.gallery_images) ? product.gallery_images.join(', ') : '',
        // Shoes
        sizes: Array.isArray(product.sizes) ? product.sizes.map(String) : [],
        heel_height: product.heel_height != null ? String(product.heel_height) : '',
        sole_type: product.sole_type || '',
        materials: product.materials || '',
        // Identifiers & SEO
        slug: product.slug || '',
        keywords: product.keywords || '',
        meta_description: product.meta_description || '',
        // Marketing
        related_products: Array.isArray(product.related_products) ? product.related_products : [],
        trending: !!product.trending,
        recommended: !!product.recommended
      });
    } else {
      setForm({
        name: '',
        category_id: '',
        description: '',
        price: '',
        stock_quantity: '',
        main_image: '',
        gallery_images: '',
        sizes: [],
        heel_height: '',
        sole_type: '',
        materials: '',
        slug: '',
        keywords: '',
        meta_description: '',
        related_products: [],
        trending: false,
        recommended: false
      });
    }
    setMainImageFile(null);
    setGalleryFiles([]);
  }, [product]);

  // Previews for selected files
  useEffect(() => {
    if (mainImageFile) {
      const url = URL.createObjectURL(mainImageFile);
      setMainPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setMainPreview(null);
  }, [mainImageFile]);

  useEffect(() => {
    const urls = galleryFiles.map(f => URL.createObjectURL(f));
    setGalleryPreviews(urls);
    return () => {
      urls.forEach(u => URL.revokeObjectURL(u));
    };
  }, [galleryFiles]);

  const handleDropMain = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveMain(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setMainImageFile(files[0]);
    }
  };

  const handleDropGallery = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveGallery(false);
    const files = e.dataTransfer.files;
    if (files && files.length) {
      setGalleryFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleAddGalleryFiles = (files: FileList | null) => {
    if (!files) return;
    setGalleryFiles(prev => [...prev, ...Array.from(files)]);
  };

  const safeExt = (name: string) => {
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop() || 'jpg' : 'jpg';
  };

  const generateSlug = (value: string) => {
     const s = (value || '').trim();
     return s
       .toLowerCase()
       .replace(/\s+/g, '-')
       .replace(/[\u2000-\u206F\u2E00-\u2E7F'"!@#$%^&*(),.•·/:;?{}+_=<>\[\]`~\\]+/g, '-')
       .replace(/-+/g, '-')
       .replace(/^-|-$/g, '');
   };
 
  // Note: no automatic filling of slug/SEO fields in the modal

  const uploadImageToProducts = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage.from('products').upload(path, file, {
      upsert: true,
      cacheControl: '3600',
      contentType: file.type || 'image/jpeg'
    });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('products').getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const uploadAllSelected = async (productId: string) => {
    const result: { main?: string; gallery: string[] } = { gallery: [] };

    if (mainImageFile) {
      const ext = safeExt(mainImageFile.name);
      result.main = await uploadImageToProducts(mainImageFile, `${productId}/main.${ext}`);
    }

    for (const f of galleryFiles) {
      const ext = safeExt(f.name);
      const uid = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const url = await uploadImageToProducts(f, `${productId}/gallery/${uid}.${ext}`);
      result.gallery.push(url);
    }

    return result;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const basePayload: any = {
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
      // professional, SEO and marketing fields
      basePayload.sizes = Array.isArray(form.sizes) ? form.sizes : [];
      basePayload.heel_height = form.heel_height !== '' ? Number(form.heel_height) : null;
      basePayload.sole_type = form.sole_type || null;
      basePayload.materials = form.materials?.trim() || null;
      basePayload.slug = (form.slug?.trim() || generateSlug(form.name)) || null;
      basePayload.keywords = form.keywords?.trim() || null;
      basePayload.meta_description = form.meta_description?.trim() || null;
      basePayload.related_products = Array.isArray(form.related_products) ? form.related_products : [];
      basePayload.trending = !!form.trending;
      basePayload.recommended = !!form.recommended;
      if (product && product.id) {
        let payload = basePayload;
        if (mainImageFile || galleryFiles.length) {
          const uploads = await uploadAllSelected(product.id);
          payload = {
            ...payload,
            main_image: uploads.main ?? payload.main_image,
            gallery_images: [...payload.gallery_images, ...uploads.gallery]
          };
        }
        await apiService.shop.updateProduct(product.id, payload);
      } else {
        const created = await apiService.shop.createProduct(basePayload);
        if (mainImageFile || galleryFiles.length) {
          const uploads = await uploadAllSelected(created.id);
          const payload = {
            ...basePayload,
            main_image: uploads.main ?? basePayload.main_image,
            gallery_images: [...basePayload.gallery_images, ...uploads.gallery]
          };
          await apiService.shop.updateProduct(created.id, payload);
        }
      }
      await onSaved();
      setSuccessOpen(true);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isNew = !product;

  return (
    <>
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
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center p-0 leading-none"
              aria-label="סגור"
              title="סגור"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)] overscroll-contain">
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Base & Price */}
            <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-[#4B2E83] mb-3 sm:mb-4">פרטי בסיס ומחיר</h3>
              {/* Row 1: Name + Category */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">שם המוצר *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none" />
                </div>
                <div>
                  <ResponsiveSelect
                    id="product-category"
                    name="product-category"
                    label="קטגוריה"
                    value={form.category_id}
                    onChange={(val) => setForm({ ...form, category_id: val })}
                    options={(categories || []).map((c: any) => ({ value: String(c.id), label: c.name }))}
                    placeholder="בחרי"
                    menuZIndex={70}
                  />
                </div>
              </div>

              {/* Row 2: Price + Stock */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
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

            {/* Shoes */}
            <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-[#4B2E83] mb-3 sm:mb-4">נעליים</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-2">מידות (EU / בגדים)</label>
                  <div className="flex flex-wrap gap-2">
                    {numericSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setForm(prev => {
                            const selected = new Set(prev.sizes);
                            if (selected.has(size)) selected.delete(size); else selected.add(size);
                            return { ...prev, sizes: Array.from(selected).sort() };
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer ${form.sizes.includes(size) ? 'border-[#EC4899] bg-[#EC4899]/10 text-[#EC4899]' : 'border-gray-300 text-gray-700 hover:border-[#EC4899]'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {clothingSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setForm(prev => {
                            const selected = new Set(prev.sizes);
                            if (selected.has(size)) selected.delete(size); else selected.add(size);
                            return { ...prev, sizes: Array.from(selected).sort() };
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer ${form.sizes.includes(size) ? 'border-[#EC4899] bg-[#EC4899]/10 text-[#EC4899]' : 'border-gray-300 text-gray-700 hover:border-[#EC4899]'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">גובה עקב (ס"מ)</label>
                    <input type="number" step="0.1" value={form.heel_height} onChange={e => setForm({ ...form, heel_height: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none [field-sizing:content]" />
                  </div>
                  <div>
                    <ResponsiveSelect
                      id="sole-type"
                      name="sole-type"
                      label="סוג סוליה"
                      value={form.sole_type}
                      onChange={(val) => setForm({ ...form, sole_type: val })}
                      options={[
                        { value: 'מחליק', label: 'מחליק' },
                        { value: 'לא מחליק', label: 'לא מחליק' }
                      ]}
                      placeholder="בחרי"
                      menuZIndex={70}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">חומרי גלם</label>
                <textarea rows={2} value={form.materials} onChange={e => setForm({ ...form, materials: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none" />
              </div>
            </div>

            {/* Identifiers & SEO */}
            <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-[#4B2E83] mb-3 sm:mb-4">מזהים ו-SEO</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">Slug (ידידותי ל-SEO)</label>
                  <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="נוצר אוטומטית מהשם אם ריק" className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none" />
                </div>
                <div></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">מילות מפתח</label>
                  <textarea rows={2} value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} placeholder="מילה1, מילה2, ..." className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">תיאור למנועי חיפוש</label>
                  <textarea rows={2} value={form.meta_description} onChange={e => setForm({ ...form, meta_description: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none" />
                </div>
              </div>
            </div>

            {/* Marketing */}
            <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-3 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-[#4B2E83]">שיווק והמלצות</h3>
                <span className="text-xs text-[#4B2E83]/70">שיפור חשיפה וקידום מוצרים</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                <div className="md:col-span-8">
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">מוצרים קשורים</label>
                  <div className="border border-[#EC4899]/20 rounded-xl p-2 sm:p-3 bg-white h-full">
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                      {(products || []).map((p: any) => {
                        const selected = form.related_products.includes(String(p.id));
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setForm(prev => {
                                const set = new Set(prev.related_products.map(String));
                                if (set.has(String(p.id))) set.delete(String(p.id)); else set.add(String(p.id));
                                return { ...prev, related_products: Array.from(set) };
                              });
                            }}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs sm:text-sm text-right ${selected ? 'bg-[#EC4899]/10 border-[#EC4899]/40 text-[#4B2E83]' : 'bg-gray-50 border-gray-200 text-[#4B2E83]/80 hover:bg-gray-100'}`}
                            title={p.name}
                          >
                            <div className="w-6 h-6 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                              {p.main_image ? (
                                <img src={p.main_image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#EC4899]/10 to-[#4B2E83]/10" />
                              )}
                            </div>
                            <span className="truncate">{p.name}</span>
                            {selected && (
                              <svg className="w-4 h-4 text-[#EC4899] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {form.related_products.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {form.related_products.map((id) => {
                          const prod = (products || []).find((pp: any) => String(pp.id) === String(id));
                          return (
                            <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-[#EC4899]/10 text-[#4B2E83] border border-[#EC4899]/20">
                              {prod?.name || id}
                              <button type="button" onClick={() => setForm(prev => ({ ...prev, related_products: prev.related_products.filter((x) => String(x) !== String(id)) }))} className="text-[#4B2E83]/60 hover:text-[#4B2E83]">×</button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <p className="mt-2 text-[11px] text-[#4B2E83]/60">בחרי מוצרים שיוצגו כהצעות ללקוחה בדף המוצר.</p>
                  </div>
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">תיוג וקידום</label>
                  <div className="border border-[#EC4899]/20 rounded-xl p-2 sm:p-3 bg-white h-full">
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        aria-pressed={form.trending}
                        onClick={() => setForm(prev => ({ ...prev, trending: !prev.trending }))}
                        className={`w-full text-right p-4 rounded-xl border transition flex items-start gap-3 shadow-sm hover:shadow ${form.trending ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white border-transparent shadow-md' : 'bg-white text-[#4B2E83] border-[#EC4899]/20 hover:bg-[#EC4899]/5'}`}
                        title="סימון מוצר כחם/חדש"
                      >
                        <span className={`inline-flex w-8 h-8 items-center justify-center rounded-full ${form.trending ? 'bg-white/20' : 'bg-[#EC4899]/10 text-[#EC4899]'}`}>🔥</span>
                        <div className="flex-1">
                          <div className={`text-sm font-semibold ${form.trending ? 'text-white' : 'text-[#4B2E83]'}`}>מוצר חם/חדש</div>
                          <div className={`text-[11px] ${form.trending ? 'text-white/80' : 'text-[#4B2E83]/60'}`}>מסומן להדגשה וחשיפה משופרת.</div>
                        </div>
                        {form.trending && (
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </button>
                      <button
                        type="button"
                        aria-pressed={form.recommended}
                        onClick={() => setForm(prev => ({ ...prev, recommended: !prev.recommended }))}
                        className={`w-full text-right p-4 rounded-xl border transition flex items-start gap-3 shadow-sm hover:shadow ${form.recommended ? 'bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white border-transparent shadow-md' : 'bg-white text-[#4B2E83] border-[#EC4899]/20 hover:bg-[#EC4899]/5'}`}
                        title="סימון מוצר כמומלץ"
                      >
                        <span className={`inline-flex w-8 h-8 items-center justify-center rounded-full ${form.recommended ? 'bg-white/20' : 'bg-[#4B2E83]/10 text-[#4B2E83]'}`}>⭐</span>
                        <div className="flex-1">
                          <div className={`text-sm font-semibold ${form.recommended ? 'text-white' : 'text-[#4B2E83]'}`}>מומלץ</div>
                          <div className={`text-[11px] ${form.recommended ? 'text-white/80' : 'text-[#4B2E83]/60'}`}>מופיע במקטעי "מומלצים" ברחבי האתר.</div>
                        </div>
                        {form.recommended && (
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-[#4B2E83] mb-3 sm:mb-4">מדיה</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {/* Main Image Uploader */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-2">תמונה ראשית</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActiveMain(true); }}
                    onDragLeave={() => setDragActiveMain(false)}
                    onDrop={handleDropMain}
                    className={`relative border-2 border-dashed rounded-xl p-3 sm:p-4 transition-colors ${dragActiveMain ? 'border-[#EC4899] bg-[#EC4899]/5' : 'border-[#EC4899]/20 hover:border-[#EC4899]/40'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg bg-white/40 overflow-hidden flex items-center justify-center border border-[#EC4899]/20">
                        {(mainPreview || form.main_image) ? (
                          <img src={mainPreview || form.main_image} alt="תמונה ראשית" className="w-full h-full object-contain" />
                        ) : (
                          <svg className="w-8 h-8 text-[#4B2E83]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l6 6-6 6M21 7l-6 6 6 6" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm text-[#4B2E83]">גררי ושחררי כאן, או לחצי לבחירה</p>
                        <div className="mt-2 flex gap-2">
                          <label className="px-3 py-1.5 text-xs sm:text-sm bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg cursor-pointer hover:from-[#4B2E83] hover:to-[#EC4899] transition-colors">
                            בחרי קובץ
                            <input type="file" accept="image/*" onChange={(e) => setMainImageFile(e.target.files?.[0] ?? null)} className="hidden" />
                          </label>
                          {mainImageFile && (
                            <button type="button" onClick={() => setMainImageFile(null)} className="px-3 py-1.5 text-xs sm:text-sm border border-[#4B2E83] text-[#4B2E83] rounded-lg hover:bg-[#4B2E83] hover:text-white transition-colors">הסר בחירה</button>
                          )}
                        </div>
                        {mainImageFile && (
                          <p className="mt-1 text-[11px] text-[#4B2E83]/70">{mainImageFile.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gallery Uploader */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-2">גלריית תמונות</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActiveGallery(true); }}
                    onDragLeave={() => setDragActiveGallery(false)}
                    onDrop={handleDropGallery}
                    className={`relative border-2 border-dashed rounded-xl p-3 sm:p-4 transition-colors ${dragActiveGallery ? 'border-[#EC4899] bg-[#EC4899]/5' : 'border-[#EC4899]/20 hover:border-[#EC4899]/40'}`}
                  >
                    {/* Existing gallery (from saved product) */}
                    {existingGalleryUrls.length > 0 && (
                      <div className="mb-3 grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {existingGalleryUrls.map((src, idx) => (
                          <div key={`${src}_${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-[#EC4899]/20 bg-white">
                            <img src={src} alt={`גלריה קיימת ${idx + 1}`} className="w-full h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => setForm(prev => ({
                                ...prev,
                                gallery_images: (prev.gallery_images || '')
                                  .split(',')
                                  .map(s => s.trim())
                                  .filter(Boolean)
                                  .filter(u => u !== src)
                                  .join(', ')
                              }))}
                              className="absolute top-1 right-1 w-6 h-6 bg-white/90 text-[#4B2E83] rounded-full flex items-center justify-center shadow hover:bg-white p-0 leading-none"
                              aria-label="מחקי תמונה קיימת"
                              title="מחק"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M7 6l1 14h8l1-14M10 11v6M14 11v6" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs sm:text-sm text-[#4B2E83]">גררי ושחררי כאן כמה תמונות, או לחצי להוספה</p>
                    <div className="mt-2">
                      <label className="px-3 py-1.5 inline-block text-xs sm:text-sm bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg cursor-pointer hover:from-[#4B2E83] hover:to-[#EC4899] transition-colors">
                        הוסיפי תמונות
                        <input type="file" accept="image/*" multiple onChange={(e) => handleAddGalleryFiles(e.target.files)} className="hidden" />
                      </label>
                    </div>

                    {galleryPreviews.length > 0 && (
                      <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {galleryPreviews.map((src, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#EC4899]/20">
                            <img src={src} alt={`גלריה ${idx + 1}`} className="w-full h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => setGalleryFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 w-6 h-6 bg-white/90 text-[#4B2E83] rounded-full flex items-center justify-center shadow hover:bg-white p-0 leading-none"
                              aria-label="מחק תמונה"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M7 6l1 14h8l1-14M10 11v6M14 11v6" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
    <StatusModal
      isOpen={!!successOpen}
      onClose={() => { setSuccessOpen(false); onClose(); }}
      type="success"
      title={product && product.id ? 'המוצר עודכן בהצלחה' : 'המוצר נוצר בהצלחה'}
      message="הפרטים נשמרו במערכת"
    />
    </>
  );
}


