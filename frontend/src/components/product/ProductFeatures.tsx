import React from 'react';

interface ProductFeaturesProps {
  features?: string[] | null;
}

const ProductFeatures: React.FC<ProductFeaturesProps> = ({ features }) => {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4">מאפיינים מרכזיים</h3>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start text-gray-700 text-base">
            <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductFeatures;
