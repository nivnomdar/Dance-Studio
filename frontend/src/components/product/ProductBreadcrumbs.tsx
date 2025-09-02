import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { FaHome } from 'react-icons/fa';
import { FiChevronLeft } from 'react-icons/fi'; // Import a more modern arrow icon
import { FaShoppingBag } from 'react-icons/fa'; // Import an icon for 'Shop'

type ProductRecord = {
  id: string;
  name: string;
  category_id?: string | null;
};

interface ProductBreadcrumbsProps {
  product: ProductRecord;
}

const BreadcrumbSeparator: React.FC = () => (
  <FiChevronLeft className="mx-2 text-[#4B2E83] w-4 h-4" />
);

const ProductBreadcrumbs: React.FC<ProductBreadcrumbsProps> = ({ product }) => {
  const { categories } = useCategories();

  const category = React.useMemo(() => {
    if (!product.category_id || !categories.length) return null;
    return categories.find(cat => cat.id === product.category_id);
  }, [product.category_id, categories]);

  return (
    <nav className="text-xs sm:text-sm text-gray-600 mb-6 text-center pt-4" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex items-center gap-2 justify-center">
        <li className="flex items-center group">
          <Link to="/" className="flex items-center text-[#4B2E83] hover:text-[#EC4899] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EC4899] rounded-md px-2 py-1">
            <FaHome className="w-4 h-4 mr-1" />
            ראשי
          </Link>
          <BreadcrumbSeparator />
        </li>
        <li className="flex items-center group">
          <Link to="/shop" className="flex items-center text-[#4B2E83] hover:text-[#EC4899] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EC4899] rounded-md px-2 py-1">
            <FaShoppingBag className="w-4 h-4 mr-1" />
            חנות
          </Link>
          <BreadcrumbSeparator />
        </li>
        {category && (
          <li className="flex items-center group">
            <Link to={`/shop?category=${category.id}`} className="text-[#4B2E83] hover:text-[#EC4899] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EC4899] rounded-md px-2 py-1">
              {category.name}
            </Link>
            <BreadcrumbSeparator />
          </li>
        )}
        <li>
          <span className="text-[#4B2E83] font-bold text-base bg-[#EC4899]/10 px-3 py-1 rounded-md" aria-current="page">
            {product.name}
          </span>
        </li>
      </ol>
    </nav>
  );
};

export default ProductBreadcrumbs;
