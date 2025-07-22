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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#EC4899]">
              {isNewClass ? 'הוספת שיעור חדש' : 'עריכת שיעור'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#EC4899] text-2xl transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* פרטי בסיס - שם, מזהה, קטגוריה */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#EC4899] border-b border-[#EC4899]/20 pb-2">
              פרטי בסיס
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-[#EC4899] mb-2">
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
                  <label className="block text-sm font-medium text-[#EC4899] mb-2">
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
                <label className="block text-sm font-medium text-[#EC4899] mb-2">
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#EC4899] border-b border-[#EC4899]/20 pb-2">
              פרטי מחיר ומשך
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#EC4899] mb-2">
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
                <label className="block text-sm font-medium text-[#EC4899] mb-2">
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
                <label className="block text-sm font-medium text-[#EC4899] mb-2">
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
                <span className="text-sm text-[#EC4899] font-medium text-center">
                  קבוצת גיל: 18+ (ברירת מחדל)
                </span>
              </div>
            </div>
          </div>

          {/* פרטי רמה */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#EC4899] border-b border-[#EC4899]/20 pb-2">
              רמה וקהל יעד
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#EC4899] mb-2">
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#EC4899] border-b border-[#EC4899]/20 pb-2">
              מיקום
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#EC4899] mb-2">
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#EC4899] border-b border-[#EC4899]/20 pb-2">
              מדיה ועיצוב
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-[#EC4899] mb-2">
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
                <label className="block text-sm font-medium text-[#EC4899] mb-2">
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#EC4899] border-b border-[#EC4899]/20 pb-2">
              תיאורים
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#EC4899] mb-2">
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
                <label className="block text-sm font-medium text-[#EC4899] mb-2">
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
                  <label className="block text-sm font-medium text-[#EC4899] mb-2">
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#EC4899] border-b border-[#EC4899]/20 pb-2">
              הגדרות נוספות
            </h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-[#EC4899] focus:ring-[#EC4899] border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="mr-2 text-sm font-medium text-[#EC4899]">
                שיעור פעיל
              </label>
            </div>
          </div>

          {/* כפתורים */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-[#EC4899] text-[#EC4899] rounded-lg font-medium hover:bg-[#EC4899] hover:text-white transition-all duration-300"
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
  );
} 