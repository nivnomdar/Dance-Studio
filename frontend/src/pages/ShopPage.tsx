import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '../data/products';
import { Product } from '../types/product';

const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const categories = [
    { id: 'all', name: 'הכל' },
    { id: 'shoes', name: 'נעליים' },
    { id: 'clothing', name: 'בגדים' },
    { id: 'accessories', name: 'אביזרים' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[0] || '');
    setSelectedColor(product.colors?.[0] || '');
    setQuantity(1);
  };

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    console.log('Adding to cart:', {
      product: selectedProduct,
      size: selectedSize,
      color: selectedColor,
      quantity
    });
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">חנות</h1>
          <p className="text-xl text-gray-600">מוצרים מקצועיים לריקוד - נעליים, בגדים ואביזרים מותאמים אישית</p>
        </div>

        {/* Categories */}
        <div className="flex justify-center space-x-4 mb-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full text-lg font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-purple-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {product.isNew && (
                  <span className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    חדש!
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    מוביל מכירות
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm mr-2">({product.reviews.count} ביקורות)</span>
                </div>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-purple-600">₪{product.price}</span>
                  <button
                    onClick={() => handleQuickView(product)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                  >
                    צפה במוצר
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick View Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedProduct(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-96 object-cover rounded-lg shadow-lg"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(selectedProduct.rating) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-gray-600 text-sm mr-2">({selectedProduct.reviews.count} ביקורות)</span>
                      </div>
                      <p className="text-gray-600 mb-6">{selectedProduct.description}</p>
                      <div className="space-y-4">
                        {selectedProduct.sizes && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">מידה</label>
                            <div className="flex space-x-2">
                              {selectedProduct.sizes.map((size: string) => (
                                <button
                                  key={size}
                                  onClick={() => setSelectedSize(size)}
                                  className={`px-4 py-2 border rounded-lg ${
                                    selectedSize === size
                                      ? 'border-purple-600 bg-purple-50 text-purple-600'
                                      : 'border-gray-300 text-gray-700 hover:border-purple-600'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedProduct.colors && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">צבע</label>
                            <div className="flex space-x-2">
                              {selectedProduct.colors.map((color: string) => (
                                <button
                                  key={color}
                                  onClick={() => setSelectedColor(color)}
                                  className={`px-4 py-2 border rounded-lg ${
                                    selectedColor === color
                                      ? 'border-purple-600 bg-purple-50 text-purple-600'
                                      : 'border-gray-300 text-gray-700 hover:border-purple-600'
                                  }`}
                                >
                                  {color}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">כמות</label>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              className="p-2 border rounded-lg hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span className="text-lg font-medium">{quantity}</span>
                            <button
                              onClick={() => setQuantity(quantity + 1)}
                              className="p-2 border rounded-lg hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-2xl font-bold text-purple-600">₪{selectedProduct.price}</span>
                          <button
                            onClick={handleAddToCart}
                            className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                          >
                            הוסף לסל
                          </button>
                        </div>
                        <div className="space-y-2">
                          {selectedProduct.features.map((feature: string, index: number) => (
                            <div key={index} className="flex items-center text-gray-600">
                              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {feature}
                            </div>
                          ))}
                        </div>

                        {/* Reviews Section */}
                        <div className="mt-8">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">ביקורות ({selectedProduct.reviews.count})</h3>
                          <div className="space-y-4">
                            {selectedProduct.reviews.comments.map((review: { user: string; rating: number; comment: string; date: string }, index: number) => (
                              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <span className="font-medium text-gray-900">{review.user}</span>
                                    <div className="flex text-yellow-400 mt-1">
                                      {[...Array(5)].map((_, i) => (
                                        <svg
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                          }`}
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ))}
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-500">{review.date}</span>
                                </div>
                                <p className="text-gray-600">{review.comment}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShopPage; 