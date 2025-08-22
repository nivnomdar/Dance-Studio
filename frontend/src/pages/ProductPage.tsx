import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import { usePopup } from '../contexts/PopupContext';

type ProductRecord = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  main_image?: string | null;
  gallery_images?: string[] | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  trending?: boolean | null;
  recommended?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const buildImageUrl = (url?: string | null, ts?: string | null) => {
  if (!url) return '';
  if (!ts) return url;
  const ver = new Date(ts).getTime();
  return `${url}${url.includes('?') ? '&' : '?'}v=${ver}`;
};

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showPopup } = usePopup();

  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
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

  const allImages = useMemo(() => {
    if (!product) return [] as string[];
    const verTs = product.updated_at || product.created_at || undefined;
    const main = buildImageUrl(product.main_image || '', verTs || null);
    const gallery = Array.isArray(product.gallery_images) ? product.gallery_images : [];
    const processed = [main, ...gallery.map((g) => buildImageUrl(g, verTs || null))].filter(Boolean);
    return processed.length ? processed : [''];
  }, [product]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPuaJp+ihjOaTjeS9nPC90ZXh0Pgo8L3N2Zz4=';
    target.onerror = null;
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      showPopup({ title: 'שגיאה', message: 'אנא בחרי מידה', type: 'error', duration: 3000 });
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      showPopup({ title: 'שגיאה', message: 'אנא בחרי צבע', type: 'error', duration: 3000 });
      return;
    }

    const mapped = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      image: buildImageUrl(product.main_image || '', product.updated_at || product.created_at || null),
      sizes: (product.sizes as string[] | undefined) || undefined,
      colors: (product.colors as string[] | undefined) || undefined,
      features: [] as string[],
    } as any;

    addToCart(mapped, quantity, selectedSize, selectedColor);
    showPopup({ title: 'הוספה לסל', message: `${product.name} נוסף לסל הקניות שלך`, type: 'success', duration: 3000 });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-[#4B2E83]">טוען מוצר…</div>
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

  const trending = !!(product.trending ?? false);
  const recommended = !!(product.recommended ?? false);

  return (
    <div className="bg-gray-50 py-6 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-[#4B2E83] hover:underline text-sm">
            חזרה לחנות
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <div>
            <div className="relative flex items-center justify-center rounded-2xl overflow-hidden bg-white border border-[#EC4899]/10 p-2 shadow-sm">
              <img
                src={allImages[activeImageIdx]}
                alt={product.name}
                className="h-auto max-h-72 sm:max-h-96 w-auto object-contain rounded-xl"
                onError={handleImageError}
                loading="lazy"
              />
            </div>

            {allImages.length > 1 && (
              <div className="mt-3 flex justify-center">
                <div className="flex flex-wrap gap-2">
                  {allImages.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      aria-pressed={activeImageIdx === idx}
                      className={`rounded-md overflow-hidden ring-1 ${activeImageIdx === idx ? 'ring-[#4B2E83]' : 'ring-transparent'}`}
                      title={`תמונה ${idx + 1}`}
                    >
                      <img src={src} alt="" className="h-12 w-12 object-contain bg-gray-50" onError={handleImageError} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:pl-4">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
              {trending && (
                <span className="bg-[#EC4899] text-white px-3 py-1 rounded-full text-xs shadow">מוצר חם</span>
              )}
              {recommended && (
                <span className="bg-[#4B2E83] text-white px-3 py-1 rounded-full text-xs shadow">מומלץ</span>
              )}
            </div>
            <p className="text-gray-600 mb-4">{product.description}</p>

            <div className="text-2xl font-bold text-[#EC4899] mb-6">₪{product.price}</div>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">מידה (EU – אירופי)</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 border rounded-lg text-sm ${selectedSize === size ? 'border-[#EC4899] bg-[#EC4899]/10 text-[#EC4899]' : 'border-gray-300 text-gray-700 hover:border-[#EC4899]'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">המידות מוצגות לפי התקן האירופאי (EU).</p>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">צבע</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-2 border rounded-lg text-sm ${selectedColor === color ? 'border-[#EC4899] bg-[#EC4899]/10 text-[#EC4899]' : 'border-gray-300 text-gray-700 hover:border-[#EC4899]'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">כמות</label>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 border rounded-lg hover:bg-gray-50 text-lg">-</button>
                <span className="text-lg font-medium min-w-[2rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 border rounded-lg hover:bg-gray-50 text-lg">+</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleAddToCart} className="bg-[#EC4899] text-white px-6 py-3 rounded-lg hover:bg-[#EC4899]/80">
                הוסף לסל
              </button>
              <button onClick={() => navigate('/cart')} className="border border-[#4B2E83]/20 text-[#4B2E83] px-6 py-3 rounded-lg hover:bg-[#4B2E83]/5">
                מעבר לסל
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;


