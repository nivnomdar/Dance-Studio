import React from 'react';
import { useCategories } from '../../hooks/useCategories';

type ProductRecord = {
  id: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  stock_quantity?: number | null;
  trending?: boolean | null;
  recommended?: boolean | null;
};

interface ProductDetailsSectionProps {
  product: ProductRecord;
}

const ProductDetailsSection: React.FC<ProductDetailsSectionProps> = ({ product }) => {
  const { categories } = useCategories();

  const categoryName = React.useMemo(() => {
    if (!product.category_id || !categories.length) return null;
    const category = categories.find(cat => cat.id === product.category_id);
    return category ? category.name : null;
  }, [product.category_id, categories]);

  return (
    <div>
      <style>{`
        .flame-svg { filter: drop-shadow(0 0 4px rgba(236,72,153,.5)); }
      `}</style>
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
        {(product.trending ?? false) && (
          <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10" aria-hidden="true" title="מוצר חם">
            <svg className="flame-svg w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="flameGradDetails" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#EC4899"/>
                  <stop offset="60%" stopColor="#F59E0B"/>
                  <stop offset="100%" stopColor="#FDBA74"/>
                </linearGradient>
              </defs>
              <path d="M12 2c2 3 5 4.5 5 8.5 0 3.59-2.91 6.5-6.5 6.5S4 14.09 4 10.5c0-1.7.66-3.25 1.76-4.41C7.12 4.67 8.3 3.94 9 3c-.2 1.6.4 2.6 1.5 3.5C11.7 5.6 12 4 12 2z" fill="url(#flameGradDetails)"/>
              <path d="M10.5 9.8c1.1.9 1.5 2 .8 3.2-.6 1-1.9 1.5-3 1-1-.5-1.6-1.8-1.2-2.9.3-.9 1-1.6 1.9-2 .1.8.6 1.2 1.5 1.7z" fill="#FFF3E0" opacity=".8"/>
            </svg>
            <span className="sr-only">מוצר חם</span>
          </div>
        )}
        {/* {(product.recommended ?? false) && (
          <span className="bg-[#4B2E83] text-white px-3 py-1 rounded-full text-xs shadow">מומלץ</span>
        )} */}
      </div>
      <p className="text-gray-600 mb-4">{product.description}</p>

      {categoryName && (
        <div className="text-sm text-gray-500">
          <span className="font-medium">קטגוריה:</span> {categoryName}
        </div>
      )}
    </div>
  );
};

export default ProductDetailsSection;
