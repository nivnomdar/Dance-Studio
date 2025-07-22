import { useEffect } from 'react';
import { useAdminData } from '../../../contexts/AdminDataContext';
import type { UserProfile } from '../../../types/auth';

interface AdminShopProps {
  profile: UserProfile;
}

export default function AdminShop({ profile }: AdminShopProps) {
  const { data, isLoading, error, fetchShop, isFetching } = useAdminData();

  // טעינת נתונים רק אם אין נתונים או שהם ישנים
  useEffect(() => {
    if (data.products.length === 0) {
      fetchShop();
    }
  }, [data.products.length, fetchShop]);

  const activeProducts = data.products.filter(product => product.is_active);
  const outOfStockProducts = data.products.filter(product => product.stock_quantity === 0);
  const pendingOrders = data.orders.filter(order => order.status === 'pending');
  
  // Calculate completed orders this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const completedOrdersThisWeek = data.orders.filter((order: any) => 
    order.status === 'completed' && new Date(order.created_at) > oneWeekAgo
  ).length;

  if (isLoading && data.products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#4B2E83]">ניהול חנות</h2>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
          <p className="text-[#4B2E83]/70">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (error && data.products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#4B2E83]">ניהול חנות</h2>
        </div>
        <div className="text-center py-12">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchShop}
            className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#4B2E83]">ניהול חנות</h2>
        <div className="flex gap-3">
          <button
            onClick={fetchShop}
            disabled={isFetching}
            className="px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? 'מעדכן...' : 'רענן נתונים'}
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300">
            הוספת מוצר חדש
          </button>
        </div>
      </div>

      {/* Shop Management Interface */}
      <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#4B2E83]">מוצרים זמינים בחנות ({data.products.length})</h3>
            {data.products.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.products.slice(0, 5).map((product: any) => (
                  <div key={product.id} className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 p-4 rounded-xl border border-[#EC4899]/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-[#4B2E83]">{product.name}</h4>
                        <p className="text-sm text-[#4B2E83]/70 mt-1">{product.description}</p>
                        <p className="text-sm text-[#EC4899] font-medium mt-1">₪{product.price}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {product.is_active ? (
                            <>
                              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              פעיל
                            </>
                          ) : (
                            <>
                              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              לא פעיל
                            </>
                          )}
                        </span>
                        <p className="text-xs text-[#4B2E83]/70 mt-1">
                          מלאי: {product.stock_quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {data.products.length > 5 && (
                  <div className="text-center pt-2">
                    <p className="text-sm text-[#4B2E83]/70">
                      ועוד {data.products.length - 5} מוצרים...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-[#4B2E83]/70 text-center">אין מוצרים בחנות כרגע</p>
              </div>
            )}
          </div>

          {/* Orders */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#4B2E83]">הזמנות במערכת ({data.orders.length})</h3>
            {data.orders.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 p-4 rounded-xl border border-[#4B2E83]/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-[#4B2E83]">הזמנה #{order.id.slice(-6)}</h4>
                        <p className="text-sm text-[#4B2E83]/70 mt-1">
                          {new Date(order.created_at).toLocaleDateString('he-IL')}
                        </p>
                        <p className="text-sm text-[#4B2E83]/70">משתמש: {order.user_name || order.user_id}</p>
                        <p className="text-sm text-[#EC4899] font-medium">₪{order.total_amount}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {order.status === 'completed' ? (
                          <>
                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            הושלמה
                          </>
                        ) : order.status === 'pending' ? (
                          <>
                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            ממתינה
                          </>
                        ) : (
                          <>
                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            בוטלה
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
                {data.orders.length > 5 && (
                  <div className="text-center pt-2">
                    <p className="text-sm text-[#4B2E83]/70">
                      ועוד {data.orders.length - 5} הזמנות...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-[#4B2E83]/70 text-center">אין הזמנות כרגע</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-4 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-2xl font-bold text-[#EC4899]">{data.products.length}</div>
          <div className="text-sm text-[#4B2E83]/70">מספר מוצרים במערכת</div>
        </div>
        <div className="bg-gradient-to-br from-[#4B2E83]/5 to-[#EC4899]/5 p-4 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-2xl font-bold text-[#4B2E83]">{outOfStockProducts.length}</div>
          <div className="text-sm text-[#4B2E83]/70">מוצרים אזלו מהמלאי</div>
        </div>
        <div className="bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-4 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-2xl font-bold text-[#EC4899]">{pendingOrders.length}</div>
          <div className="text-sm text-[#4B2E83]/70">הזמנות ממתינות לטיפול</div>
        </div>
        <div className="bg-gradient-to-br from-[#4B2E83]/5 to-[#EC4899]/5 p-4 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-2xl font-bold text-[#4B2E83]">{completedOrdersThisWeek}</div>
          <div className="text-sm text-[#4B2E83]/70">הזמנות שהושלמו השבוע</div>
        </div>
      </div>

      {/* Shop Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/10 rounded-xl hover:from-[#EC4899]/10 hover:to-[#4B2E83]/10 transition-all duration-300">
          <h4 className="font-semibold text-[#4B2E83] mb-2">הוסף מוצר</h4>
          <p className="text-sm text-[#4B2E83]/70">הוסף מוצר חדש לחנות</p>
        </button>
        
        <button className="p-4 bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 border border-[#4B2E83]/10 rounded-xl hover:from-[#4B2E83]/10 hover:to-[#EC4899]/10 transition-all duration-300">
          <h4 className="font-semibold text-[#4B2E83] mb-2">נהל הזמנות</h4>
          <p className="text-sm text-[#4B2E83]/70">צפה וניהול הזמנות</p>
        </button>
        
        <button className="p-4 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/10 rounded-xl hover:from-[#EC4899]/10 hover:to-[#4B2E83]/10 transition-all duration-300">
          <h4 className="font-semibold text-[#4B2E83] mb-2">דוחות מכירות</h4>
          <p className="text-sm text-[#4B2E83]/70">צפה בדוחות מכירות</p>
        </button>
      </div>

      {/* Inventory Management */}
      <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
        <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">ניהול מלאי</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl">
            <h4 className="font-semibold text-[#4B2E83] mb-2">מוצרים במלאי</h4>
            <p className="text-2xl font-bold text-[#EC4899]">{activeProducts.length}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl">
            <h4 className="font-semibold text-[#4B2E83] mb-2">מוצרים אזלו</h4>
            <p className="text-2xl font-bold text-[#4B2E83]">{outOfStockProducts.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 