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
    price: classData.price || 0,
    duration: classData.duration || 60,
    level: classData.level || 'beginner',
    category: classData.category || '',
    is_active: classData.is_active || false,
    slug: classData.slug || ''
  });

  useEffect(() => {
    setFormData({
      name: classData.name || '',
      description: classData.description || '',
      price: classData.price || 0,
      duration: classData.duration || 60,
      level: classData.level || 'beginner',
      category: classData.category || '',
      is_active: classData.is_active || false,
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
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#4B2E83]">
              {isNewClass ? 'הוספת שיעור חדש' : 'עריכת שיעור'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                שם השיעור *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
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
                  className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
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
                className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                מחיר (₪) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
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
                className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                רמה
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              >
                <option value="beginner">מתחילים</option>
                <option value="intermediate">בינוני</option>
                <option value="advanced">מתקדם</option>
                <option value="all">כל הרמות</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-[#EC4899] focus:ring-[#EC4899] border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="mr-2 text-sm font-medium text-[#4B2E83]">
                שיעור פעיל
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">
              תיאור השיעור
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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