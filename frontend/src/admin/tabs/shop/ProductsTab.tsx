import { useMemo, useState } from 'react';
 
import ProductEditModal from '../../modals/shop/ProductEditModal';
import ProductStatusModal from '../../modals/shop/ProductStatusModal';
import ProductDeleteModal from '../../modals/shop/ProductDeleteModal';
import ResponsiveSelect from '../../../components/ui/ResponsiveSelect';

export default function ProductsTab({ data, fetchShop }: { data: any; fetchShop: () => Promise<void> }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortKey, setSortKey] = useState<'name' | 'price' | 'stock' | 'created'>('created');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusProduct, setStatusProduct] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<any | null>(null);

  const categoryById = useMemo(() => {
    const map: Record<string, any> = {};
    (data.categories || []).forEach((c: any) => { map[c.id] = c; });
    return map;
  }, [data.categories]);

  const filteredSortedProducts = useMemo(() => {
    let list: any[] = [...(data.products || [])];
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    if (filterCategoryId !== 'all') {
      list = list.filter(p => p.category_id === filterCategoryId || categoryById[p.category_id]?.parent_id === filterCategoryId);
    }
    if (stockFilter === 'in') list = list.filter(p => (p.stock_quantity ?? 0) > 0);
    if (stockFilter === 'out') list = list.filter(p => (p.stock_quantity ?? 0) === 0);
    if (stockFilter === 'low') list = list.filter(p => (p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= 5);
    if (statusFilter === 'active') list = list.filter(p => p.is_active);
    if (statusFilter === 'inactive') list = list.filter(p => !p.is_active);
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'name': return ((a.name || '').localeCompare(b.name || '')) * dir;
        case 'price': return ((a.price || 0) - (b.price || 0)) * dir;
        case 'stock': return (((a.stock_quantity ?? 0) - (b.stock_quantity ?? 0))) * dir;
        case 'created':
        default:
          return ((new Date(a.created_at).getTime()) - (new Date(b.created_at).getTime())) * dir;
      }
    });
    return list;
  }, [data.products, categoryById, searchTerm, filterCategoryId, stockFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSortedProducts.length / pageSize));
  const pagedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSortedProducts.slice(start, start + pageSize);
  }, [filteredSortedProducts, page]);

  return (
    <div className="space-y-3 sm:space-y-6 overflow-x-hidden">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-[#EC4899]/10">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 xl:grid-cols-8 gap-3 sm:gap-4 items-end">
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">חיפוש מוצר</label>
            <div className="relative">
              <input
                placeholder="חפש לפי שם או תיאור..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm text-right bg-white border border-[#EC4899]/20 rounded-lg shadow-sm focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              />
              <svg className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B2E83]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
          <ResponsiveSelect
            label="קטגוריה"
            value={filterCategoryId}
            onChange={(v) => { setFilterCategoryId(v); setPage(1); }}
            options={[{ value: 'all', label: 'כל הקטגוריות' }, ...(data.categories || []).map((c: any) => ({ value: c.id, label: c.name }))]}
            className="lg:col-span-1"
          />
          <div className="col-span-2 sm:col-span-2 lg:col-span-3 grid grid-cols-3 gap-2">
            <ResponsiveSelect
              label="מלאי"
              value={stockFilter}
              onChange={(v) => { setStockFilter(v as any); setPage(1); }}
              options={[
                { value: 'all', label: 'כל המלאי' },
                { value: 'in', label: 'במלאי' },
                { value: 'low', label: 'מלאי נמוך (≤5)' },
                { value: 'out', label: 'אזל מהמלאי' }
              ]}
            />
            <ResponsiveSelect
              label="סטטוס"
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v as any); setPage(1); }}
              options={[
                { value: 'all', label: 'הכל' },
                { value: 'active', label: 'פעיל' },
                { value: 'inactive', label: 'לא פעיל' }
              ]}
            />
            <ResponsiveSelect
              label="מיון"
              value={sortKey}
              onChange={(v) => setSortKey(v as any)}
              options={[
                { value: 'created', label: 'תאריך' },
                { value: 'name', label: 'שם' },
                { value: 'price', label: 'מחיר' },
                { value: 'stock', label: 'מלאי' }
              ]}
            />
          </div>
          <ResponsiveSelect
            label="כיוון"
            value={sortDir}
            onChange={(v) => setSortDir(v as any)}
            options={[
              { value: 'desc', label: 'יורד' },
              { value: 'asc', label: 'עולה' }
            ]}
            className="lg:col-span-1"
          />
          <div className="lg:col-span-1">
            <span className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">תצוגה</span>
            <div role="group" aria-label="החלפת תצוגה" className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-pressed={viewMode === 'table'}
                aria-label="תצוגת טבלה"
                title="תצוגת טבלה"
                className={`inline-flex items-center justify-center w-full sm:w-auto px-3 py-1.5 rounded-lg border transition-all text-xs sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4899]/40 ${viewMode === 'table' ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white border-transparent' : 'bg-white text-[#4B2E83] border-[#EC4899]/20 hover:bg-[#EC4899]/5'}`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="4" rx="1"/>
                  <rect x="3" y="10" width="18" height="4" rx="1"/>
                  <rect x="3" y="16" width="18" height="4" rx="1"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                aria-pressed={viewMode === 'cards'}
                aria-label="תצוגת כרטיסים"
                title="תצוגת כרטיסים"
                className={`inline-flex items-center justify-center w-full sm:w-auto px-3 py-1.5 rounded-lg border transition-all text-xs sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4899]/40 ${viewMode === 'cards' ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white border-transparent' : 'bg-white text-[#4B2E83] border-[#EC4899]/20 hover:bg-[#EC4899]/5'}`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products - Table or Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-[#EC4899]/10">
          <h2 className="text-lg sm:text-2xl font-bold text-[#4B2E83] mb-1 sm:mb-2">ניהול מוצרים</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm sm:text-base text-[#4B2E83]/70">הצגת מוצרים, מחירים, מלאי וסטטוס</p>
            <button
              onClick={() => { setEditProduct(null); setEditOpen(true); }}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-sm"
            >
              הוסיפי מוצר חדש
            </button>
          </div>
        </div>
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
                <tr>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/4">מוצר</th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/6">קטגוריה</th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/8">מחיר</th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/8">מלאי</th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/8">סטטוס</th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/6">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EC4899]/10">
                {pagedProducts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#EC4899]/5 transition-colors">
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">
                      <div className="flex items-center gap-3">
                        {p.main_image && (
                          <img
                            src={p.main_image}
                            alt=""
                            className="w-10 h-10 rounded object-cover"
                            loading="lazy"
                            decoding="async"
                            sizes="40px"
                          />
                        )}
                        <div>
                          <div className="font-semibold text-xs sm:text-sm text-[#4B2E83] truncate">{p.name}</div>
                          <div className="text-[11px] sm:text-xs text-[#4B2E83]/70 line-clamp-1 max-w-[300px]">{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">{categoryById[p.category_id]?.name || '-'}</td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">₪{p.price}</td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">{p.stock_quantity ?? 0}</td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">
                      <button
                        type="button"
                        onClick={() => { setStatusProduct(p); setStatusOpen(true); }}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-colors ${p.is_active ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200' : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'}`}
                        title="שינוי סטטוס"
                      >
                        {p.is_active ? 'פעיל' : 'לא פעיל'}
                      </button>
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => { setEditProduct(p); setEditOpen(true); }} className="px-1 sm:px-2 py-1 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-[11px] sm:text-xs">עריכה</button>
                        <button onClick={() => { setDeleteProduct(p); setDeleteOpen(true); }} className="px-1 sm:px-2 py-1 bg-red-600/80 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-300 text-[11px] sm:text-xs">מחיקה</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pagedProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-[#4B2E83]/70">לא נמצאו מוצרים תואמים</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-3 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {pagedProducts.map((p: any) => (
                <div key={p.id} className="rounded-xl border border-[#EC4899]/10 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative bg-gray-50">
                    {p.main_image ? (
                      <img
                        src={p.main_image}
                        alt={p.name || ''}
                        className="w-full h-40 sm:h-44 lg:h-48 object-cover"
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-40 sm:h-44 lg:h-48 bg-gradient-to-br from-[#EC4899]/10 to-[#4B2E83]/10 flex items-center justify-center text-[#4B2E83]/60 text-sm">אין תמונה</div>
                    )}
                    <div className="absolute top-2 left-2">
                      <button
                        type="button"
                        onClick={() => { setStatusProduct(p); setStatusOpen(true); }}
                        className={`px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium border ${p.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                        title="שינוי סטטוס"
                      >
                        {p.is_active ? 'פעיל' : 'לא פעיל'}
                      </button>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-[#4B2E83] text-sm sm:text-base truncate">{p.name}</div>
                        <div className="text-[11px] sm:text-xs text-[#4B2E83]/70 truncate">{categoryById[p.category_id]?.name || '-'}</div>
                      </div>
                      <div className="text-[#EC4899] font-bold text-sm sm:text-base whitespace-nowrap">₪{p.price}</div>
                    </div>
                    {p.description && (
                      <div className="text-[11px] sm:text-xs text-[#4B2E83]/70 mt-2 line-clamp-2">{p.description}</div>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div className={`text-[11px] sm:text-xs px-2 py-1 rounded-full border ${
                        (p.stock_quantity ?? 0) > 0
                          ? 'bg-[#4B2E83]/5 text-[#4B2E83] border-[#4B2E83]/20'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {(p.stock_quantity ?? 0) > 0 ? `מלאי: ${p.stock_quantity}` : 'אזל מהמלאי'}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditProduct(p); setEditOpen(true); }} className="px-2 py-1 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-[11px] sm:text-xs">עריכה</button>
                        <button onClick={() => { setDeleteProduct(p); setDeleteOpen(true); }} className="px-2 py-1 bg-red-600/80 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-300 text-[11px] sm:text-xs">מחיקה</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {pagedProducts.length === 0 && (
                <div className="col-span-full p-6 text-center text-[#4B2E83]/70">לא נמצאו מוצרים תואמים</div>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between p-3 sm:p-4 text-xs sm:text-sm border-t border-[#EC4899]/10">
          <div className="text-[#4B2E83]/70">סה"כ: {filteredSortedProducts.length} • עמוד {page} מתוך {totalPages}</div>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded border border-[#EC4899]/20 disabled:opacity-50">הקודם</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded border border-[#EC4899]/20 disabled:opacity-50">הבא</button>
          </div>
        </div>
      </div>
      <ProductEditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        product={editProduct}
        categories={data.categories || []}
        onSaved={fetchShop}
      />
      <ProductStatusModal
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
        product={statusProduct}
        onSaved={fetchShop}
      />
      <ProductDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        product={deleteProduct}
        onDeleted={fetchShop}
      />
    </div>
  );
}


