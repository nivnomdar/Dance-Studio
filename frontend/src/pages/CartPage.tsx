import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartItemKey } = useCart();

  const calculateSubtotal = () => {
    return getCartTotal();
  };

  const calculateShipping = () => {
    return 0;
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
              <div role="presentation">
                <svg className="mx-auto h-16 w-16 sm:h-24 sm:w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  <circle cx="9" cy="12" r="1" />
                  <circle cx="15" cy="12" r="1" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">הסל שלך ריק</h1>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">אין לך מוצרים בסל הקניות שלך</p>
            <Link
              to="/shop"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-[#EC4899] hover:bg-[#EC4899]/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black focus:border-2 focus:border-black"
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
      className="min-h-screen bg-gray-50 py-4 sm:py-8"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4B2E83] mb-4 sm:mb-6 font-agrandir-grand">סל קניות</h1>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[#4B2E83] mx-auto mb-6 sm:mb-8"></div>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed px-4">בדקי את המוצרים שלך והמשיכי לרכישה</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Cart Items */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] rounded-t-lg shadow-lg px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 text-center">
                <h2 className="text-base sm:text-lg font-semibold text-white">מוצרים בסל ({cartItems.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={`${item.product.id}-${index}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-2 sm:p-3 lg:p-4"
                    >
                      <div className="flex flex-row items-center gap-2 sm:flex-row sm:items-start sm:gap-4"> {/* Main container */}

                        {/* Product Image Container */}
                        <div className="flex-shrink-0 w-20 h-20 sm:w-24 lg:w-32 sm:h-24 lg:h-32 bg-gray-50 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT09IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij7mian6KGM5pOJ5L2cPC90ZXh0Pgo8L3N2Zz4=';
                            }}
                          />
                        </div>

                        {/* Product Details & Price - Adjusted for Mobile first, then Desktop */}
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-2 lg:gap-4">
                          <div className="flex-1"> {/* Product Name & Description */}
                            <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1 font-agrandir-grand">
                              {item.product.name}
                            </h3>
                            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-1 sm:mb-2 leading-relaxed line-clamp-2 hidden sm:block">
                              {item.product.description}
                            </p>

                            {/* Product Specifications (Mobile: show size, Desktop: show all) */}
                            <div className="flex flex-wrap gap-1 sm:gap-2 mb-1 sm:mb-2">
                              {item.size && (
                                <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse">
                                  <span className="text-xs sm:text-sm font-medium text-gray-600">מידה:</span>
                                  <span className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium">
                                    {item.size}
                                  </span>
                                </div>
                              )}
                              {item.color && (
                                <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse hidden sm:flex">
                                  <span className="text-xs sm:text-sm font-medium text-gray-600">צבע:</span>
                                  <span className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium">
                                    {item.color}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Price Block (mobile and desktop) */}
                          <div className="text-right p-1 sm:p-2 lg:p-3 min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-0.5 sm:hidden">מחיר ליחידה</p>
                            <p className="text-sm font-bold text-[#EC4899] mb-0.5 sm:hidden">
                              ₪{item.product.price}
                            </p>
                            <div className="border-t border-gray-200 pt-1 sm:pt-2 sm:hidden">
                              <p className="text-xs text-gray-600">סכום כולל</p>
                              <p className="text-sm font-semibold text-gray-900">
                                ₪{item.product.price * item.quantity}
                              </p>
                            </div>
                            {/* Desktop prices */}
                            <p className="text-xs sm:text-sm text-gray-600 mb-1 hidden sm:block">מחיר ליחידה</p>
                            <p className="text-sm sm:text-lg lg:text-2xl font-bold text-[#EC4899] mb-1 sm:mb-2 hidden sm:block">
                              ₪{item.product.price}
                            </p>
                            <div className="border-t border-gray-200 pt-1 sm:pt-2 hidden sm:block">
                              <p className="text-xs sm:text-sm text-gray-600">סכום כולל</p>
                              <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                                ₪{item.product.price * item.quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls and Actions */}
                      <div className="flex flex-row items-center justify-between pt-2 border-t border-gray-100 gap-2 mt-2 sm:flex-row sm:items-center sm:justify-between sm:pt-1 lg:pt-3 sm:border-none sm:gap-2 lg:gap-0 sm:mt-0">
                        <div className="flex items-center space-x-2 space-x-reverse sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 sm:space-x-reverse w-full sm:w-auto">
                          <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
                            <span className="text-xs sm:text-sm font-medium text-gray-700">כמות:</span>
                            <div className="flex items-center bg-gray-50 rounded-lg p-0.5 sm:p-1">
                              <button
                                onClick={() => updateQuantity(getCartItemKey(item.product.id, item.size, item.color, item.heel_height, item.sole_type, item.materials), item.quantity - 1)}
                                aria-label={`הפחיתי כמות של ${item.product.name} באחת`}
                                className="w-6 h-6 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-[#EC4899] transition-all duration-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black focus:border-2 focus:border-black"
                              >
                                -
                              </button>
                              <span className="w-8 sm:w-7 lg:w-10 text-center text-gray-900 font-bold text-sm mx-0.5 sm:mx-1 lg:mx-2">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(getCartItemKey(item.product.id, item.size, item.color, item.heel_height, item.sole_type, item.materials), item.quantity + 1)}
                                aria-label={`הוסיפי כמות של ${item.product.name} באחת`}
                                className="w-6 h-6 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:hover:text-[#EC4899] transition-all duration-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black focus:border-2 focus:border-black"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                            סה"כ יחידות: {item.quantity}
                          </span>
                        </div>

                        <button
                          onClick={() => removeFromCart(getCartItemKey(item.product.id, item.size, item.color, item.heel_height, item.sole_type, item.materials))}
                          aria-label={`הסירי את ${item.product.name} מהסל`}
                          className="flex items-center space-x-1 sm:space-x-2 space-x-reverse text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium transition-colors duration-200 hover:bg-red-50 px-1 sm:px-1.5 lg:px-2 py-0.5 sm:py-1 rounded-lg w-full sm:w-auto justify-center sm:justify-start focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black focus:border-2 focus:border-black border border-red-500"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>הסירי מהסל</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div variants={fadeInUp} className="lg:col-span-1">
            <div className="sticky top-[110px] p-0.5 rounded-lg bg-gradient-to-r from-[#4B2E83] to-[#EC4899] shadow-lg">
              <div className="bg-white rounded-lg">
                <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] rounded-t-lg shadow-none px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 text-center">
                  <h2 className="text-base sm:text-lg font-semibold text-white">סיכום הזמנה</h2>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">סכום ביניים</span>
                      <span className="text-gray-900">₪{calculateSubtotal()}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">משלוח{calculateShipping() === 0 && <span className="text-green-600 ml-1"> (חינם!)</span>}</span>
                      <span className="text-gray-900">₪{calculateShipping()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 sm:pt-4">
                      <div className="flex justify-between text-base sm:text-lg font-semibold">
                        <span className="text-gray-900">סה"כ לתשלום</span>
                        <span className="text-[#EC4899]">₪{calculateTotal()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 space-y-2">
                    <button
                      className="w-full bg-[#EC4899] text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:bg-[#EC4899]/80 transition-colors duration-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black focus:border-2 focus:border-black"
                      onClick={() => {
                        // TODO: יש להוסיף דף תשלום ולהוסיף ניווט אליו
                  
                      }}
                    >
                      המשיכי לרכישה
                    </button>
                    <Link
                      to="/shop"
                      className="w-full bg-gray-100 text-gray-700 py-2 sm:py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 text-center block text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black focus:border-2 focus:border-black"
                    >
                      המשיכי לקניות
                    </Link>
                  </div>
                  {/* Additional Info */}
                  <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-700 space-y-0.5 sm:space-y-1 font-medium text-center">
                    <p><span className="text-green-600 text-sm mr-1">✓</span> <span className="text-[#D93D8D]">משלוח חינם לישראל</span></p>
                    <p><span className="text-green-600 text-sm mr-1">✓</span> <span className="text-[#D93D8D]">אספקה בין 6 ל-14 ימי עסקים</span></p>
                  </div>
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