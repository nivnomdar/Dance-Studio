import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();

  const calculateSubtotal = () => {
    return getCartTotal();
  };

  const calculateShipping = () => {
    return cartItems.length > 0 ? 29 : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

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
          <p className="text-gray-600">בדקי את המוצרים שלך והמשיכי לרכישה</p>
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
                      <div className="flex items-start">
                        {/* Product Image Container */}
                        <div className="flex-shrink-0 mr-8">
                          <div className="w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Vertical Divider */}
                        <div className="w-px h-32 bg-gray-200 mx-4"></div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0 pl-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 font-agrandir-grand">
                                {item.product.name}
                              </h3>
                              <p className="text-gray-600 mb-3 leading-relaxed">
                                {item.product.description}
                              </p>
                              
                              {/* Product Specifications */}
                              <div className="flex flex-wrap gap-4 mb-4">
                                {item.size && (
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <span className="text-sm font-medium text-gray-500">מידה:</span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                      {item.size}
                                    </span>
                                  </div>
                                )}
                                {item.color && (
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <span className="text-sm font-medium text-gray-500">צבע:</span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                      {item.color}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Price */}
                            <div className="text-right ml-6 p-4 min-w-[120px]">
                              <p className="text-sm text-gray-500 mb-1">מחיר ליחידה</p>
                              <p className="text-2xl font-bold text-[#EC4899] mb-2">
                                ₪{item.product.price}
                              </p>
                              <div className="border-t border-gray-200 pt-2">
                                <p className="text-sm text-gray-600">סכום כולל</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  ₪{item.product.price * item.quantity}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Quantity Controls and Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-6 space-x-reverse">
                              <div className="flex items-center space-x-3 space-x-reverse">
                                <span className="text-sm font-medium text-gray-700">כמות:</span>
                                <div className="flex items-center bg-gray-50 rounded-lg p-1">
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-[#EC4899] transition-all duration-200 font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="w-12 text-center text-gray-900 font-bold text-lg mx-2">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-[#EC4899] transition-all duration-200 font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              
                              <div className="w-px h-8 bg-gray-200 mx-2"></div>
                              
                              <span className="text-sm text-gray-500 ml-2">
                                סה"כ יחידות: {item.quantity}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="flex items-center space-x-2 space-x-reverse text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200 hover:bg-red-50 px-3 py-2 rounded-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>הסר מהסל</span>
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
                      // TODO: יש להוסיף דף תשלום ולהוסיף ניווט אליו
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