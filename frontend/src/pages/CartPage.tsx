import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types/product';

interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // טעינת מוצרים מהסל (בינתיים נתחיל עם דוגמה)
    const loadCartItems = () => {
      // TODO: טעינה מ-localStorage או Supabase
             const mockCartItems: CartItem[] = [
         {
           product: {
             id: 1,
             name: 'נעלי ריקוד מקצועיות',
             price: 299,
             description: 'נעלי ריקוד מקצועיות לסטודיו',
             image: '/images/gallery1.jpg',
             category: 'shoes',
             rating: 4.5,
             reviews: { 
               count: 12,
               comments: []
             },
             isNew: false,
             isBestSeller: true,
             sizes: ['36', '37', '38', '39'],
             colors: ['שחור', 'לבן'],
             features: ['נוחות מרבית', 'איכות גבוהה'],
             inStock: true
           },
           quantity: 2,
           size: '37',
           color: 'שחור'
         },
         {
           product: {
             id: 2,
             name: 'חולצת ריקוד אלגנטית',
             price: 159,
             description: 'חולצת ריקוד אלגנטית לסטודיו',
             image: '/images/gallery1.jpg',
             category: 'clothing',
             rating: 4.2,
             reviews: { 
               count: 8,
               comments: []
             },
             isNew: true,
             isBestSeller: false,
             sizes: ['S', 'M', 'L'],
             colors: ['ורוד', 'שחור'],
             features: ['אלגנטי', 'נוח'],
             inStock: true
           },
           quantity: 1,
           size: 'M',
           color: 'ורוד'
         }
       ];
      
      setCartItems(mockCartItems);
      setIsLoading(false);
    };

    loadCartItems();
  }, []);

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    return cartItems.length > 0 ? 29 : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
          <p className="text-gray-600">טוען סל קניות...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                <circle cx="9" cy="12" r="1" />
                <circle cx="15" cy="12" r="1" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">הסל שלך ריק</h2>
            <p className="text-gray-600 mb-8">אין לך מוצרים בסל הקניות שלך</p>
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#EC4899] hover:bg-[#EC4899]/80 transition-colors duration-200"
            >
              המשך בקניות
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#EC4899] mb-2 font-agrandir-grand">סל קניות</h1>
          <p className="text-gray-600">בדוק את המוצרים שלך והמשך לרכישה</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">מוצרים בסל ({cartItems.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-6"
                    >
                      <div className="flex items-center space-x-4 space-x-reverse">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-1">
                                {item.product.name}
                              </h3>
                              <p className="text-sm text-gray-500 mb-2">
                                {item.product.description}
                              </p>
                              {item.size && (
                                <p className="text-sm text-gray-500">מידה: {item.size}</p>
                              )}
                              {item.color && (
                                <p className="text-sm text-gray-500">צבע: {item.color}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-[#EC4899]">
                                ₪{item.product.price}
                              </p>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                              >
                                -
                              </button>
                              <span className="w-12 text-center text-gray-900 font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                            >
                              הסר מהסל
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm sticky top-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">סיכום הזמנה</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">סכום ביניים</span>
                    <span className="text-gray-900">₪{calculateSubtotal()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">משלוח</span>
                    <span className="text-gray-900">₪{calculateShipping()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">סה"כ לתשלום</span>
                      <span className="text-[#EC4899]">₪{calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    className="w-full bg-[#EC4899] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#EC4899]/80 transition-colors duration-200"
                    onClick={() => {
                      // TODO: ניווט לדף התשלום
                      console.log('Proceeding to checkout...');
                    }}
                  >
                    המשך לרכישה
                  </button>
                  <Link
                    to="/shop"
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 text-center block"
                  >
                    המשך בקניות
                  </Link>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-sm text-gray-500">
                  <p className="mb-2">✓ משלוח חינם בקנייה מעל ₪200</p>
                  <p className="mb-2">✓ החזר כספי תוך 30 יום</p>
                  <p>✓ תמיכה 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 