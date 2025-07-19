import React from 'react';

interface ClassDetailsModalProps {
  classData: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClassDetailsModal({ classData, isOpen, onClose }: ClassDetailsModalProps) {
  if (!isOpen || !classData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#EC4899]/10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#4B2E83]">פרטי שיעור</h2>
            <button
              onClick={onClose}
              className="text-[#4B2E83] hover:text-[#EC4899] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Class Image */}
          {classData.image_url && (
            <div className="text-center">
              <img
                src={classData.image_url}
                alt={classData.name}
                className="w-full max-w-md h-48 object-cover rounded-lg mx-auto"
              />
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">מידע בסיסי</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83]/70">שם השיעור</label>
                  <p className="text-[#4B2E83] font-medium">{classData.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83]/70">קטגוריה</label>
                  <p className="text-[#4B2E83]">{classData.category || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83]/70">רמה</label>
                  <p className="text-[#4B2E83]">{classData.level || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83]/70">קבוצת גיל</label>
                  <p className="text-[#4B2E83]">{classData.age_group || '-'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">פרטי מחיר וזמן</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83]/70">מחיר</label>
                  <p className="text-[#EC4899] font-bold text-lg">₪{classData.price}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83]/70">משך השיעור</label>
                  <p className="text-[#4B2E83]">{classData.duration} דקות</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83]/70">מיקום</label>
                  <p className="text-[#4B2E83]">{classData.location || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83]/70">סטטוס</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    classData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {classData.is_active ? 'פעיל' : 'לא פעיל'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">תיאורים</h3>
            <div className="space-y-4">
              {classData.description && (
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83]/70 mb-2">תיאור קצר</label>
                  <p className="text-[#4B2E83] bg-gray-50 p-3 rounded-lg">{classData.description}</p>
                </div>
              )}
              {classData.long_description && (
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83]/70 mb-2">תיאור מפורט</label>
                  <p className="text-[#4B2E83] bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{classData.long_description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {(classData.included || classData.video_url) && (
            <div>
              <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">מידע נוסף</h3>
              <div className="space-y-3">
                {classData.included && (
                  <div>
                    <label className="block text-sm font-medium text-[#4B2E83]/70">מה כלול</label>
                    <p className="text-[#4B2E83] bg-gray-50 p-3 rounded-lg">{classData.included}</p>
                  </div>
                )}
                {classData.video_url && (
                  <div>
                    <label className="block text-sm font-medium text-[#4B2E83]/70">סרטון</label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <a
                        href={classData.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#EC4899] hover:text-[#4B2E83] transition-colors"
                      >
                        צפה בסרטון
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#EC4899]/10">
            <div>
              <label className="block text-sm font-medium text-[#4B2E83]/70">נוצר ב</label>
              <p className="text-[#4B2E83] text-sm">
                {new Date(classData.created_at).toLocaleDateString('he-IL')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4B2E83]/70">עודכן ב</label>
              <p className="text-[#4B2E83] text-sm">
                {new Date(classData.updated_at).toLocaleDateString('he-IL')}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#EC4899]/10">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
} 