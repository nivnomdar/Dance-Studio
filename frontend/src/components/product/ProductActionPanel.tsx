import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { usePopup } from '../../contexts/PopupContext';

type ProductRecord = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  main_image?: string | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  heel_height?: string[] | null;
  sole_type?: string[] | null;
  materials?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  stock_quantity?: number | null;
};

interface ProductActionPanelProps {
  product: ProductRecord;
  selectedSize: string;
  selectedColor: string;
}

const ProductActionPanel: React.FC<ProductActionPanelProps> = ({ product, selectedSize, selectedColor }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showPopup } = usePopup();

  const [quantity, setQuantity] = React.useState<number>(1);

  React.useEffect(() => {
    if (product.stock_quantity !== undefined && product.stock_quantity !== null && quantity > product.stock_quantity) {
      setQuantity(Math.max(1, product.stock_quantity));
    } else if (product.stock_quantity === 0) {
        setQuantity(0);
    }
  }, [product.stock_quantity, quantity]);

  const buildImageUrl = (url?: string | null, ts?: string | null) => {
    if (!url) return '';
    if (!ts) return url;
    const ver = new Date(ts).getTime();
    return `${url}${url.includes('?') ? '&' : '?'}v=${ver}`;
  };

  const handleAddToCart = () => {
    if (!product || product.stock_quantity === 0 || quantity === 0) return;
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      showPopup({ title: 'שגיאה', message: 'אנא בחרי מידה', type: 'error', duration: 3000 });
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      showPopup({ title: 'שגיאה', message: 'אנא בחרי צבע', type: 'error', duration: 3000 });
      return;
    }
    if (product.stock_quantity && quantity > product.stock_quantity) {
        showPopup({ title: 'שגיאה', message: `לא ניתן להוסיף יותר מ-${product.stock_quantity} יחידות במלאי.`, type: 'error', duration: 3000 });
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
      heel_height: (product.heel_height as string[] | undefined) || undefined,
      sole_type: (product.sole_type as string[] | undefined) || undefined,
      materials: (product.materials as string[] | undefined) || undefined,
      features: [] as string[],
    } as any;

    addToCart(mapped, quantity, selectedSize, selectedColor, product.heel_height?.[0] || '', product.sole_type?.[0] || '', product.materials?.[0] || '');
    showPopup({ title: 'הוספה לסל', message: `${product.name} נוסף לסל הקניות שלך`, type: 'success', duration: 3000 });
  };

  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity !== null && product.stock_quantity <= 0;
  const canAddToCart = !isOutOfStock && quantity > 0 && (!product.stock_quantity || quantity <= product.stock_quantity);

  return (
    <div className="space-y-6">
      <div className="text-2xl lg:text-3xl font-bold text-[#EC4899]">₪{product.price} <span className="text-base text-gray-500 font-normal">כולל מע"מ</span></div>

      {/* Stock Quantity Display */}
      {product.stock_quantity !== undefined && product.stock_quantity !== null && (
        <div className="text-sm text-gray-500">
          {product.stock_quantity > 5 ? (
            <span className="text-green-600 font-medium">במלאי</span>
          ) : product.stock_quantity > 0 && product.stock_quantity <= 5 ? (
            <span className="text-orange-500 font-medium">נשארו רק {product.stock_quantity} יחידות!</span>
          ) : (
            <span className="text-red-600 font-medium">אזל מהמלאי</span>
          )}
        </div>
      )}

      {/* Quantity Selection */}
      {!isOutOfStock && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">כמות</label>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              disabled={quantity <= 1}
              className="p-2 border rounded-lg hover:bg-gray-50 text-lg disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-[#EC4899]"
            >
              -
            </button>
            <span className="text-lg font-medium font-semibold min-w-[2rem] text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(prev => Math.min(product.stock_quantity || Infinity, prev + 1))}
              disabled={quantity >= (product.stock_quantity || Infinity)}
              className="p-2 border rounded-lg hover:bg-gray-50 text-lg disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-[#EC4899]"
            >
              +
            </button>
            {product.price && (
              <span className="text-lg font-bold text-[#4B2E83] ml-4">
                סה"כ: ₪{(Number(product.price) * quantity).toLocaleString()} <span className="text-base text-gray-500 font-normal">כולל מע"מ</span>
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-5 flex-wrap">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5">
          <button 
            onClick={handleAddToCart} 
            className="bg-[#EC4899] text-white px-6 py-3 lg:px-7 lg:py-3.5 rounded-lg hover:bg-[#EC4899]/80 disabled:opacity-50 disabled:cursor-not-allowed lg:text-lg focus:ring-4 focus:ring-[#EC4899]/30"
            disabled={!canAddToCart || 
                      (product.sizes && product.sizes.length > 0 && !selectedSize) || 
                      (product.colors && product.colors.length > 0 && !selectedColor) ||
                      (product.heel_height != null && product.heel_height.length > 0 && !product.heel_height[0]) ||
                      (product.sole_type != null && product.sole_type.length > 0 && !product.sole_type[0]) ||
                      (product.materials != null && product.materials.length > 0 && !product.materials[0])}
            aria-label="הוסף את המוצר לסל הקניות"
          >
            הוסיפי לסל
          </button>
          <button onClick={() => navigate('/cart')} className="border border-[#4B2E83]/20 text-[#4B2E83] px-6 py-3 lg:px-7 lg:py-3.5 rounded-lg hover:bg-[#4B2E83]/5 lg:text-lg focus:ring-2 focus:ring-offset-2 focus:ring-[#4B2E83]" aria-label="מעבר לעמוד סל הקניות">
            מעבר לסל
          </button>
        </div>
        {/* Share Buttons */}
        <div className="flex gap-3 sm:gap-4 items-center">
          <span className="text-gray-700 font-medium">שתפי:</span>
          {/* WhatsApp Share Button */}
          <a 
            href={`https://api.whatsapp.com/send?text=היי! ראי איזה מוצר מדהים מצאתי: ${product.name} - ${window.location.href}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative p-2.5 rounded-full bg-[#25D366] hover:bg-[#22C55E] transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-green-500/25"
            aria-label="שתפי בוואטסאפ"
          >
            <svg className="w-5 h-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          </a>
          
          {/* Instagram Share Button - Direct link to profile for now, as no direct share URL for products on web */}
          <a 
            href="https://www.instagram.com/avigailladani?igsh=MXc4ZXU5cGdsM3U2cw==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative p-2.5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25"
            aria-label="עקבי אחרי באינסטגרם"
          >
            <svg className="w-5 h-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductActionPanel;
