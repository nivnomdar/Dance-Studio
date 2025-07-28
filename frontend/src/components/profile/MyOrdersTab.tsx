import React, { useState, useEffect } from 'react';
import { FaShoppingBag, FaCalendarAlt, FaCreditCard, FaTruck, FaCheckCircle, FaTimesCircle, FaSpinner, FaBox, FaClock } from 'react-icons/fa';
import type { Order } from '../../types/order';
import { LoadingSpinner } from '../common';

interface MyOrdersTabProps {
  userId: string;
  session: any;
}

const MyOrdersTab: React.FC<MyOrdersTabProps> = ({ userId, session }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Implement orders service
        // const userOrders = await ordersService.getUserOrders(userId, session?.access_token);
        
        // For now, no orders - empty array
        setOrders([]);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('שגיאה בטעינת ההזמנות שלך');
      } finally {
        setLoading(false);
      }
    };

    if (userId && session) {
      fetchOrders();
    } else {
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

  if (loading) {
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
            <LoadingSpinner message="טוען הזמנות..." size="md" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EC4899]/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] px-4 sm:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-agrandir-grand">
              ההזמנות שלי
            </h3>
            <p className="text-white/80 text-sm mt-1">
              צפי בהיסטוריית ההזמנות שלך
            </p>
          </div>
          <div className="flex flex-wrap items-center bg-white/10 rounded-xl p-0.5 sm:p-1 backdrop-blur-sm gap-0.5 sm:gap-1 w-fit">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-white text-[#4B2E83] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              הכל
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                filter === 'pending'
                  ? 'bg-white text-[#4B2E83] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              בהמתנה
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                filter === 'completed'
                  ? 'bg-white text-[#4B2E83] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              הושלמו
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                filter === 'cancelled'
                  ? 'bg-white text-[#4B2E83] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              בוטלו
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-8">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            {/* Empty State Icon */}
            <div className="mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#EC4899]/10 to-[#4B2E83]/10 rounded-full flex items-center justify-center">
              <FaShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-[#EC4899]" />
            </div>
            
            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold text-[#4B2E83] mb-2 sm:mb-3 font-agrandir-grand">
              {filter === 'all' ? 'אין הזמנות עדיין' : 
               filter === 'pending' ? 'אין הזמנות בהמתנה' : 
               filter === 'completed' ? 'אין הזמנות שהושלמו' : 'אין הזמנות שבוטלו'}
            </h3>
            
            {/* Description */}
            <p className="text-[#4B2E83]/70 mb-4 sm:mb-6 text-sm sm:text-base max-w-sm mx-auto">
              {filter === 'all' ? 'הזמיני מוצר ראשון מהחנות ותהני מחוויית קנייה מעולה!' : 
               filter === 'pending' ? 'ההזמנות בהמתנה יופיעו כאן' : 
               filter === 'completed' ? 'ההזמנות שהושלמו יופיעו כאן' : 'ההזמנות שבוטלו יופיעו כאן'}
            </p>
            
            {/* Action Button */}
            <a
              href="/shop"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              <FaShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
              לקנייה בחנות
            </a>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {sortedOrders.map((order) => {
              const orderDate = new Date(order.created_at);
              
              return (
                <div
                  key={order.id}
                  className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h4 className="text-lg sm:text-xl font-bold text-[#4B2E83] font-agrandir-grand">
                          הזמנה #{order.id}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {getStatusBadge(order.status)}
                          {getPaymentStatusBadge(order.payment_status)}
                        </div>
                      </div>
                      <p className="text-[#4B2E83]/70 text-sm mb-3">
                        {order.items.length} מוצרים • {order.total_amount} ש"ח
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-[#4B2E83]">
                        {order.total_amount} ש"ח
                      </div>
                      <div className="text-sm text-[#4B2E83]/60">
                        {orderDate.toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 sm:space-y-3 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 bg-white rounded-xl border border-gray-100">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FaBox className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-[#4B2E83] text-sm sm:text-base truncate">{item.name}</h5>
                          <p className="text-xs sm:text-sm text-[#4B2E83]/60">כמות: {item.quantity}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-semibold text-[#4B2E83] text-sm sm:text-base">{item.price} ש"ח</div>
                          <div className="text-xs sm:text-sm text-[#4B2E83]/60">ליחידה</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-[#4B2E83] flex items-center text-sm sm:text-base">
                        <FaCalendarAlt className="w-4 h-4 ml-2 text-[#EC4899]" />
                        פרטי הזמנה
                      </h5>
                      <div className="text-xs sm:text-sm text-[#4B2E83]/70 space-y-1">
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
                      <h5 className="font-semibold text-[#4B2E83] flex items-center text-sm sm:text-base">
                        <FaTruck className="w-4 h-4 ml-2 text-[#EC4899]" />
                        כתובת משלוח
                      </h5>
                      <div className="text-xs sm:text-sm text-[#4B2E83]/70 space-y-1">
                        <p>{order.shipping_address.street}</p>
                        <p>{order.shipping_address.city}, {order.shipping_address.postal_code}</p>
                        <p>{order.shipping_address.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 gap-2">
                    <div className="flex items-center text-[#4B2E83]/60">
                      <FaCreditCard className="w-4 h-4 ml-2" />
                      <span className="text-xs sm:text-sm">
                        {order.payment_method === 'credit_card' ? 'כרטיס אשראי' : order.payment_method}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-[#4B2E83]/60">
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