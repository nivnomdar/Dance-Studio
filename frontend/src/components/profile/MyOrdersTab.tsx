import React, { useState, useEffect } from 'react';
import { FaShoppingBag, FaCalendarAlt, FaCreditCard, FaTruck, FaCheckCircle, FaTimesCircle, FaSpinner, FaBox, FaClock } from 'react-icons/fa';
import type { Order } from '../../types/order';

interface MyOrdersTabProps {
  userId: string;
  session: any;
}

const MyOrdersTab: React.FC<MyOrdersTabProps> = ({ userId, session }) => {
  console.log('MyOrdersTab: Rendering with userId:', userId, 'session:', !!session);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    console.log('MyOrdersTab: useEffect triggered with userId:', userId, 'session:', !!session);
    
    const fetchOrders = async () => {
      try {
        console.log('MyOrdersTab: Starting to fetch orders...');
        setLoading(true);
        setError(null);
        
        // TODO: Implement orders service
        // const userOrders = await ordersService.getUserOrders(userId, session?.access_token);
        
        // For now, we'll use mock data
        const mockOrders: Order[] = [
          {
            id: '1',
            user_id: userId,
            items: [
              {
                product_id: '1',
                name: 'חולצת ריקוד אלגנטית',
                price: 120,
                quantity: 1,
                image_url: '/images/product1.jpg'
              }
            ],
            total_amount: 120,
            status: 'pending',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            shipping_address: {
              street: 'רחוב הרצל 123',
              city: 'תל אביב',
              postal_code: '12345',
              country: 'ישראל'
            },
            payment_method: 'credit_card',
            payment_status: 'pending'
          },
          {
            id: '2',
            user_id: userId,
            items: [
              {
                product_id: '2',
                name: 'מכנסי ריקוד נוחים',
                price: 150,
                quantity: 1,
                image_url: '/images/product2.jpg'
              },
              {
                product_id: '3',
                name: 'נעלי ריקוד מקצועיות',
                price: 200,
                quantity: 1,
                image_url: '/images/product3.jpg'
              }
            ],
            total_amount: 350,
            status: 'completed',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            shipping_address: {
              street: 'רחוב הרצל 123',
              city: 'תל אביב',
              postal_code: '12345',
              country: 'ישראל'
            },
            payment_method: 'credit_card',
            payment_status: 'completed'
          }
        ];
        
        setOrders(mockOrders);
        console.log('MyOrdersTab: Orders loaded successfully:', mockOrders.length, 'orders');
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('שגיאה בטעינת ההזמנות שלך');
      } finally {
        setLoading(false);
        console.log('MyOrdersTab: Loading finished');
      }
    };

    if (userId && session) {
      console.log('MyOrdersTab: Calling fetchOrders...');
      fetchOrders();
    } else {
      console.log('MyOrdersTab: Skipping fetchOrders - missing userId or session');
      setLoading(false);
    }
  }, [userId, session]);

  // פילטור הזמנות לפי סטטוס
  const filteredOrders = orders.filter(order => {
    switch (filter) {
      case 'pending':
        return order.status === 'pending';
      case 'completed':
        return order.status === 'completed';
      case 'cancelled':
        return order.status === 'cancelled';
      default:
        return true;
    }
  });

  // מיון לפי תאריך (החדשות קודם)
  const sortedOrders = filteredOrders.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaClock className="w-3 h-3 ml-1" />
            בהמתנה
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="w-3 h-3 ml-1" />
            הושלם
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="w-3 h-3 ml-1" />
            בוטל
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ממתין לתשלום
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            שולם
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            נכשל
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  console.log('MyOrdersTab: Rendering with loading:', loading, 'error:', error, 'orders count:', orders.length);
  
  if (loading) {
    console.log('MyOrdersTab: Showing loading state');
    return (
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EC4899]/10">
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] px-8 py-6">
          <h3 className="text-2xl font-bold text-white font-agrandir-grand">
            ההזמנות שלי
          </h3>
          <p className="text-white/80 text-sm mt-1">
            צפי בהיסטוריית ההזמנות שלך
          </p>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-[#EC4899]" />
            <span className="mr-4 text-lg text-[#4B2E83]">טוען הזמנות...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('MyOrdersTab: Showing error state:', error);
    return (
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EC4899]/10">
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] px-8 py-6">
          <h3 className="text-2xl font-bold text-white font-agrandir-grand">
            ההזמנות שלי
          </h3>
          <p className="text-white/80 text-sm mt-1">
            צפי בהיסטוריית ההזמנות שלך
          </p>
        </div>
        <div className="p-8">
          <div className="text-center py-12">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <FaTimesCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-[#4B2E83] mb-2">שגיאה בטעינת ההזמנות</h3>
            <p className="text-[#4B2E83]/70 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('MyOrdersTab: Rendering main content with', sortedOrders.length, 'orders');
  
  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EC4899]/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white font-agrandir-grand">
              ההזמנות שלי
            </h3>
            <p className="text-white/80 text-sm mt-1">
              צפי בהיסטוריית ההזמנות שלך
            </p>
          </div>
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-white text-[#4B2E83]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              הכל
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'pending'
                  ? 'bg-white text-[#4B2E83]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              בהמתנה
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'completed'
                  ? 'bg-white text-[#4B2E83]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              הושלמו
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'cancelled'
                  ? 'bg-white text-[#4B2E83]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              בוטלו
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <FaShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-[#4B2E83] mb-2">
              {filter === 'all' ? 'אין לך הזמנות עדיין' : 
               filter === 'pending' ? 'אין הזמנות בהמתנה' : 
               filter === 'completed' ? 'אין הזמנות שהושלמו' : 'אין הזמנות שבוטלו'}
            </h3>
            <p className="text-[#4B2E83]/70 mb-6">
              {filter === 'all' ? 'הזמיני מוצר ראשון מהחנות!' : 
               filter === 'pending' ? 'ההזמנות בהמתנה יופיעו כאן' : 
               filter === 'completed' ? 'ההזמנות שהושלמו יופיעו כאן' : 'ההזמנות שבוטלו יופיעו כאן'}
            </p>
            <a
              href="/shop"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
            >
              <FaShoppingBag className="w-4 h-4 ml-2" />
              לקנייה בחנות
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedOrders.map((order) => {
              const orderDate = new Date(order.created_at);
              
              return (
                <div
                  key={order.id}
                  className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-[#4B2E83] font-agrandir-grand">
                          הזמנה #{order.id}
                        </h4>
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.payment_status)}
                      </div>
                      <p className="text-[#4B2E83]/70 text-sm mb-3">
                        {order.items.length} מוצרים • {order.total_amount} ש"ח
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#4B2E83]">
                        {order.total_amount} ש"ח
                      </div>
                      <div className="text-sm text-[#4B2E83]/60">
                        {orderDate.toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FaBox className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-[#4B2E83]">{item.name}</h5>
                          <p className="text-sm text-[#4B2E83]/60">כמות: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-[#4B2E83]">{item.price} ש"ח</div>
                          <div className="text-sm text-[#4B2E83]/60">ליחידה</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-[#4B2E83] flex items-center">
                        <FaCalendarAlt className="w-4 h-4 ml-2 text-[#EC4899]" />
                        פרטי הזמנה
                      </h5>
                      <div className="text-sm text-[#4B2E83]/70 space-y-1">
                        <p>תאריך הזמנה: {orderDate.toLocaleDateString('he-IL', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                        <p>שעת הזמנה: {orderDate.toLocaleTimeString('he-IL')}</p>
                        <p>מספר הזמנה: {order.id}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-semibold text-[#4B2E83] flex items-center">
                        <FaTruck className="w-4 h-4 ml-2 text-[#EC4899]" />
                        כתובת משלוח
                      </h5>
                      <div className="text-sm text-[#4B2E83]/70 space-y-1">
                        <p>{order.shipping_address.street}</p>
                        <p>{order.shipping_address.city}, {order.shipping_address.postal_code}</p>
                        <p>{order.shipping_address.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center text-[#4B2E83]/60">
                      <FaCreditCard className="w-4 h-4 ml-2" />
                      <span className="text-sm">
                        {order.payment_method === 'credit_card' ? 'כרטיס אשראי' : order.payment_method}
                      </span>
                    </div>
                    <div className="text-sm text-[#4B2E83]/60">
                      עודכן: {new Date(order.updated_at).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersTab; 