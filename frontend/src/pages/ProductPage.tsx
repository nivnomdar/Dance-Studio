import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../lib/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProductImageGallery from '../components/product/ProductImageGallery';
import ProductOptionsSelector from '../components/product/ProductOptionsSelector';
import ProductActionPanel from '../components/product/ProductActionPanel';
import ProductDetailsSection from '../components/product/ProductDetailsSection';
import ProductFeatures from '../components/product/ProductFeatures';
import ProductBreadcrumbs from '../components/product/ProductBreadcrumbs';
import RelatedProductsSection from '../components/product/RelatedProductsSection';
import { FiChevronLeft } from 'react-icons/fi';

type ProductRecord = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  main_image?: string | null;
  gallery_images?: string[] | null;
  sizes?: string[] | null; // Assumed to exist from API
  colors?: string[] | null; // Assumed to exist from API
  trending?: boolean | null;
  recommended?: boolean | null;
  category_id?: string | null;
  stock_quantity?: number | null;
  features?: string[] | null; // New: Product features
  created_at?: string | null;
  updated_at?: string | null;
};

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const { addToCart } = useCart(); // Keep for passing to action panel
  // const { showPopup } = usePopup(); // Keep for passing to action panel

  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) {
          setError('מוצר לא נמצא');
          return;
        }
        const data = await apiService.shop.getProductById(id);
        if (!mounted) return;
        if (!data) {
          setError('המוצר לא קיים או הוסר');
          setProduct(null);
          return;
        }
        setProduct(data as ProductRecord);
        // preselect first size/color if available
        const sizes = (data as ProductRecord).sizes || [];
        const colors = (data as ProductRecord).colors || [];
        setSelectedSize(sizes?.[0] || '');
        setSelectedColor(colors?.[0] || '');
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'שגיאה בטעינת מוצר');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white border border-[#EC4899]/10 rounded-xl p-6 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-[#4B2E83] mb-2">שגיאה</h2>
          <p className="text-gray-600 mb-4">{error || 'לא נמצאו פרטי המוצר'}</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg bg-[#4B2E83] text-white">
            חזרה
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-6 sm:py-8 lg:py-16 relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <button onClick={() => navigate(-1)} className="absolute top-6 right-3 sm:right-4 lg:right-8 flex items-center gap-1 px-3 py-1.5 rounded-md text-[#4B2E83] hover:text-[#EC4899] hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EC4899] text-sm md:text-base cursor-pointer sm:hidden">
          <FiChevronLeft className="w-4 h-4" />
          חזור
        </button>
        <ProductBreadcrumbs product={product} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <div>
            <ProductImageGallery
              product={product}
              activeImageIdx={activeImageIdx}
              setActiveImageIdx={setActiveImageIdx}
            />
          </div>

          <div className="lg:pl-4">
            <ProductDetailsSection product={product} />
            
            {/* Product Features */}
            <ProductFeatures features={product.features} />

            <div className="mt-6">
              <ProductOptionsSelector
                product={product}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
            </div>
            
            <div className="mt-6">
              <ProductActionPanel
                product={product}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
              />
            </div>
          </div>
        </div>
      </div>
      <RelatedProductsSection currentProductId={product.id} categoryId={product.category_id} />
    </div>
  );
};

export default ProductPage;


