import React from 'react';

type ProductRecord = {
  id: string;
  name: string;
  sizes?: string[] | null;
  colors?: string[] | null;
  heel_height?: string[] | null; // New: Heel height options
  sole_type?: string[] | null; // New: Sole type options
  materials?: string[] | null; // New: Materials options
};

interface ProductOptionsSelectorProps {
  product: ProductRecord;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}

const ProductOptionsSelector: React.FC<ProductOptionsSelectorProps> = ({ product, selectedSize, setSelectedSize, selectedColor, setSelectedColor }) => {
  return (
    <div className="space-y-4">
      {/* Size Selection */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">מידה (EU – אירופי)</label>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size: string) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                aria-label={`בחרי מידה ${size}`}
                className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#EC4899] ${selectedSize === size ? 'border-[#EC4899] bg-[#EC4899]/10 text-[#EC4899]' : 'border-gray-300 text-gray-700 hover:border-[#EC4899]'}`}
              >
                {size}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">המידות מוצגות לפי התקן האירופאי (EU).</p>
        </div>
      )}

      {/* Color Selection */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">צבע</label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color: string) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                aria-label={`בחרי צבע ${color}`}
                className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#EC4899] ${selectedColor === color ? 'border-[#EC4899] bg-[#EC4899]/10 text-[#EC4899]' : 'border-gray-300 text-gray-700 hover:border-[#EC4899]'}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductOptionsSelector;
