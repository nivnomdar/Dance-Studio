import React, { useState, useEffect } from 'react';

interface RegistrationEditModalProps {
  registrationData: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRegistration: any) => void;
  isLoading: boolean;
}

export default function RegistrationEditModal({ registrationData, isOpen, onClose, onSave, isLoading }: RegistrationEditModalProps) {
  const [formData, setFormData] = useState({
    status: registrationData.status || 'active'
  });

  useEffect(() => {
    setFormData({
      status: registrationData.status || 'active'
    });
  }, [registrationData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...registrationData, ...formData });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#4B2E83]">עריכת הרשמה</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">
              פרטי המשתמש
            </label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-[#4B2E83]/70">
                {registrationData.user ? 
                  `${registrationData.user.first_name || ''} ${registrationData.user.last_name || ''}`.trim() || registrationData.user.email :
                  `${registrationData.first_name || ''} ${registrationData.last_name || ''}`.trim() || registrationData.email || 'לא ידוע'
                }
              </p>
              <p className="text-sm text-[#4B2E83]/70 mt-1">{registrationData.email}</p>
              <p className="text-sm text-[#4B2E83]/70 mt-1">{registrationData.phone}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">
              פרטי השיעור
            </label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-[#4B2E83]/70">
                {registrationData.class?.name || registrationData.class_name || 'שיעור לא ידוע'}
              </p>
              <p className="text-sm text-[#4B2E83]/70 mt-1">
                {new Date(registrationData.selected_date).toLocaleDateString('he-IL')}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">
              סטטוס הרשמה *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            >
              <option value="active">פעיל</option>
              <option value="pending">ממתין</option>
              <option value="cancelled">בוטל</option>
            </select>
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