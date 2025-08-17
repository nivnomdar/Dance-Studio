import { useEffect, useState } from 'react';
import { apiService } from '../../../lib/api';

export default function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return <div className="p-6 text-[#4B2E83]/70">טוען...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-3 sm:space-y-6 overflow-x-hidden">
      <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-[#EC4899]/10">
          <h2 className="text-lg sm:text-2xl font-bold text-[#4B2E83] mb-1 sm:mb-2">ניהול הזמנות</h2>
          <p className="text-sm sm:text-base text-[#4B2E83]/70">רשימת הזמנות אחרונות במערכת</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
              <tr>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">מס׳ הזמנה</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">תאריך</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">משתמש</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">סכום</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83]">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EC4899]/10">
              {orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-[#4B2E83]/5 transition-colors">
                  <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">#{String(o.id).slice(-6)}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">{new Date(o.created_at).toLocaleString('he-IL')}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">{o.user_name || o.user_id}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">₪{o.total_amount}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3">
                    <span className={`inline-flex items-center gap-1 px-1 sm:px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium ${o.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' : o.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {o.status === 'completed' ? 'הושלמה' : o.status === 'pending' ? 'ממתינה' : 'בוטלה'}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-[#4B2E83]/70">אין הזמנות במערכת</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


