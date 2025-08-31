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

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };
  
  const fadeInUp = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] } }
  };

  if (cartItems.length === 0) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 py-8 sm:py-12"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeInUp} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <svg className="mx-auto h-16 w-16 sm:h-24 sm:w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                <circle cx="9" cy="12" r="1" />
                <circle cx="15" cy="12" r="1" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">הסל שלך ריק</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">אין לך מוצרים בסל הקניות שלך</p>
            <Link
              to="/shop"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-[#EC4899] hover:bg-[#EC4899]/80 transition-colors duration-200"
            >
              המשך בקניות
            </Link>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-8 sm:py-12"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div variants={fadeInUp} className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4B2E83] mb-2 font-agrandir-grand">סל קניות</h1>
          <p className="text-sm sm:text-base text-gray-600">בדקי את המוצרים שלך והמשיכי לרכישה</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">מוצרים בסל ({cartItems.length})</h2>
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
                      className="p-3 sm:p-4 lg:p-6"
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6">
                        {/* Product Image Container */}
                        <div className="flex-shrink-0 w-full sm:w-auto">
                          <div className="w-20 h-20 sm:w-24 lg:w-32 sm:h-24 lg:h-32 bg-gray-50 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPuaJp+ihjOaTjeS9nDwvdGV4dD4KPC9zdmc+';
                              }}
                            />
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col lg:flex-row justify-between items-start gap-2 sm:gap-4">
                            <div className="flex-1">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 font-agrandir-grand">
                                {item.product.name}
                              </h3>
                              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-2 sm:mb-3 leading-relaxed line-clamp-2">
                                {item.product.description}
                              </p>
                              
                              {/* Product Specifications */}
                              <div className="flex flex-wrap gap-1 sm:gap-2 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
                                {item.size && (
                                  <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse">
                                    <span className="text-xs sm:text-sm font-medium text-gray-500">מידה:</span>
                                    <span className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium">
                                      {item.size}
                                    </span>
                                  </div>
                                )}
                                {item.color && (
                                  <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse">
                                    <span className="text-xs sm:text-sm font-medium text-gray-500">צבע:</span>
                                    <span className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium">
                                      {item.color}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Price */}
                            <div className="text-right p-2 sm:p-3 lg:p-4 min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] bg-gray-50 rounded-lg">
                              <p className="text-xs sm:text-sm text-gray-500 mb-1">מחיר ליחידה</p>
                              <p className="text-sm sm:text-lg lg:text-2xl font-bold text-[#EC4899] mb-1 sm:mb-2">
                                ₪{item.product.price}
                              </p>
                              <div className="border-t border-gray-200 pt-1 sm:pt-2">
                                <p className="text-xs sm:text-sm text-gray-600">סכום כולל</p>
                                <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                                  ₪{item.product.price * item.quantity}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Quantity Controls and Actions */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 sm:pt-3 lg:pt-4 border-t border-gray-100 gap-2 sm:gap-3 lg:gap-0">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 sm:space-x-reverse w-full sm:w-auto">
                              <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
                                <span className="text-xs sm:text-sm font-medium text-gray-700">כמות:</span>
                                <div className="flex items-center bg-gray-50 rounded-lg p-0.5 sm:p-1">
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-[#EC4899] transition-all duration-200 font-bold text-xs sm:text-sm lg:text-base"
                                  >
                                    -
                                  </button>
                                  <span className="w-6 sm:w-8 lg:w-12 text-center text-gray-900 font-bold text-xs sm:text-sm lg:text-lg mx-0.5 sm:mx-1 lg:mx-2">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-[#EC4899] transition-all duration-200 font-bold text-xs sm:text-sm lg:text-base"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              
                              <span className="text-xs sm:text-sm text-gray-500">
                                סה"כ יחידות: {item.quantity}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="flex items-center space-x-1 sm:space-x-2 space-x-reverse text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium transition-colors duration-200 hover:bg-red-50 px-1.5 sm:px-2 lg:px-3 py-1 sm:py-2 rounded-lg w-full sm:w-auto justify-center sm:justify-start"
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </motion.div>

          {/* Order Summary */}
          <motion.div variants={fadeInUp} className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm sticky top-4">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">סיכום הזמנה</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">סכום ביניים</span>
                    <span className="text-gray-900">₪{calculateSubtotal()}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">משלוח</span>
                    <span className="text-gray-900">₪{calculateShipping()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 sm:pt-4">
                    <div className="flex justify-between text-base sm:text-lg font-semibold">
                      <span className="text-gray-900">סה"כ לתשלום</span>
                      <span className="text-[#EC4899]">₪{calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 space-y-3">
                  <button
                    className="w-full bg-[#EC4899] text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:bg-[#EC4899]/80 transition-colors duration-200 text-sm sm:text-base"
                    onClick={() => {
                      // TODO: יש להוסיף דף תשלום ולהוסיף ניווט אליו
                  
                    }}
                  >
                    המשך לרכישה
                  </button>
                  <Link
                    to="/shop"
                    className="w-full bg-gray-100 text-gray-700 py-2 sm:py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 text-center block text-sm sm:text-base"
                  >
                    המשך בקניות
                  </Link>
                </div>

                {/* Additional Info */}
                <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500">
                  <p className="mb-1 sm:mb-2">✓ משלוח חינם בקנייה מעל ₪200</p>
                  <p className="mb-1 sm:mb-2">✓ החזר כספי תוך 30 יום</p>
                  <p>✓ תמיכה 24/7</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartPage; 