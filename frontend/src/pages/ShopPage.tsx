import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types/product';
import { useCart } from '../contexts/CartContext';
import { usePopup } from '../contexts/PopupContext';
import { apiService } from '../lib/api';

const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeParentId, setActiveParentId] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const { addToCart } = useCart();
  const { showPopup } = usePopup();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSizeAll = 18;

  const topLevelCategories = useMemo(() => {
    const top = categories.filter(c => !c.parent_id);
    // do not include the synthetic "all" button in the UI
    return top.map((c: any) => ({ id: c.id, name: c.name }));
  }, [categories]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const [cats, prods] = await Promise.all([
          apiService.shop.getCategories(),
          apiService.shop.getProducts()
        ]);
        if (!mounted) return;
        setCategories(cats || []);
        // Map backend products to UI-friendly shape
        const mapped = (prods || []).map((p: any) => ({
          ...p,
          image: p.main_image || p.image || '',
          features: Array.isArray(p.features) ? p.features : [],
          sizes: Array.isArray(p.sizes) ? p.sizes : undefined,
          colors: Array.isArray(p.colors) ? p.colors : undefined,
          isNew: !!(p.trending ?? p.isNew),
          isBestSeller: !!(p.recommended ?? p.isBestSeller)
        }));
        setProducts(mapped);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'שגיאה בטעינת החנות');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    const selected = categories.find((c: any) => c.id === selectedCategory);
    if (!selected) return products;
    const isParent = !selected.parent_id;
    if (isParent) {
      const childIds = new Set(categories.filter((c: any) => c.parent_id === selectedCategory).map((c: any) => c.id));
      return products.filter((p: any) => p.category_id === selectedCategory || childIds.has(p.category_id) || p.categories?.parent_id === selectedCategory);
    }
    // Subcategory: match by direct category_id or by joined alias id if present
    return products.filter((p: any) => p.category_id === selectedCategory || p.categories?.id === selectedCategory);
  }, [products, selectedCategory, categories]);

  const isAll = selectedCategory === 'all';
  const totalPages = isAll ? Math.max(1, Math.ceil(products.length / pageSizeAll)) : 1;
  const visibleProducts = useMemo(() => {
    if (!isAll) return filteredProducts;
    const start = (page - 1) * pageSizeAll;
    return products.slice(start, start + pageSizeAll);
  }, [isAll, filteredProducts, products, page]);

  const selectedCategoryObj = useMemo(() => {
    return categories.find((c: any) => c.id === selectedCategory) || null;
  }, [categories, selectedCategory]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    // Use a simple data URL for placeholder
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPuaJp+ihjOaTjeS9nPC90ZXh0Pgo8L3N2Zz4=';
    target.onerror = null; // Prevent infinite loop
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[0] || '');
    setSelectedColor(product.colors?.[0] || '');
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    // Validate size and color if required
    if (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !selectedSize) {
      showPopup({
        title: 'שגיאה',
        message: 'אנא בחרי מידה',
        type: 'error',
        duration: 3000
      });
      return;
    }

    if (selectedProduct.colors && selectedProduct.colors.length > 0 && !selectedColor) {
      showPopup({
        title: 'שגיאה',
        message: 'אנא בחרי צבע',
        type: 'error',
        duration: 3000
      });
      return;
    }

    // Add to cart
    addToCart(selectedProduct, quantity, selectedSize, selectedColor);

    // Show success message
    showPopup({
      title: 'הוספה לסל',
      message: `${selectedProduct.name} נוסף לסל הקניות שלך`,
      type: 'success',
      duration: 3000
    });

    // Reset form and close modal
    setSelectedProduct(null);
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4B2E83] mb-4 sm:mb-6 font-agrandir-grand">
            חנות
          </h1>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[#4B2E83] mx-auto mb-6 sm:mb-8"></div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">
            מוצרים מקצועיים לריקוד - נעליים, בגדים ואביזרים מותאמים אישית
          </p>
        </div>

        {/* Categories */}
        <div className="relative mb-6 sm:mb-8 px-2" role="navigation" aria-label="סינון לפי קטגוריה">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {topLevelCategories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveParentId(category.id);
                  setSelectedCategory(category.id);
                  setPage(1);
                }}
                aria-pressed={activeParentId === category.id}
                className={`px-3 sm:px-4 lg:px-6 py-2 rounded-full text-sm sm:text-base lg:text-lg font-medium transition-all duration-300 ${
                  activeParentId === category.id
                    ? 'bg-[#4B2E83] text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-[#EC4899]/20 hover:bg-[#4B2E83]/10 hover:border-[#EC4899]/40'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          {(activeParentId !== 'all' || selectedCategory !== 'all') && (
            <button
              onClick={() => { setActiveParentId('all'); setSelectedCategory('all'); setPage(1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border border-[#4B2E83]/30 text-[#4B2E83] bg-white hover:bg-[#4B2E83]/5 shadow-sm"
              aria-label="נקה בחירת קטגוריה"
              title="נקה בחירה"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Subcategories (always show for the selected parent) */}
        {activeParentId !== 'all' && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-2" role="navigation" aria-label="תת־קטגוריות">
            {categories.filter((c: any) => c.parent_id === activeParentId).map((sub: any) => (
              <button
                key={sub.id}
                onClick={() => { setSelectedCategory(sub.id); setPage(1); }}
                aria-pressed={selectedCategory === sub.id}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  selectedCategory === sub.id
                    ? 'bg-[#4B2E83] text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-[#EC4899]/20 hover:bg-[#4B2E83]/10 hover:border-[#EC4899]/40'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {visibleProducts.length === 0 && !isLoading && (
            <div className="col-span-full">
              <div className="bg-white rounded-2xl p-8 text-center border border-[#EC4899]/10">
                <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h4m0 0l-2-2m2 2l-2 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">אין מוצרים להצגה</h3>
                <p className="text-[#4B2E83]/70 text-sm">
                  {selectedCategoryObj ? `לא נמצאו מוצרים תחת "${selectedCategoryObj.name}"` : 'לא נמצאו מוצרים'}
                </p>
              </div>
            </div>
          )}
          {visibleProducts.map((product: any) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 sm:h-56 lg:h-64 xl:h-72 object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={handleImageError}
                />
                {product.isNew && (
                  <span className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-[#EC4899] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow">
                    מוצר חם
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-[#4B2E83] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow">
                    מומלץ
                  </span>
                )}
              </div>
              <div className="p-3 sm:p-4 lg:p-6 flex flex-col flex-grow">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                  {product.name}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 flex-grow line-clamp-3 min-h-[4.5rem]">
                  {product.description}
                </p>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-auto">
                  <span className="text-xl sm:text-2xl font-bold text-[#EC4899]">₪{product.price}</span>
                  <button
                    onClick={() => handleQuickView(product)}
                    className="w-full sm:w-auto bg-[#EC4899] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#EC4899]/80 transition-colors duration-300 text-sm sm:text-base"
                  >
                    צפה במוצר
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination for 'all' only */}
        {isAll && totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-2" aria-label="דיפדוף מוצרים">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 rounded-lg border border-[#4B2E83]/20 text-[#4B2E83] disabled:opacity-50 hover:bg-[#4B2E83]/5"
              aria-label="עמוד קודם"
            >
              הקודם
            </button>
            <span className="px-3 py-2 text-sm text-[#4B2E83]" aria-live="polite">
              עמוד {page} מתוך {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded-lg border border-[#4B2E83]/20 text-[#4B2E83] disabled:opacity-50 hover:bg-[#4B2E83]/5"
              aria-label="עמוד הבא"
            >
              הבא
            </button>
          </nav>
        )}

        {/* Quick View Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
              onClick={() => setSelectedProduct(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 pr-2">{selectedProduct.name}</h2>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    <div>
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
                        loading="lazy"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="space-y-4 sm:space-y-6">
                      <p className="text-sm sm:text-base text-gray-600">{selectedProduct.description}</p>
                      
                      {/* Size Selection */}
                      {selectedProduct.sizes && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">מידה</label>
                          <div className="flex flex-wrap gap-2">
                            {selectedProduct.sizes.map((size: string) => (
                              <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base ${
                                  selectedSize === size
                                    ? 'border-[#EC4899] bg-[#EC4899]/10 text-[#EC4899]'
                                    : 'border-gray-300 text-gray-700 hover:border-[#EC4899]'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Color Selection */}
                      {selectedProduct.colors && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">צבע</label>
                          <div className="flex flex-wrap gap-2">
                            {selectedProduct.colors.map((color: string) => (
                              <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base ${
                                  selectedColor === color
                                    ? 'border-[#EC4899] bg-[#EC4899]/10 text-[#EC4899]'
                                    : 'border-gray-300 text-gray-700 hover:border-[#EC4899]'
                                }`}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quantity Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">כמות</label>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="p-2 border rounded-lg hover:bg-gray-50 text-lg"
                          >
                            -
                          </button>
                          <span className="text-lg font-medium min-w-[2rem] text-center">{quantity}</span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="p-2 border rounded-lg hover:bg-gray-50 text-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price and Add to Cart */}
                      <div className="pt-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                          <span className="text-2xl font-bold text-[#EC4899]">₪{selectedProduct.price}</span>
                          <button
                            onClick={handleAddToCart}
                            className="w-full sm:w-auto bg-[#EC4899] text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-[#EC4899]/80 transition-colors duration-300 text-sm sm:text-base"
                          >
                            הוסף לסל
                          </button>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          {selectedProduct.features?.map((feature: string, index: number) => (
                            <div key={index} className="flex items-start text-sm sm:text-base text-gray-600">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShopPage; 