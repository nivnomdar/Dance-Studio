import { useMemo, useState } from 'react';
 
import ProductEditModal from '../../modals/shop/ProductEditModal';
import ProductStatusModal from '../../modals/shop/ProductStatusModal';
import ProductDeleteModal from '../../modals/shop/ProductDeleteModal';
import { StatusModal } from '../../../components/common/StatusModal';


export default function ProductsTab({ data, fetchShop }: { data: any; fetchShop: () => Promise<void> }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortKey, setSortKey] = useState<'name' | 'price' | 'stock' | 'created'>('created');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusProduct, setStatusProduct] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<any | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);

  const categoryById = useMemo(() => {
    const map: Record<string, any> = {};
    (data.categories || []).forEach((c: any) => { map[c.id] = c; });
    return map;
  }, [data.categories]);

  const filteredSortedProducts = useMemo(() => {
    let list: any[] = [...(data.products || [])];
    if (hiddenIds.size > 0) {
      list = list.filter(p => !hiddenIds.has(String(p.id)));
    }
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
  }, [data.products, categoryById, searchTerm, filterCategoryId, stockFilter, statusFilter, sortKey, sortDir, hiddenIds]);

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
                className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all hover:bg-white hover:shadow-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-[#4B2E83]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B2E83]/40 hover:text-[#4B2E83] transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293-4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="lg:col-span-1">
            <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">קטגוריה</label>
            <select
              value={filterCategoryId}
              onChange={(e) => { setFilterCategoryId(e.target.value); setPage(1); }}
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all hover:bg-white hover:shadow-sm"
            >
              <option value="all">כל הקטגוריות</option>
              {(data.categories || []).map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-2 lg:col-span-3 grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">מלאי</label>
              <select
                value={stockFilter}
                onChange={(e) => { setStockFilter(e.target.value as any); setPage(1); }}
                className="w-full px-3 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all hover:bg-white hover:shadow-sm"
              >
                <option value="all">כל המלאי</option>
                <option value="in">במלאי</option>
                <option value="low">מלאי נמוך (≤5)</option>
                <option value="out">אזל מהמלאי</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">סטטוס</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
                className="w-full px-3 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all hover:bg-white hover:shadow-sm"
              >
                <option value="all">הכל</option>
                <option value="active">פעיל</option>
                <option value="inactive">לא פעיל</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">מיון</label>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as any)}
                className="w-full px-3 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all hover:bg-white hover:shadow-sm"
              >
                <option value="created">תאריך</option>
                <option value="name">שם</option>
                <option value="price">מחיר</option>
                <option value="stock">מלאי</option>
              </select>
            </div>
          </div>
          <div className="lg:col-span-1">
            <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">כיוון</label>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as any)}
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all hover:bg-white hover:shadow-sm"
            >
              <option value="desc">יורד</option>
              <option value="asc">עולה</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2 invisible">פעולה</label>
            <button
              onClick={() => { setEditProduct(null); setEditOpen(true); }}
              className="w-full min-w-[120px] px-3 py-2.5 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-sm flex items-center justify-center gap-1.5 shadow-lg hover:shadow-xl h-12 cursor-pointer"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>מוצר חדש</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products - Table or Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-[#EC4899]/10">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-bold text-[#4B2E83]">ניהול מוצרים</h2>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs bg-gradient-to-r from-[#EC4899]/10 to-[#4B2E83]/10 text-[#4B2E83] border border-[#EC4899]/20">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18"/></svg>
                {data.products?.length || 0}
              </span>
            </div>
            <div role="group" aria-label="החלפת תצוגה" className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-pressed={viewMode === 'table'}
                aria-label="תצוגת טבלה"
                title="תצוגת טבלה"
                className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg border transition-all text-xs sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4899]/40 cursor-pointer ${viewMode === 'table' ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white border-transparent' : 'bg-white text-[#4B2E83] border-[#EC4899]/20 hover:bg-[#EC4899]/5'}`}
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
                className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg border transition-all text-xs sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4899]/40 cursor-pointer ${viewMode === 'cards' ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white border-transparent' : 'bg-white text-[#4B2E83] border-[#EC4899]/20 hover:bg-[#EC4899]/5'}`}
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
          <p className="text-sm sm:text-base text-[#4B2E83]/70">הצגת מוצרים, מחירים, מלאי וסטטוס</p>
        </div>
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed">
              <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
                <tr>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-[40%]">מוצר</th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-[22%]">קטגוריה</th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-[8%]">מחיר</th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-[8%]">מלאי</th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-[8%]">סטטוס</th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-[14%]">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EC4899]/10">
                {pagedProducts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#EC4899]/5 transition-colors">
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">
                      <div className="flex items-center gap-3 min-w-0">
                        {p.main_image && (
                          <img
                            src={p.main_image}
                            alt=""
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                            loading="lazy"
                            decoding="async"
                            sizes="40px"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-xs sm:text-sm text-[#4B2E83] truncate" title={p.name}>{p.name}</div>
                          <div className="text-[11px] sm:text-xs text-[#4B2E83]/70 truncate" title={p.description}>{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                      <div className="truncate inline-block max-w-full align-middle" title={categoryById[p.category_id]?.name || '-' }>
                        {categoryById[p.category_id]?.name || '-'}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">₪{p.price}</td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">{p.stock_quantity ?? 0}</td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                      <button
                        type="button"
                        onClick={() => { setStatusProduct(p); setStatusOpen(true); }}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-colors cursor-pointer ${p.is_active ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200' : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'}`}
                        title="שינוי סטטוס"
                      >
                        {p.is_active ? 'פעיל' : 'לא פעיל'}
                      </button>
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => { setEditProduct(p); setEditOpen(true); }} aria-label="עריכה" title="עריכה" className="px-1 sm:px-2 py-1 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-[11px] sm:text-xs cursor-pointer">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M4 16l4 4 12-12-4-4-12 12z" />
                          </svg>
                        </button>
                        <button onClick={() => { setDeleteProduct(p); setDeleteOpen(true); }} aria-label="מחיקה" title="מחיקה" className="px-1 sm:px-2 py-1 bg-red-600/80 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-300 text-[11px] sm:text-xs cursor-pointer">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7H5m3-3h8m-1 3l-1 12a2 2 0 01-2 2H9a2 2 0 01-2-2L6 7m5 4v6m4-6v6" />
                          </svg>
                        </button>
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 items-stretch">
              {pagedProducts.map((p: any) => (
                <div key={p.id} className="rounded-xl border border-[#EC4899]/10 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="relative bg-gray-50 flex-shrink-0">
                    {p.main_image ? (
                      <img
                        src={p.main_image}
                        alt={p.name || ''}
                        className="w-full h-24 sm:h-32 object-cover"
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-[#EC4899]/10 to-[#4B2E83]/10 flex items-center justify-center text-[#4B2E83]/60 text-sm">אין תמונה</div>
                    )}
                    <div className="absolute top-2 left-2">
                      <button
                        type="button"
                        onClick={() => { setStatusProduct(p); setStatusOpen(true); }}
                        className={`px-2 py-1 rounded-full text-xs font-medium border cursor-pointer ${p.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                        title="שינוי סטטוס"
                      >
                        {p.is_active ? 'פעיל' : 'לא פעיל'}
                      </button>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border cursor-default bg-white/80 backdrop-blur-sm shadow-sm ${
                        (p.stock_quantity ?? 0) > 0
                          ? 'text-[#4B2E83] border-[#4B2E83]/20'
                          : 'text-red-700 border-red-200'
                      }`}>
                        {(p.stock_quantity ?? 0) > 0 ? `מלאי: ${p.stock_quantity}` : 'אזל מהמלאי'}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-[#4B2E83] text-sm truncate" title={p.name}>{p.name}</div>
                        <div className="text-xs text-[#4B2E83]/70 truncate mt-1" title={categoryById[p.category_id]?.name || '-' }>{categoryById[p.category_id]?.name || '-'}</div>
                      </div>
                      <div className="text-[#EC4899] font-bold text-lg whitespace-nowrap flex-shrink-0">₪{p.price}</div>
                    </div>
                    <div
                      className="text-xs text-[#4B2E83]/70 mb-2 line-clamp-2"
                      title={p.description || ''}
                    >
                      {p.description || ''}
                    </div>
                    <div className="mt-auto pt-2">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditProduct(p); setEditOpen(true); }} aria-label="עריכה" title="עריכה" className="flex-1 px-3 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-xs cursor-pointer">
                          <span className="flex items-center justify-center">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M4 16l4 4 12-12-4-4-12 12z" />
                            </svg>
                          </span>
                        </button>
                        <button onClick={() => { setDeleteProduct(p); setDeleteOpen(true); }} aria-label="מחיקה" title="מחיקה" className="flex-1 px-3 py-2 bg-red-600/80 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-300 text-xs cursor-pointer">
                          <span className="flex items-center justify-center">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7H5m3-3h8m-1 3l-1 12a2 2 0 01-2 2H9a2 2 0 01-2-2L6 7m5 4v6m4-6v6" />
                            </svg>
                          </span>
                        </button>
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
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded border border-[#EC4899]/20 disabled:opacity-50 cursor-pointer">הקודם</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded border border-[#EC4899]/20 disabled:opacity-50 cursor-pointer">הבא</button>
          </div>
        </div>
      </div>
      <ProductEditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        product={editProduct}
        categories={data.categories || []}
        products={data.products || []}
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
        onDeleted={async () => {
          if (deleteProduct?.id) {
            setHiddenIds(prev => {
              const next = new Set(prev);
              next.add(String(deleteProduct.id));
              return next;
            });
          }
          await fetchShop();
          setDeleteSuccessOpen(true);
        }}
      />
      <StatusModal
        isOpen={deleteSuccessOpen}
        onClose={() => setDeleteSuccessOpen(false)}
        type="success"
        title="המוצר נמחק"
        message="המוצר הוסר בהצלחה מהמלאי"
      />
    </div>
  );
}



