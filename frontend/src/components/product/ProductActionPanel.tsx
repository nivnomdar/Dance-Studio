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
  selectedHeelHeight: string;
  selectedSoleType: string;
  selectedMaterial: string;
}

const ProductActionPanel: React.FC<ProductActionPanelProps> = ({ product, selectedSize, selectedColor, selectedHeelHeight, selectedSoleType, selectedMaterial }) => {
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
    if (product.heel_height && product.heel_height.length > 0 && !selectedHeelHeight) {
      showPopup({ title: 'שגיאה', message: 'אנא בחרי גובה עקב', type: 'error', duration: 3000 });
      return;
    }
    if (product.sole_type && product.sole_type.length > 0 && !selectedSoleType) {
      showPopup({ title: 'שגיאה', message: 'אנא בחרי סוג סוליה', type: 'error', duration: 3000 });
      return;
    }
    if (product.materials && product.materials.length > 0 && !selectedMaterial) {
      showPopup({ title: 'שגיאה', message: 'אנא בחרי חומר', type: 'error', duration: 3000 });
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

    addToCart(mapped, quantity, selectedSize, selectedColor, selectedHeelHeight, selectedSoleType, selectedMaterial);
    showPopup({ title: 'הוספה לסל', message: `${product.name} נוסף לסל הקניות שלך`, type: 'success', duration: 3000 });
  };

  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity !== null && product.stock_quantity <= 0;
  const canAddToCart = !isOutOfStock && quantity > 0 && (!product.stock_quantity || quantity <= product.stock_quantity);

  return (
    <div className="space-y-6">
      <div className="text-2xl lg:text-3xl font-bold text-[#EC4899]">₪{product.price}</div>

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
                סה"כ: ₪{(Number(product.price) * quantity).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5">
        <button 
          onClick={handleAddToCart} 
          className="bg-[#EC4899] text-white px-6 py-3 lg:px-7 lg:py-3.5 rounded-lg hover:bg-[#EC4899]/80 disabled:opacity-50 disabled:cursor-not-allowed lg:text-lg focus:ring-4 focus:ring-[#EC4899]/30"
          disabled={!canAddToCart || 
                    (!!product.sizes && product.sizes.length > 0 && !selectedSize) || 
                    (!!product.colors && product.colors.length > 0 && !selectedColor) ||
                    (!!product.heel_height && product.heel_height.length > 0 && !selectedHeelHeight) ||
                    (!!product.sole_type && product.sole_type.length > 0 && !selectedSoleType) ||
                    (!!product.materials && product.materials.length > 0 && !selectedMaterial)}
          aria-label="הוסף את המוצר לסל הקניות"
        >
          הוסף לסל
        </button>
        <button onClick={() => navigate('/cart')} className="border border-[#4B2E83]/20 text-[#4B2E83] px-6 py-3 lg:px-7 lg:py-3.5 rounded-lg hover:bg-[#4B2E83]/5 lg:text-lg focus:ring-2 focus:ring-offset-2 focus:ring-[#4B2E83]" aria-label="מעבר לעמוד סל הקניות">
          מעבר לסל
        </button>
      </div>
    </div>
  );
};

export default ProductActionPanel;
