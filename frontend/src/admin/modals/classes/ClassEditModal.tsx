import React, { useState, useEffect, useRef } from 'react';
import ResponsiveSelect from '../../../components/ui/ResponsiveSelect';
import { translateCategory } from '../../../utils/categoryUtils';
import { REGISTRATION_TYPE_OPTIONS } from '../../../utils/constants';
import { getDefaultClassImage } from '../../../config/classImages';
import ClassImagesSection from './ClassImagesSection';
import type { ClassImagesSectionHandle } from './types';

interface ClassEditModalProps {
  classData: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClass: any) => void;
  isLoading: boolean;
}

export default function ClassEditModal({ classData, isOpen, onClose, onSave, isLoading }: ClassEditModalProps) {
  const isNewClass = !classData.id;
  const imagesRef = useRef<ClassImagesSectionHandle>(null);
  const [showCreditsSection, setShowCreditsSection] = useState(
    !isNewClass && (classData.group_credits > 0 || classData.private_credits > 0)
  );

  
  // State לניהול הודעות
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  
    const [formData, setFormData] = useState({
    name: classData.name || '',
    description: classData.description || '',
    long_description: classData.long_description || '',
    price: classData.price || 0,
    duration: classData.duration || 60,
    level: classData.level || 'מתחילות',
    age_group: classData.age_group || '18+',
    
    location: classData.location || 'רחוב יוסף לישנסקי 6 ראשון לציון ישראל',
    included: classData.included || (isNewClass ? 'חימום, לימוד טכניקות, תרגול צעדים וריקוד קצר.\nברכיות ספוג לברכיים' : ''),
    image_url: classData.image_url || getDefaultClassImage().url,
    video_url: classData.video_url || '',
    category: classData.category || '',
    color_scheme: classData.color_scheme || 'pink',
    registration_type: classData.registration_type || 'standard',
    class_type: classData.class_type || '',
    group_credits: classData.group_credits || 0,
    private_credits: classData.private_credits || 0,
    is_active: classData.is_active !== undefined ? classData.is_active : true,
    slug: classData.slug || '' // Preserve existing slug, don't default to empty string
  });

  // Check if credits section should be enabled based on registration type
  const creditsEnabled = formData.registration_type === 'subscription';
  
  // Auto-set class_type based on registration_type
  useEffect(() => {
    if (formData.registration_type === 'standard') {
      setFormData(prev => ({ ...prev, class_type: 'group' }));
    } else if (formData.registration_type === 'appointment_only') {
      setFormData(prev => ({ ...prev, class_type: 'private' }));
    }
    // For subscription, keep the user's choice or default to empty
  }, [formData.registration_type]);

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
      included: classData.included || (isNewClass ? 'חימום, לימוד טכניקות, תרגול צעדים וריקוד קצר.\nברכיות ספוג לברכיים' : ''),
      image_url: classData.image_url || getDefaultClassImage().url,
      video_url: classData.video_url || '',
      category: classData.category || '',
      color_scheme: classData.color_scheme || 'pink',
      registration_type: classData.registration_type || 'standard',
      class_type: classData.class_type || '',
      group_credits: classData.group_credits || 0,
      private_credits: classData.private_credits || 0,
      is_active: classData.is_active !== undefined ? classData.is_active : true,
      slug: classData.slug || '' // Preserve existing slug, don't default to empty string
    });
  }, [classData, isNewClass, isOpen]);

  // Effect to handle credits section visibility based on registration type
  useEffect(() => {
    if (!creditsEnabled && showCreditsSection) {
      setShowCreditsSection(false);
    }
  }, [creditsEnabled, showCreditsSection]);

  // פונקציה להצגת הודעות
  const showMessagePopup = (type: 'success' | 'error', title: string, content: string) => {
    setMessageType(type);
    setMessageTitle(title);
    setMessageContent(content);
    setShowMessage(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ולידציה: אם מערכת קרדיטים פעילה עבור מנוי, חייב לבחור סוג קרדיטים
    if (showCreditsSection && creditsEnabled && !formData.class_type) {
      alert('יש לבחור סוג קרדיטים עבור שיעור מנוי');
      return;
    }
    
    try {
      // העלאת תמונות ממתינות דרך קומפוננטת התמונות
      await imagesRef.current?.uploadPendingImages();
      // מחיקת תמונות שסומנו למחיקה (ב-Supabase) לפני שמירה
      await imagesRef.current?.commitDeletions();
      
      // Prepare data for save, ensuring slug is handled properly
      const dataToSave = { ...classData, ...formData };
      
      // If slug is empty and we have an existing slug, preserve it
      if (!dataToSave.slug && classData.slug) {
        dataToSave.slug = classData.slug;
      }
      
      // שליחה לשמירה
      onSave(dataToSave);
      
    } catch (error) {
      console.error('שגיאה בשמירת השיעור:', error);
      alert('אירעה שגיאה בשמירת השיעור. נסי שוב.');
    }
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
                  {isNewClass ? 'צרי שיעור חדש במערכת' : 'עריכת פרטי השיעור'}
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
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* פרטי בסיס */}
          <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-4">
            <h3 className="text-lg font-bold text-[#4B2E83] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              פרטי בסיס
            </h3>
            <div className="space-y-4">
              {/* שורה ראשונה - שם השיעור ומזהה */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    שם השיעור *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="עקבים - שיעור בודד"
                    className="w-full px-3 py-2 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
                {isNewClass && (
                  <div>
                    <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                      מזהה URL *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="heels-single-class"
                      className="w-full px-3 py-2 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                    />
                  </div>
                )}
              </div>

              {/* שורה שנייה - פרטי השיעור */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <ResponsiveSelect
                    label="קטגוריה"
                    value={formData.category}
                    onChange={(v) => setFormData({ ...formData, category: v })}
                    options={[
                      { value: '', label: 'ללא קטגוריה' },
                      { value: 'trial', label: translateCategory('trial') },
                      { value: 'single', label: translateCategory('single') },
                      { value: 'private', label: translateCategory('private') },
                      { value: 'subscription', label: translateCategory('subscription') }
                    ]}
                    menuZIndex={70}
                  />
                </div>
                <div>
                  <ResponsiveSelect
                    label="רמה"
                    value={formData.level}
                    onChange={(v) => setFormData({ ...formData, level: v })}
                    options={['מתחילות', 'בינוניות', 'מתקדמות', 'כל הרמות'].map(level => ({ value: level, label: level }))}
                    menuZIndex={70}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    מיקום
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="רחוב יוסף לישנסקי 6"
                    className="w-full px-3 py-2 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    קבוצת גיל
                  </label>
                  <input
                    type="text"
                    value={formData.age_group}
                    onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                    placeholder="18+"
                    className="w-full px-3 py-2 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
              </div>

              {/* שורה שלישית - מחיר ופרטים נוספים */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                    className="w-full px-3 py-2 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    משך (דק') *
                  </label>
                  <input
                    type="number"
                    required
                    min="15"
                    max="300"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    placeholder="60"
                    className="w-full px-3 py-2 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
                <div>
                  <ResponsiveSelect
                    label="סוג הרשמה"
                    value={formData.registration_type}
                    onChange={(v) => setFormData({ ...formData, registration_type: v })}
                    options={REGISTRATION_TYPE_OPTIONS}
                    menuZIndex={70}
                  />
                </div>
              </div>

              {/* שורה רביעית - תיאורים */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                      תיאור קצר
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="תיאור קצר של השיעור..."
                    className="w-full px-3 py-2 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    מה כלול בשיעור
                  </label>
                  <textarea
                    rows={2}
                    value={formData.included}
                    onChange={(e) => setFormData({ ...formData, included: e.target.value })}
                    placeholder="חימום, לימוד טכניקות, תרגול צעדים וריקוד קצר.&#10;ברכיות ספוג לברכיים"
                    className="w-full px-3 py-2 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
              </div>
              
              {/* שורה חמישית - תיאור מפורט */}
              <div>
                <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                  תיאור מפורט
                </label>
                <textarea
                  rows={2}
                  value={formData.long_description}
                  onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                  placeholder="תיאור מפורט של השיעור..."
                  className="w-full px-3 py-2 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* מערכת קרדיטים */}
          <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#4B2E83] flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                מערכת קרדיטים
                {!creditsEnabled && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                    <span className="hidden sm:inline">זמין רק למנוי</span>
                    <span className="sm:hidden">למנוי בלבד</span>
                  </span>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setShowCreditsSection(!showCreditsSection)}
                disabled={!creditsEnabled}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                  !creditsEnabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : showCreditsSection
                    ? 'bg-[#EC4899] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={!creditsEnabled ? 'מערכת קרדיטים זמינה רק עבור סוג הרשמה "מנוי"' : ''}
              >
                {showCreditsSection ? 'השבת' : 'הפעל'}
              </button>
            </div>
            
                        {/* הצגת class_type אוטומטי לסוגי הרשמה שאינם מנוי */}
            {!creditsEnabled && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#4B2E83]">סוג קרדיטים אוטומטי</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {formData.registration_type === 'standard' && 'הרשמה רגילה → קבוצתי (ללא קרדיטים)'}
                      {formData.registration_type === 'appointment_only' && 'בתיאום → פרטי (ללא קרדיטים)'}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      formData.class_type === 'group' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {formData.class_type === 'group' ? 'קבוצתי' : 'פרטי'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {showCreditsSection ? (
              <div className="space-y-4">
                {/* פריסה קבועה: קרדיט קבוצתי | סוג קרדיטים | קרדיט פרטי */}
                <div className="grid grid-cols-3 gap-4 items-start">
                  {/* קרדיט קבוצתי - צד ימין */}
                  <div className={`transition-opacity duration-300 ${
                    (formData.class_type === 'group' || formData.class_type === 'both') 
                      ? 'opacity-100' 
                      : 'opacity-30 pointer-events-none'
                  }`}>
                    <div className="bg-white rounded-lg border border-blue-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#4B2E83]">קרדיט קבוצתי</h4>
                          <p className="text-xs text-gray-500">כמה יעלה השיעור</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, group_credits: Math.max(0, formData.group_credits - 1) })}
                          className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                          disabled={!(formData.class_type === 'group' || formData.class_type === 'both')}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <div className="flex-1 text-center">
                          <div className="text-xl font-bold text-[#4B2E83]">{formData.group_credits}</div>
                          <div className="text-xs text-gray-500">קרדיטים</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, group_credits: formData.group_credits + 1 })}
                          className="w-6 h-6 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors"
                          disabled={!(formData.class_type === 'group' || formData.class_type === 'both')}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* סוג קרדיטים - באמצע */}
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-48 text-center">
                      <label className="block text-sm font-medium text-[#4B2E83] mb-2 text-center">
                        סוג הקרדיטים *
                      </label>
                      <select
                        value={formData.class_type}
                        onChange={(e) => setFormData({ ...formData, class_type: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all text-center"
                      >
                        <option value="">בחרי סוג קרדיטים</option>
                        <option value="group">קבוצתי</option>
                        <option value="private">פרטי</option>
                        <option value="both">שניהם</option>
                      </select>
                    </div>
                    {/* הסבר על הבחירה */}
                    {formData.class_type && formData.class_type !== '' && (
                      <div className="mt-3 text-center text-xs text-gray-600 bg-gray-50 rounded-lg p-2 max-w-48">
                        {formData.class_type === 'group' && (
                          <p><span className="font-semibold text-blue-600">קבוצתי:</span> רק קרדיטים קבוצתיים</p>
                        )}
                        {formData.class_type === 'private' && (
                          <p><span className="font-semibold text-purple-600">פרטי:</span> רק קרדיטים פרטיים</p>
                        )}
                        {formData.class_type === 'both' && (
                          <p><span className="font-semibold text-green-600">שניהם:</span> התלמידה תבחר</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* קרדיט פרטי - צד שמאל */}
                  <div className={`transition-opacity duration-300 ${
                    (formData.class_type === 'private' || formData.class_type === 'both') 
                      ? 'opacity-100' 
                      : 'opacity-30 pointer-events-none'
                  }`}>
                    <div className="bg-white rounded-lg border border-purple-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#4B2E83]">קרדיט פרטי</h4>
                          <p className="text-xs text-gray-500">כמה יעלה השיעור</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, private_credits: Math.max(0, formData.private_credits - 1) })}
                          className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                          disabled={!(formData.class_type === 'private' || formData.class_type === 'both')}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <div className="flex-1 text-center">
                          <div className="text-xl font-bold text-[#4B2E83]">{formData.private_credits}</div>
                          <div className="text-xs text-gray-500">קרדיטים</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, private_credits: formData.private_credits + 1 })}
                          className="w-6 h-6 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors"
                          disabled={!(formData.class_type === 'private' || formData.class_type === 'both')}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm">מערכת הקרדיטים מושבתת</p>
                <p className="text-xs mt-1">
                  {isNewClass
                    ? 'הפעילי פיצ\'ר זה כדי להגדיר קרדיטים לשיעור החדש'
                    : 'לחצי על "הפעל" כדי להגדיר קרדיטים לשיעור זה'}
                </p>
                
              <p className="text-xs text-gray-500 mb-2 sm:mb-4">
                <span className="hidden sm:inline">מערכת הקרדיטים זמינה ורלוונטית רק כאשר "סוג הרשמה" מוגדר כ"מנוי".</span>
                <span className="sm:hidden">מערכת הקרדיטים תלויה ב"סוג הרשמה" (מנוי).</span>
              </p>
              </div>
            )}
          </div>

                    {/* מיקום ומדיה */}
          <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-4">
            <h3 className="text-lg font-bold text-[#4B2E83] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              מיקום ומדיה
            </h3>
            <div className="space-y-4">
              {/* ערכת צבע */}
                <div>
                <label className="block text-sm font-medium text-[#4B2E83] mb-3">
                  ערכת צבע
                    </label>
                <div className="space-y-3">
                  {/* שורה ראשונה - צבעים חמים */}
                  <div className="flex justify-center gap-3">
                    {[
                      { value: 'red', color: 'bg-gradient-to-br from-red-400 to-red-600', name: 'אדום' },
                      { value: 'orange', color: 'bg-gradient-to-br from-orange-400 to-orange-600', name: 'כתום' },
                      { value: 'amber', color: 'bg-gradient-to-br from-amber-400 to-amber-600', name: 'ענבר' },
                      { value: 'yellow', color: 'bg-gradient-to-br from-yellow-400 to-yellow-500', name: 'צהוב' }
                    ].map((colorOption) => (
                      <button
                        key={colorOption.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color_scheme: colorOption.value })}
                        className={`relative w-8 h-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${colorOption.color} ${
                          formData.color_scheme === colorOption.value
                            ? 'ring-4 ring-[#4B2E83]/30 scale-125 shadow-2xl'
                            : 'hover:scale-110'
                        }`}
                        title={colorOption.name}
                      >
                        {formData.color_scheme === colorOption.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* שורה שנייה - צבעים קרים */}
                  <div className="flex justify-center gap-3">
                    {[
                      { value: 'emerald', color: 'bg-gradient-to-br from-emerald-400 to-emerald-600', name: 'ירוק' },
                      { value: 'teal', color: 'bg-gradient-to-br from-teal-400 to-teal-600', name: 'טורקיז' },
                      { value: 'blue', color: 'bg-gradient-to-br from-blue-400 to-blue-600', name: 'כחול' },
                      { value: 'indigo', color: 'bg-gradient-to-br from-indigo-400 to-indigo-600', name: 'אינדיגו' }
                    ].map((colorOption) => (
                      <button
                        key={colorOption.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color_scheme: colorOption.value })}
                        className={`relative w-8 h-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${colorOption.color} ${
                          formData.color_scheme === colorOption.value
                            ? 'ring-4 ring-[#4B2E83]/30 scale-125 shadow-2xl'
                            : 'hover:scale-110'
                        }`}
                        title={colorOption.name}
                      >
                        {formData.color_scheme === colorOption.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* שורה שלישית - צבעים ורודים/ניטרליים */}
                  <div className="flex justify-center gap-3">
                    {[
                      { value: 'purple', color: 'bg-gradient-to-br from-purple-400 to-purple-600', name: 'סגול' },
                      { value: 'pink', color: 'bg-gradient-to-br from-pink-400 to-pink-600', name: 'ורוד' },
                      { value: 'rose', color: 'bg-gradient-to-br from-rose-400 to-rose-600', name: 'ורדרד' },
                      { value: 'slate', color: 'bg-gradient-to-br from-slate-400 to-slate-600', name: 'אפור' }
                    ].map((colorOption) => (
                      <button
                        key={colorOption.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color_scheme: colorOption.value })}
                        className={`relative w-8 h-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${colorOption.color} ${
                          formData.color_scheme === colorOption.value
                            ? 'ring-4 ring-[#4B2E83]/30 scale-125 shadow-2xl'
                            : 'hover:scale-110'
                        }`}
                        title={colorOption.name}
                      >
                        {formData.color_scheme === colorOption.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
              </div>

                  {/* שם הצבע הנבחר */}
                  <div className="text-center">
                    <span className="text-xs font-medium text-[#4B2E83] bg-[#4B2E83]/5 px-3 py-1 rounded-full">
                      {formData.color_scheme ? 
                        [
                          { value: 'red', name: 'אדום' }, { value: 'orange', name: 'כתום' }, { value: 'amber', name: 'ענבר' }, { value: 'yellow', name: 'צהוב' },
                          { value: 'emerald', name: 'ירוק' }, { value: 'teal', name: 'טורקיז' }, { value: 'blue', name: 'כחול' }, { value: 'indigo', name: 'אינדיגו' },
                          { value: 'purple', name: 'סגול' }, { value: 'pink', name: 'ורוד' }, { value: 'rose', name: 'ורדרד' }, { value: 'slate', name: 'אפור' }
                        ].find(c => c.value === formData.color_scheme)?.name || 'לא נבחר'
                        : 'בחרי צבע'
                      }
                    </span>
                  </div>
                </div>
              </div>


                
              {/* תמונות (קומפוננטת משנה) */}
              <div>
                <ClassImagesSection
                  ref={imagesRef}
                  imageUrl={formData.image_url}
                  onImageUrlChange={(url) => setFormData({ ...formData, image_url: url })}
                  isOpen={isOpen}
                  onShowMessage={showMessagePopup}
                />
              </div>
            </div>
          </div>



          {/* הגדרות נוספות */}
          <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-4">
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
                שיעור פעיל וזמין להרשמה
                  </label>
            </div>
          </div>

          {/* כפתורים */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-[#4B2E83] text-[#4B2E83] rounded-lg font-medium hover:bg-[#4B2E83] hover:text-white transition-all duration-300"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isLoading || (showCreditsSection && creditsEnabled && !formData.class_type)}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                (showCreditsSection && creditsEnabled && !formData.class_type)
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white hover:from-[#4B2E83] hover:to-[#EC4899] disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              title={
                (showCreditsSection && creditsEnabled && !formData.class_type)
                  ? 'יש לבחור סוג קרדיטים או להשבית את מערכת הקרדיטים'
                  : ''
              }
            >
              {isLoading ? 'שומר...' : (
                isNewClass ? 'יצירת שיעור' : 'שמירת שינויים'
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
      
      {/* Popup הודעות */}
      {showMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {/* Header */}
            <div className={`flex items-center gap-3 mb-4 ${
              messageType === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                messageType === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {messageType === 'success' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-bold">{messageTitle}</h3>
            </div>
            
            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-line">{messageContent}</p>
            </div>
            
            {/* Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowMessage(false)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  messageType === 'success'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                הבנתי
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 