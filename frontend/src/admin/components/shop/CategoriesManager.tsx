import { useEffect, useMemo, useState } from 'react';
import Modal from '../../../components/common/Modal';
import { StatusModal } from '../../../components/common/StatusModal';
import { apiService } from '../../../lib/api';

interface CategoriesManagerProps {
  categories: any[];
  fetchShop: () => Promise<void>;
}

export default function CategoriesManager({ categories, fetchShop }: CategoriesManagerProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);
  const [localCategories, setLocalCategories] = useState<any[]>(categories || []);
  const [successState, setSuccessState] = useState<{ title: string; message: string } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Sync with incoming props when they change
  useEffect(() => {
    setLocalCategories(categories || []);
  }, [categories]);

  const parents = useMemo(() => (localCategories || []).filter((c: any) => !c.parent_id), [localCategories]);
  const childrenByParent = useMemo(() => {
    const map: Record<string, any[]> = {};
    (localCategories || []).forEach((c: any) => {
      if (!c.parent_id) return;
      const key = String(c.parent_id);
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map;
  }, [localCategories]);

  // Stats for badges
  // Counts for badges: only subcategories are considered "categories"
  const subsAll = (localCategories || []).filter((c: any) => !!c.parent_id);
  const totalCategories = subsAll.length; // exclude parent categories from total
  const activeSubsCount = parents
    .filter((p: any) => p.is_active !== false)
    .reduce((sum: number, p: any) => sum + ((childrenByParent[String(p.id)] || []).filter((s: any) => s.is_active !== false).length), 0);
  const activeCategoriesEffective = activeSubsCount; // only subcategories under active parents
  const inactiveCategories = totalCategories - activeCategoriesEffective;

  const resetAddState = () => {
    setNewCategoryName('');
    setParentCategoryId(undefined);
  };

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setSaving(true);
      const created = await apiService.shop.createCategory({ name: newCategoryName.trim(), parent_id: parentCategoryId || null, description: undefined });
      setLocalCategories(prev => [...prev, created]);
      resetAddState();
      setIsAddOpen(false);
      setSuccessState({ title: 'נשמר בהצלחה', message: 'הקטגוריה נוספה למערכת' });
      // Refresh in background to ensure full sync (e.g., computed fields)
      void fetchShop();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      setSaving(true);
      const updated = await apiService.shop.updateCategory(String(editing.id), {
        name: editing.name,
        parent_id: editing.parent_id ?? null,
        description: editing.description ?? null,
      });
      setLocalCategories(prev => prev.map(c => String(c.id) === String(editing.id) ? { ...c, ...updated } : c));
      setIsEditOpen(false);
      setEditing(null);
      setSuccessState({ title: 'עודכן בהצלחה', message: 'הקטגוריה עודכנה במערכת' });
      void fetchShop();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      setSaving(true);
      await apiService.shop.deleteCategory(String(deleting.id));
      setLocalCategories(prev => prev.filter(c => String(c.id) !== String(deleting.id)));
      setIsDeleteOpen(false);
      setDeleting(null);
      setSuccessState({ title: 'נמחק בהצלחה', message: 'הקטגוריה הוסרה מהמערכת' });
      void fetchShop();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (cat: any) => {
    try {
      setTogglingId(String(cat.id));
      const current = cat.is_active === false ? false : true;
      const next = !current;
      const updated = await apiService.shop.updateCategory(String(cat.id), { is_active: next });
      setLocalCategories(prev => prev.map(c => String(c.id) === String(cat.id) ? { ...c, ...(updated || {}), is_active: next } : c));
      setSuccessState({ title: 'עודכן בהצלחה', message: next ? 'הקטגוריה סומנה כפעילה' : 'הקטגוריה הוסתרה מהחנות' });
      void fetchShop();
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
    <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
      <div className="flex items-center justify-between mb-4">
        {(() => {
          const total = categories?.length || 0;
          const parentCount = parents.length;
          const subs = total - parentCount;
          return (
            <h3 className="text-lg font-semibold text-[#4B2E83]">
              קטגוריות ({parentCount} ראשיות · {subs} תתי־קטגוריות)
            </h3>
          );
        })()}
        <button
          onClick={() => setIsAddOpen(true)}
          className="w-auto min-w-[140px] px-3 py-2.5 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-sm flex items-center justify-center gap-1.5 shadow-lg hover:shadow-xl h-10 sm:h-12 cursor-pointer"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>קטגוריה חדשה</span>
        </button>
      </div>

      {/* Badges row */}
      <div className="w-full flex items-center justify-center gap-2 flex-wrap mb-3">
        <span className="group relative inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs bg-gradient-to-r from-[#EC4899]/10 to-[#4B2E83]/10 text-[#4B2E83] border border-[#EC4899]/20">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18"/></svg>
          {totalCategories}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">סה"כ קטגוריות</div>
        </span>
        <span className="group relative inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/30">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/></svg>
          {activeCategoriesEffective}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">קטגוריות פעילות</div>
        </span>
        <span className="group relative inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs bg-white text-gray-600 border border-gray-300">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/></svg>
          {inactiveCategories}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">קטגוריות לא פעילות</div>
        </span>
      
      </div>

      {parents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {parents.map((cat: any) => {
            const parentInactive = (cat.is_active === false);
            return (
            <div key={cat.id} className={`p-3 rounded-xl border ${parentInactive ? 'bg-gray-50 border-gray-200' : 'bg-[#EC4899]/5 border-[#EC4899]/10'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className={`font-medium truncate ${cat.is_active === false ? 'text-[#4B2E83]/50' : 'text-[#4B2E83]'}`} title={cat.name}>{cat.name}</div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    title={cat.is_active === false ? 'הפכי לפעיל' : 'הסתירי קטגוריה'}
                    aria-label="החלפת מצב פעילות"
                    disabled={togglingId === String(cat.id)}
                    onClick={() => toggleActive(cat)}
                    className={`p-1 rounded-md border ${cat.is_active === false ? 'border-gray-300 text-gray-500 bg-gray-50 hover:bg-gray-100' : 'border-[#EC4899]/20 text-[#EC4899] bg-white hover:bg-[#EC4899]/5'} disabled:opacity-50 cursor-pointer`}
                  >
                    {cat.is_active === false ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    title="עריכה"
                    aria-label="עריכה"
                    onClick={() => { setEditing({ ...cat }); setIsEditOpen(true); }}
                    className="p-1 rounded-md border border-[#EC4899]/20 text-[#4B2E83] hover:bg-[#EC4899]/10 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M4 16l4 4 12-12-4-4-12 12z" /></svg>
                  </button>
                  <button
                    type="button"
                    title="מחיקה"
                    aria-label="מחיקה"
                    onClick={() => { setDeleting(cat); setIsDeleteOpen(true); }}
                    className="p-1 rounded-md bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7H5m3-3h8m-1 3l-1 12a2 2 0 01-2 2H9a2 2 0 01-2-2L6 7m5 4v6m4-6v6" /></svg>
                  </button>
                </div>
              </div>
              <div className="mt-2 space-y-1 max-h-36 overflow-y-auto pr-1">
                {(childrenByParent[String(cat.id)] || []).map((sub: any) => (
                  <div key={sub.id} className="flex items-center justify-between gap-2 text-sm truncate" title={sub.name}>
                    <span className={`truncate ${sub.is_active === false ? 'text-[#4B2E83]/50' : 'text-[#4B2E83]/80'}`}>• {sub.name}</span>
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        title={sub.is_active === false ? 'הפכי לפעיל' : 'הסתירי קטגוריה'}
                        aria-label="החלפת מצב פעילות"
                        disabled={togglingId === String(sub.id)}
                        onClick={() => toggleActive(sub)}
                        className={`p-1 rounded-md border ${sub.is_active === false ? 'border-gray-300 text-gray-500 bg-gray-50 hover:bg-gray-100' : 'border-[#EC4899]/20 text-[#EC4899] bg-white hover:bg-[#EC4899]/5'} disabled:opacity-50 cursor-pointer`}
                      >
                        {sub.is_active === false ? (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                      <button
                        type="button"
                        title="עריכה"
                        aria-label="עריכה"
                        onClick={() => { setEditing({ ...sub }); setIsEditOpen(true); }}
                        className="p-1 rounded-md border border-[#EC4899]/20 text-[#4B2E83] hover:bg-[#EC4899]/10 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M4 16l4 4 12-12-4-4-12 12z" /></svg>
                      </button>
                      <button
                        type="button"
                        title="מחיקה"
                        aria-label="מחיקה"
                        onClick={() => { setDeleting(sub); setIsDeleteOpen(true); }}
                        className="p-1 rounded-md bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7H5m3-3h8m-1 3l-1 12a2 2 0 01-2 2H9a2 2 0 01-2-2L6 7m5 4v6m4-6v6" /></svg>
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-[#4B2E83]/70 text-center">אין קטגוריות כרגע</p>
        </div>
      )}

      {/* Add Category Modal */}
      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); resetAddState(); }}>
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
              {parents.map((c: any) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 rounded-lg border cursor-pointer" onClick={() => { setIsAddOpen(false); resetAddState(); }}>ביטול</button>
            <button
              disabled={saving || !newCategoryName.trim()}
              onClick={handleCreate}
              className="px-4 py-2 rounded-lg bg-[#EC4899] text-white disabled:opacity-50 cursor-pointer"
            >
              שמירה
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditing(null); }}>
        <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">עריכת קטגוריה</h3>
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#4B2E83]/70 mb-1">שם קטגוריה</label>
              <input
                value={editing.name || ''}
                onChange={(e) => setEditing((prev: any) => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                placeholder="שם"
              />
            </div>
            <div>
              <label className="block text-sm text-[#4B2E83]/70 mb-1">קטגוריית אם (לא חובה)</label>
              <select
                value={editing.parent_id || ''}
                onChange={(e) => setEditing((prev: any) => ({ ...prev, parent_id: e.target.value || null }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
              >
                <option value="">ללא</option>
                {parents.filter(p => String(p.id) !== String(editing.id)).map((c: any) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border cursor-pointer" onClick={() => { setIsEditOpen(false); setEditing(null); }}>ביטול</button>
              <button
                disabled={saving || !(editing.name || '').trim()}
                onClick={handleUpdate}
                className="px-4 py-2 rounded-lg bg-[#EC4899] text-white disabled:opacity-50 cursor-pointer"
              >
                שמירה
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Category Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => { setIsDeleteOpen(false); setDeleting(null); }}>
        <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">מחיקת קטגוריה</h3>
        <p className="text-sm text-[#4B2E83]/70 mb-4">האם למחוק את הקטגוריה "{deleting?.name}"? פעולה זו בלתי הפיכה.</p>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded-lg border cursor-pointer" onClick={() => { setIsDeleteOpen(false); setDeleting(null); }}>ביטול</button>
          <button
            disabled={saving}
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50 cursor-pointer hover:bg-red-700"
          >
            מחיקה
          </button>
        </div>
      </Modal>
    </div>
    <StatusModal
      isOpen={!!successState}
      onClose={() => setSuccessState(null)}
      type="success"
      title={successState?.title || 'הצלחה'}
      message={successState?.message || ''}
    />
    </>
  );
}


