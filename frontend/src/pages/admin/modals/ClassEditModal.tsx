import React, { useState, useEffect } from 'react';

interface ClassEditModalProps {
  classData: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClass: any) => void;
  isLoading: boolean;
}

export default function ClassEditModal({ classData, isOpen, onClose, onSave, isLoading }: ClassEditModalProps) {
  const isNewClass = !classData.id;
    const [formData, setFormData] = useState({
    name: classData.name || '',
    description: classData.description || '',
    long_description: classData.long_description || '',
    price: classData.price || 0,
    duration: classData.duration || 60,
    level: classData.level || 'מתחילות',
    age_group: '18+', // ברירת מחדל קבועה
    max_participants: classData.max_participants || 5,
    location: classData.location || 'רחוב יוסף לישנסקי 6 ראשון לציון ישראל', // ברירת מחדל
    included: classData.included || '',
    image_url: classData.image_url || '/carousel/image4.png', // ברירת מחדל
    category: classData.category || '',
    color_scheme: classData.color_scheme || 'pink',
    is_active: classData.is_active !== undefined ? classData.is_active : true,
    slug: classData.slug || ''
  });

  useEffect(() => {
    setFormData({
      name: classData.name || '',
      description: classData.description || '',
      long_description: classData.long_description || '',
      price: classData.price || 0,
      duration: classData.duration || 60,
      level: classData.level || 'מתחילות',
      age_group: '18+', // ברירת מחדל קבועה
      max_participants: classData.max_participants || 5,
      location: classData.location || 'רחוב יוסף לישנסקי 6 ראשון לציון ישראל', // ברירת מחדל
      included: classData.included || '',
      image_url: classData.image_url || '/carousel/image4.png', // ברירת מחדל
      category: classData.category || '',
      color_scheme: classData.color_scheme || 'pink',
      is_active: classData.is_active !== undefined ? classData.is_active : true,
      slug: classData.slug || ''
    });
  }, [classData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...classData, ...formData });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isNewClass ? 'הוספת שיעור חדש' : 'עריכת שיעור'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {isNewClass ? 'צור שיעור חדש במערכת' : 'ערוך את פרטי השיעור'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-3xl font-light transition-colors duration-200 hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* פרטי בסיס - שם, מזהה, קטגוריה */}
          <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#4B2E83] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              פרטי בסיס
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                  שם השיעור *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="לדוגמה: ריקוד מודרני למתחילים"
                  className="w-full px-4 py-3 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                />
              </div>
              {isNewClass && (
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    מזהה URL (slug) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="לדוגמה: dance-class-1"
                    className="w-full px-4 py-3 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                  קטגוריה
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="לדוגמה: ריקוד, כושר, יוגה"
                  className="w-full px-4 py-3 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* פרטי מחיר ומשך */}
          <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#4B2E83] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              פרטי מחיר ומשך
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                  מחיר (₪) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="לדוגמה: 150"
                  className="w-full px-4 py-3 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                  משך (דקות) *
                </label>
                <input
                  type="number"
                  required
                  min="15"
                  max="300"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  placeholder="60"
                  className="w-full px-4 py-3 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                  מקסימום משתתפות
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_participants || 5}
                  onChange={(e) => setFormData({ ...formData, max_participants: Number(e.target.value) })}
                  placeholder="5"
                  className="w-full px-4 py-3 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                />
              </div>
              <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
                <span className="text-sm text-[#4B2E83] font-medium text-center">
                  קבוצת גיל: 18+ (ברירת מחדל)
                </span>
              </div>
            </div>
          </div>

          {/* פרטי רמה */}
          <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#4B2E83] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              רמה וקהל יעד
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                  רמה
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-3 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                >
                  <option value="מתחילות">מתחילות</option>
                  <option value="בינוניות">בינוניות</option>
                  <option value="מתקדמות">מתקדמות</option>
                  <option value="כל הרמות">כל הרמות</option>
                </select>
              </div>
            </div>
          </div>

          {/* פרטי מיקום */}
          <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#4B2E83] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              מיקום
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                  מיקום
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="רחוב יוסף לישנסקי 6 ראשון לציון ישראל"
                  className="w-full px-4 py-3 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* מדיה ועיצוב */}
          <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#4B2E83] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              מדיה ועיצוב
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                  קישור לתמונה
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/carousel/image4.png"
                  className="w-full px-4 py-3 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                  ערכת צבע
                </label>
                <select
                  value={formData.color_scheme}
                  onChange={(e) => setFormData({ ...formData, color_scheme: e.target.value })}
                  className="w-full px-4 py-3 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                >
                  <option value="pink">ורוד</option>
                  <option value="purple">סגול</option>
                  <option value="emerald">ירוק</option>
                  <option value="blue">כחול</option>
                  <option value="red">אדום</option>
                  <option value="orange">כתום</option>
                  <option value="yellow">צהוב</option>
                  <option value="green">ירוק כהה</option>
                  <option value="teal">טורקיז</option>
                  <option value="cyan">תכלת</option>
                  <option value="indigo">אינדיגו</option>
                  <option value="violet">סגלגל</option>
                  <option value="fuchsia">פוקסיה</option>
                  <option value="rose">ורדרד</option>
                  <option value="slate">אפור כהה</option>
                  <option value="gray">אפור</option>
                  <option value="zinc">זינק</option>
                  <option value="neutral">נייטרלי</option>
                  <option value="stone">אבן</option>
                  <option value="amber">ענבר</option>
                  <option value="lime">ליים</option>
                </select>
              </div>
            </div>
          </div>

          {/* תיאורים */}
          <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#4B2E83] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              תיאורים
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                  תיאור קצר
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="תיאור קצר של השיעור..."
                  className="w-full px-4 py-3 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                  תיאור ארוך
                </label>
                <textarea
                  rows={4}
                  value={formData.long_description}
                  onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                  placeholder="תיאור מפורט של השיעור, כולל מטרות, תוכן, ומה המשתתפים ילמדו..."
                  className="w-full px-4 py-3 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    מה כלול בשיעור
                  </label>
                  <input
                    type="text"
                    value={formData.included}
                    onChange={(e) => setFormData({ ...formData, included: e.target.value })}
                    placeholder="לדוגמה: ציוד, חומרים, תעודה"
                    className="w-full px-4 py-3 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* הגדרות נוספות */}
          <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#4B2E83] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              הגדרות נוספות
            </h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-[#4B2E83] focus:ring-[#4B2E83] border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="mr-2 text-sm font-medium text-[#4B2E83]">
                שיעור פעיל
              </label>
            </div>
          </div>

          {/* כפתורים */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-[#4B2E83] text-[#4B2E83] rounded-lg font-medium hover:bg-[#4B2E83] hover:text-white transition-all duration-300"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'שומר...' : 'שמור שינויים'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
} 