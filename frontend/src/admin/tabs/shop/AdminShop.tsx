import { useEffect, useState } from 'react';
import { useAdminData } from '../../contexts';
import type { UserProfile } from '../../../types/auth';
import { RefreshButton } from '../../components';
import { apiService } from '../../../lib/api';
import Modal from '../../../components/common/Modal';

import { ProductsTab, OrdersTab } from './index';

interface AdminShopProps {
  profile: UserProfile;
}

type ShopTab = 'products' | 'orders';

export default function AdminShop({ profile: _profile }: AdminShopProps) {
  const { data, isLoading, error, fetchShop, isFetching } = useAdminData();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  // Removed unused product editing state (managed in child tab/modals)
  const [activeTab, setActiveTab] = useState<ShopTab>('products');

  // Load data only if missing or stale
  useEffect(() => {
    if (data.products.length === 0) {
      fetchShop();
    }
  }, [data.products.length, fetchShop]);

  const outOfStockProducts = data.products.filter((product: any) => product.stock_quantity === 0);
  const pendingOrders = data.orders.filter(order => order.status === 'pending');
  
  // Calculate completed orders this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const completedOrdersThisWeek = data.orders.filter((order: any) => 
    order.status === 'completed' && new Date(order.created_at) > oneWeekAgo
  ).length;

  if (isLoading && data.products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify_between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h2 className="text-2xl font-bold text-[#4B2E83]">ניהול חנות</h2>
            <p className="text-sm text-[#4B2E83]/70 mt-1">ניהול מוצרים והזמנות בחנות</p>
          </div>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h2 className="text-2xl font-bold text-[#4B2E83]">ניהול חנות</h2>
            <p className="text-sm text-[#4B2E83]/70 mt-1">ניהול מוצרים והזמנות בחנות</p>
          </div>
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
            className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 cursor-pointer"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-[#4B2E83]">חנות</h2>
          <p className="text-sm text-[#4B2E83]/70 mt-1">ניהול החנות: מוצרים והזמנות</p>
        </div>
        <RefreshButton
          onClick={fetchShop}
          isFetching={isFetching}
        />
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EC4899]/10">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm cursor-pointer ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white'
                : 'bg-gray-100 text-[#4B2E83] hover:bg-gray-200'
            }`}
          >
            מוצרים
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white'
                : 'bg-gray-100 text-[#4B2E83] hover:bg-gray-200'
            }`}
          >
            הזמנות
          </button>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
        {activeTab === 'products' && (
          <ProductsTab data={data} fetchShop={fetchShop} />
        )}
        {activeTab === 'orders' && (
          <OrdersTab />
        )}
      </div>

      {/* Categories Management - only for Products tab */}
      {activeTab === 'products' && (
      <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
        <div className="flex items-center justify-between mb-4">
          {(() => {
            const total = data.categories?.length || 0;
            const parents = data.categories?.filter((c: any) => !c.parent_id).length || 0;
            const subs = total - parents;
            return (
              <h3 className="text-lg font-semibold text-[#4B2E83]">
                קטגוריות ({parents} ראשיות · {subs} תתי־קטגוריות)
              </h3>
            );
          })()}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2 bg-[#EC4899] text-white rounded-lg hover:bg-[#EC4899]/80 cursor-pointer"
          >
            הוסף קטגוריה
          </button>
        </div>
        {data.categories && data.categories.length > 0 ? (
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
            {data.categories.filter((c: any) => !c.parent_id).map((cat: any) => (
              <div key={cat.id} className="p-3 rounded-xl bg-[#EC4899]/5 border border-[#EC4899]/10">
                <div className="font-medium text-[#4B2E83] truncate" title={cat.name}>{cat.name}</div>
                <div className="mt-2 space-y-1 max-h-28 overflow-y-auto pr-1">
                  {data.categories.filter((s: any) => s.parent_id === cat.id).map((sub: any) => (
                    <div key={sub.id} className="text-sm text-[#4B2E83]/80 truncate" title={sub.name}>• {sub.name}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-[#4B2E83]/70 text-center">אין קטגוריות כרגע</p>
          </div>
        )}
      </div>
      )}

      {/* Add Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)}>
        <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">קטגוריה חדשה</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#4B2E83]/70 mb-1">שם קטגוריה</label>
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
              placeholder="הקלידי שם"
            />
          </div>
          <div>
            <label className="block text-sm text-[#4B2E83]/70 mb-1">קטגוריית אם (לא חובה)</label>
            <select
              value={parentCategoryId || ''}
              onChange={(e) => setParentCategoryId(e.target.value || undefined)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
            >
              <option value="">ללא</option>
              {(data.categories?.filter((c: any) => !c.parent_id) || []).map((c: any) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 rounded-lg border cursor-pointer" onClick={() => setIsCategoryModalOpen(false)}>ביטול</button>
            <button
              disabled={saving || !newCategoryName.trim()}
              onClick={async () => {
                try {
                  setSaving(true);
                  await apiService.shop.createCategory({ name: newCategoryName.trim(), parent_id: parentCategoryId || null });
                  setNewCategoryName('');
                  setParentCategoryId(undefined);
                  setIsCategoryModalOpen(false);
                  await fetchShop();
                } finally {
                  setSaving(false);
                }
              }}
              className="px-4 py-2 rounded-lg bg-[#EC4899] text-white disabled:opacity-50 cursor-pointer"
            >
              שמירה
            </button>
          </div>
        </div>
      </Modal>

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
    </div>
  );
} 