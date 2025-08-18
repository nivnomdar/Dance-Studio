import { useEffect, useMemo, useState } from 'react';
import { apiService } from '../../../lib/api';
import ResponsiveSelect from '../../../components/ui/ResponsiveSelect';

export default function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await apiService.admin.getOrders();
        if (!mounted) return;
        setOrders(data || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'שגיאה בטעינת הזמנות');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const normalized = useMemo(() => {
    return (orders || []).map((o: any) => {
      const s = String(o.status || '').toLowerCase();
      const uiStatus = s === 'cancelled' ? 'cancelled' : (['paid','shipped','delivered','completed','confirmed'].includes(s) ? 'completed' : 'pending');
      return { ...o, uiStatus };
    });
  }, [orders]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return normalized.filter((o: any) => {
      const matchesSearch = !q || (String(o.user_name || '').toLowerCase().includes(q) || String(o.user_id || '').toLowerCase().includes(q) || String(o.order_number || '').toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'all' || o.uiStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [normalized, searchTerm, statusFilter]);

  if (isLoading) {
    return <div className="p-6 text-[#4B2E83]/70">טוען...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-3 sm:space-y-6 overflow-x-hidden">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-[#EC4899]/10">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 items-end">
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">חיפוש הזמנה</label>
            <div className="relative">
              <input
                placeholder="חפש לפי שם משתמש/מס׳ הזמנה..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(10); }}
                className="w-full pl-8 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm text-right bg-white border border-[#EC4899]/20 rounded-lg shadow-sm focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              />
              <svg className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B2E83]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
          <ResponsiveSelect
            label="סטטוס הזמנה"
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v as any); setVisibleCount(10); }}
            options={[
              { value: 'all', label: 'כל ההזמנות' },
              { value: 'pending', label: 'ממתינות' },
              { value: 'completed', label: 'הושלמו' },
              { value: 'cancelled', label: 'בוטלו' }
            ]}
            className="lg:col-span-1"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-[#EC4899]/10">
          <h2 className="text-lg sm:text-2xl font-bold text-[#4B2E83] mb-1 sm:mb-2">ניהול הזמנות</h2>
          <p className="text-sm sm:text-base text-[#4B2E83]/70">רשימת הזמנות אחרונות במערכת</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed">
            <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
              <tr>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-[14%]">מס׳ הזמנה</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-[20%]">תאריך</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-[24%]">משתמש</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-[14%]">סכום</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] w-[14%]">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EC4899]/10">
              {filtered.slice(0, visibleCount).map((o: any) => (
                <tr key={o.id} className="hover:bg-[#EC4899]/5 transition-colors">
                  <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">#{o.order_number || String(o.id).slice(-6)}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">{new Date(o.created_at).toLocaleString('he-IL')}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">{o.user_name || o.user_id}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">₪{o.total_amount}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium ${o.uiStatus === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' : o.uiStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {o.uiStatus === 'completed' ? 'הושלמה' : o.uiStatus === 'pending' ? 'ממתינה' : 'בוטלה'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-[#4B2E83]/70">אין הזמנות במערכת</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > visibleCount && (
          <div className="p-4 border-t border-[#EC4899]/10 text-center">
            <button
              onClick={() => setVisibleCount(c => c + 10)}
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-sm"
            >
              עוד הזמנות
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


