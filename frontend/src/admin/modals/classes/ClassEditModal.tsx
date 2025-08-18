import React, { useState, useEffect } from 'react';
import ResponsiveSelect from '../../../components/ui/ResponsiveSelect';

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
    age_group: classData.age_group || '18+',
    
    location: classData.location || 'רחוב יוסף לישנסקי 6 ראשון לציון ישראל',
    included: classData.included || '',
    image_url: classData.image_url || '/carousel/image4.png',
    video_url: classData.video_url || '',
    category: classData.category || '',
    color_scheme: classData.color_scheme || 'pink',
    registration_type: classData.registration_type || 'standard',
    class_type: classData.class_type || 'group',
    group_credits: classData.group_credits || 0,
    private_credits: classData.private_credits || 0,
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
      age_group: classData.age_group || '18+',

      location: classData.location || 'רחוב יוסף לישנסקי 6 ראשון לציון ישראל',
      included: classData.included || '',
      image_url: classData.image_url || '/carousel/image4.png',
      video_url: classData.video_url || '',
      category: classData.category || '',
      color_scheme: classData.color_scheme || 'pink',
      registration_type: classData.registration_type || 'standard',
      class_type: classData.class_type || 'group',
      group_credits: classData.group_credits || 0,
      private_credits: classData.private_credits || 0,
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl">
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
          <form onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* פרטי בסיס ומחיר */}
          <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-[#4B2E83] mb-3 sm:mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              פרטי בסיס ומחיר
            </h3>
            <div className="space-y-4 sm:space-y-6">
              {/* שורה ראשונה - פרטי בסיס */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                    שם השיעור *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="לדוגמה: ריקוד מודרני למתחילים"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
                {isNewClass && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                      מזהה URL *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="dance-class-1"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                    קטגוריה
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="ריקוד, כושר, יוגה"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
              </div>

              {/* שורה שנייה - מחיר ומשך */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                    placeholder="150"
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
                  <ResponsiveSelect
                    label="רמה"
                    value={formData.level}
                    onChange={(v) => setFormData({ ...formData, level: v })}
                    options={[
                      { value: 'מתחילות', label: 'מתחילות' },
                      { value: 'בינוניות', label: 'בינוניות' },
                      { value: 'מתקדמות', label: 'מתקדמות' },
                      { value: 'כל הרמות', label: 'כל הרמות' }
                    ]}
                    menuZIndex={70}
                  />
                </div>
              </div>

              {/* שורה שלישית - תיאורים */}
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                      תיאור קצר
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="תיאור קצר של השיעור..."
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                      מה כלול בשיעור
                    </label>
                    <input
                      type="text"
                      value={formData.included}
                      onChange={(e) => setFormData({ ...formData, included: e.target.value })}
                      placeholder="ציוד, חומרים, תעודה"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                    תיאור ארוך
                  </label>
                  <textarea
                    rows={3}
                    value={formData.long_description}
                    onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                    placeholder="תיאור מפורט של השיעור, כולל מטרות, תוכן, ומה המשתתפים ילמדו..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

                    {/* מיקום ומדיה */}
          <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-[#4B2E83] mb-3 sm:mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              מיקום ומדיה
            </h3>
            <div className="space-y-4 sm:space-y-6">
              {/* שורה ראשונה - מיקום */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div>
                                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                      מיקום
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="רחוב יוסף לישנסקי 6 ראשון לציון ישראל"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <ResponsiveSelect
                      label="ערכת צבע"
                      value={formData.color_scheme}
                      onChange={(v) => setFormData({ ...formData, color_scheme: v })}
                      options={[
                        { value: 'pink', label: 'ורוד' },
                        { value: 'purple', label: 'סגול' },
                        { value: 'emerald', label: 'ירוק' },
                        { value: 'blue', label: 'כחול' },
                        { value: 'red', label: 'אדום' },
                        { value: 'orange', label: 'כתום' },
                        { value: 'yellow', label: 'צהוב' },
                        { value: 'green', label: 'ירוק כהה' },
                        { value: 'teal', label: 'טורקיז' },
                        { value: 'cyan', label: 'תכלת' },
                        { value: 'indigo', label: 'אינדיגו' },
                        { value: 'violet', label: 'סגלגל' },
                        { value: 'fuchsia', label: 'פוקסיה' },
                        { value: 'rose', label: 'ורדרד' },
                        { value: 'slate', label: 'אפור כהה' },
                        { value: 'gray', label: 'אפור' },
                        { value: 'zinc', label: 'זינק' },
                        { value: 'neutral', label: 'נייטרלי' },
                        { value: 'stone', label: 'אבן' },
                        { value: 'amber', label: 'ענבר' },
                        { value: 'lime', label: 'ליים' }
                      ]}
                      menuZIndex={70}
                    />
                  </div>
              </div>

              {/* שורה שנייה - מדיה */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                    קישור לוידאו
                  </label>
                  <input
                    type="text"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                    בחירת תמונה
                  </label>
                  <div className="space-y-3 sm:space-y-4">
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="/carousel/image4.png"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                    />
                    
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h4 className="text-xs sm:text-sm font-medium text-[#4B2E83] mb-2 sm:mb-3">תמונות זמינות</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                        {[
                          { id: 1, url: '/carousel/image1.png', name: 'תמונה 1', alt: 'תמונה ראשונה' },
                          { id: 2, url: '/carousel/image2.png', name: 'תמונה 2', alt: 'תמונה שנייה' },
                          { id: 3, url: '/carousel/image3.png', name: 'תמונה 3', alt: 'תמונה שלישית' },
                          { id: 4, url: '/carousel/image4.png', name: 'תמונה 4', alt: 'תמונה רביעית' },
                          { id: 5, url: '/carousel/image5.png', name: 'תמונה 5', alt: 'תמונה חמישית' }
                        ].map((image) => (
                          <div
                            key={image.id}
                            onClick={() => setFormData({ ...formData, image_url: image.url })}
                                                      className={`group relative cursor-pointer rounded-lg border-2 transition-all duration-300 hover:shadow-md overflow-hidden ${
                            formData.image_url === image.url
                              ? 'border-[#EC4899] bg-[#EC4899]/5 shadow-md ring-2 ring-[#EC4899]/20'
                              : 'border-gray-200 bg-white hover:border-[#EC4899]/40'
                          }`}
                        >
                          {/* Image Container */}
                          <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                            <img
                              src={image.url}
                              alt={image.alt}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.parentElement?.querySelector('.image-fallback') as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            {/* Fallback for failed images */}
                            <div className="image-fallback hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <div className="text-center">
                                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-gray-500">{image.name}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Selection Indicator */}
                          {formData.image_url === image.url && (
                            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 bg-[#EC4899] rounded-full flex items-center justify-center shadow-md">
                              <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs">לחצי על תמונה לבחירה או הזיני קישור מותאם אישית</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* הגדרות נוספות */}
          <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-[#4B2E83] mb-3 sm:mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              הגדרות נוספות
            </h3>
            <div className="space-y-3 sm:space-y-4">
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
              
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <ResponsiveSelect
                    label="סוג הרשמה"
                    value={formData.registration_type}
                    onChange={(v) => setFormData({ ...formData, registration_type: v })}
                    options={[
                      { value: 'standard', label: 'הרשמה רגילה' },
                      { value: 'appointment_only', label: 'רק בתיאום' }
                    ]}
                    menuZIndex={70}
                  />
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>הרשמה רגילה:</strong> תלמידות יכולות להירשם ישירות לשיעור</p>
                    <p><strong>רק בתיאום:</strong> תלמידות צריכות לתאם עם המורה לפני ההרשמה</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                    קבוצת גיל
                  </label>
                  <input
                    type="text"
                    value={formData.age_group}
                    onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                    placeholder="18+"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <ResponsiveSelect
                    label="סוג קרדיטים"
                    value={formData.class_type}
                    onChange={(v) => setFormData({ ...formData, class_type: v })}
                    options={[
                      { value: 'group', label: 'קבוצתי' },
                      { value: 'private', label: 'פרטי' },
                      { value: 'both', label: 'שניהם' }
                    ]}
                    menuZIndex={70}
                  />
                  <p className="text-xs text-gray-600">
                    סוג הקרדיטים שהשיעור מציע: קבוצתי, פרטי, או שניהם
                  </p>
                </div>
                <div>
                  <ResponsiveSelect
                    label="קטגוריה"
                    value={formData.category}
                    onChange={(v) => setFormData({ ...formData, category: v })}
                    options={[
                      { value: '', label: 'בחרי קטגוריה' },
                      { value: 'trial', label: 'שיעור ניסיון' },
                      { value: 'single', label: 'שיעור בודד' },
                      { value: 'private', label: 'שיעור פרטי' },
                      { value: 'subscription', label: 'מנוי' }
                    ]}
                    menuZIndex={70}
                  />
                  <p className="text-xs text-gray-600">
                    קטגוריית השיעור (משפיע על סוג הקרדיטים בשיעורים מסוג 'both')
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                    נקודות זכות קבוצתיות
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      min="0"
                      value={formData.group_credits}
                      onChange={(e) => setFormData({ ...formData, group_credits: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                    />
                    <p className="text-xs text-gray-600">
                      מספר השיעורים הקבוצתיים (קרדיטים) שהתלמידה מקבלת על רכישת השיעור
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                    נקודות זכות פרטיות
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      min="0"
                      value={formData.private_credits}
                      onChange={(e) => setFormData({ ...formData, private_credits: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                    />
                    <p className="text-xs text-gray-600">
                      מספר השיעורים הפרטיים (קרדיטים) שהתלמידה מקבלת על רכישת השיעור
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* כפתורים */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2 border border-[#4B2E83] text-[#4B2E83] rounded-lg font-medium hover:bg-[#4B2E83] hover:text-white transition-all duration-300 text-sm sm:text-base"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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