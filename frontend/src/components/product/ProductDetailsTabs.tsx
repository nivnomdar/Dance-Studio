import React, { useState } from 'react';

type ProductRecord = {
  id: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  stock_quantity?: number | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  heel_height?: string[] | null;
  sole_type?: string[] | null;
  materials?: string[] | null;
  trending?: boolean | null;
  recommended?: boolean | null;
  sku?: string | null;
  warranty?: string | null; // New: Warranty information
  country_of_origin?: string | null; // New: Country of Origin
};

interface ProductDetailsTabsProps {
  product: ProductRecord;
  selectedSize: string;
  selectedColor: string;
}

const ProductDetailsTabs: React.FC<ProductDetailsTabsProps> = ({ product, selectedSize, selectedColor }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'shipping' | 'policy' | 'faq'>('details');

  return (
    <div className="mt-8">
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'details'
              ? 'border-b-2 border-[#EC4899] text-[#EC4899]'
              : 'text-gray-500 hover:text-gray-700'
          } focus:outline-none`}
          onClick={() => setActiveTab('details')}
        >
          פרטי המוצר
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'shipping'
              ? 'border-b-2 border-[#EC4899] text-[#EC4899]'
              : 'text-gray-500 hover:text-gray-700'
          } focus:outline-none`}
          onClick={() => setActiveTab('shipping')}
        >
          משלוח ואספקה
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'policy'
              ? 'border-b-2 border-[#EC4899] text-[#EC4899]'
              : 'text-gray-500 hover:text-gray-700'
          } focus:outline-none`}
          onClick={() => setActiveTab('policy')}
        >
          מדיניות והחזרות
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'faq'
              ? 'border-b-2 border-[#EC4899] text-[#EC4899]'
              : 'text-gray-500 hover:text-gray-700'
          } focus:outline-none`}
          onClick={() => setActiveTab('faq')}
        >
          שאלות נפוצות
        </button>
      </div>

      {/* Tabs Content */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        {activeTab === 'details' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">פרטי המוצר:</h3>
            <ul className="text-gray-700 space-y-1">
              {selectedSize && (
                <li><span className="font-medium">מידה נבחרה:</span> {selectedSize}</li>
              )}
              {selectedColor && (
                <li><span className="font-medium">צבע נבחר:</span> {selectedColor}</li>
              )}
              {product.sku && (
                <li><span className="font-medium">מק"ט:</span> {product.sku}</li>
              )}
              {product.heel_height && product.heel_height.length > 0 && (
                <li><span className="font-medium">גובה עקב:</span> {product.heel_height.join(', ')}</li>
              )}
              {product.sole_type && product.sole_type.length > 0 && (
                <li><span className="font-medium">סוג סוליה:</span> {product.sole_type.join(', ')}</li>
              )}
              {product.materials && product.materials.length > 0 && (
                <li><span className="font-medium">חומר:</span> {product.materials.join(', ')}</li>
              )}
              {product.warranty && (
                <li><span className="font-medium">אחריות:</span> {product.warranty}</li>
              )}
              {product.country_of_origin && (
                <li><span className="font-medium">ארץ ייצור:</span> {product.country_of_origin}</li>
              )}
              {product.description && (
                <li><span className="font-medium">תיאור:</span> {product.description}</li>
              )}
            </ul>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">משלוח ואספקה:</h3>
            <ul className="text-gray-700 space-y-1">
              <li><span className="font-medium">עלות משלוח:</span> משלוח חינם לישראל</li>
              <li><span className="font-medium">זמן אספקה:</span> בין 6 ל-14 ימי עסקים</li>
              <li><span className="font-medium">שיטות משלוח:</span> שליח עד הבית, אפשרויות נוספות בהמשך אם רלוונטי</li>
              <li><span className="font-medium">עלויות נוספות:</span> ללא עלויות נוספות.</li>
            </ul>
            {/* Trust Badges / Security Symbols */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-2">סימוני אמון ובטיחות:</h4>
              <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.01-.138 1.99-.398 2.942C19.539 19.141 15.109 21 12 21c-3.109 0-7.539-1.859-8.602-6.058C3.138 13.99 3 13.01 3 12c0-5.523 4.477-10 10-10 2.535 0 4.888.948 6.702 2.518L21 3" />
                  </svg>
                  תשלום מאובטח SSL
                </div>
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-blue-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.01-.138 1.99-.398 2.942C19.539 19.141 15.109 21 12 21c-3.109 0-7.539-1.859-8.602-6.058C3.138 13.99 3 13.01 3 12c0-5.523 4.477-10 10-10 2.535 0 4.888.948 6.702 2.518L21 3" />
                  </svg>
                  תו תקן ישראלי
                </div>
                {/* Add more trust badges as needed */}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'policy' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">פרטי עסק:</h3>
            {/* Supplier/Business Details */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-1">פרטי הספק/העסק:</h4>
              <ul className="text-gray-700 space-y-1">
                <li><span className="font-medium">שם העסק המלא:</span> אביגיל דאנס סטודיו</li>
                <li><span className="font-medium">מספר עוסק מורשה:</span> 123456789 (דוגמה)</li>
                <li><span className="font-medium">טלפון:</span> 05X-XXXXXXX</li>
                <li><span className="font-medium">מייל:</span> info@abigaildance.co.il</li>
                <li><span className="font-medium">כתובת:</span> רחוב הדוגמה 1, תל אביב</li>
                <li className="flex items-center gap-2 mt-4">
                  <span className="font-medium">עקבי אחרינו:</span>
                  <a href="https://wa.me/YOUR_PHONE_NUMBER" target="_blank" rel="noopener noreferrer" className="group relative p-2.5 rounded-full bg-[#25D366] hover:bg-[#22C55E] transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-green-500/25" aria-label="וואטסאפ העסק">
                    <svg className="w-5 h-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/avigailladani/" target="_blank" rel="noopener noreferrer" className="group relative p-2.5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25" aria-label="אינסטגרם העסק">
                    <svg className="w-5 h-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
            {/* Return and Cancellation Policy Summary with Link */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-1">מדיניות החזרות וביטולים:</h4>
              <p className="text-gray-700 mb-2">
                ניתן לבטל עסקה ולהחזיר מוצרים תוך 14 יום מיום קבלת המוצר, בהתאם לחוק הגנת הצרכן.
              </p>
              <div className="mt-2">
                <a href="/privacy-policy" className="text-[#EC4899] hover:underline font-medium text-sm">
                  למדיניות הפרטיות המלאה לחצי כאן
                </a>
              </div>
              <div className="mt-2">
                <a href="/terms-of-service" className="text-[#EC4899] hover:underline font-medium text-sm">
                  לתנאי השימוש המלאים לחצי כאן
                </a>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'faq' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">שאלות נפוצות:</h3>
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-medium mb-1">מה זמן האספקה המשוער?</h4>
                <p>זמן האספקה המשוער הוא בין 6 ל-14 ימי עסקים מרגע אישור ההזמנה.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">האם יש אחריות על המוצר?</h4>
                <p>למוצר זה ניתנת אחריות יצרן למשך 12 חודשים. פרטים נוספים ניתן למצוא במדיניות האחריות.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">מאיזה חומרים המוצר עשוי?</h4>
                <p>המוצר עשוי מ<span>{product.materials && product.materials.length > 0 ? product.materials.join(', ') : 'חומרים איכותיים'}</span> (דוגמה). פרטים ספציפיים מפורטים בלשונית 'פרטי המוצר'.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">איך לתחזק את המוצר?</h4>
                <p>מומלץ לנקות את המוצר במטלית לחה בלבד ולהימנע מחשיפה ישירה לשמש לאורך זמן.</p>
              </div>
              {/* Add more FAQ items as needed */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsTabs;
