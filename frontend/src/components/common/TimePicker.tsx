import React from 'react';

interface TimePickerProps {
  selectedTime: string;
  availableTimes: string[];
  onTimeSelect: (time: string) => void;
  onClose: () => void;
  isOpen: boolean;
  isCustom?: boolean;
}

export default function TimePicker({
  selectedTime,
  availableTimes,
  onTimeSelect,
  onClose,
  isOpen,
  isCustom = false
}: TimePickerProps) {
  if (!isOpen) return null;

  const handleCurrentTime = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    onTimeSelect(currentTime);
    onClose();
  };

  const commonTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20 p-3 min-w-[300px] max-w-[350px]">
      {isCustom ? (
        <>
          {/* Current time button */}
          <div className="mb-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <button
              type="button"
              onClick={handleCurrentTime}
              className="w-full text-xs font-medium text-green-700 hover:text-green-800 hover:bg-green-100 px-2 py-1 rounded transition-colors"
            >
              ⏰ השעה הנוכחית: {new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
            </button>
          </div>
          
          {/* Quick time presets */}
          <div className="mb-3 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-1">שעות נפוצות:</p>
            <div className="grid grid-cols-3 gap-1">
              {commonTimes.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => {
                    onTimeSelect(time);
                    onClose();
                  }}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium hover:bg-gray-200 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
          
          {/* Manual time input */}
          <div className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-700 mb-1">הזנת שעה ידנית:</p>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => onTimeSelect(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-300 focus:border-blue-400 outline-none"
            />
          </div>
        </>
      ) : (
        <>
          {/* Available times info at top */}
          {availableTimes.length > 0 ? (
            <div className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-xs font-medium text-blue-700 mb-1">שעות זמינות:</p>
              <div className="flex flex-wrap gap-1">
                {availableTimes.slice(0, 6).map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      onTimeSelect(time);
                      onClose();
                    }}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium hover:bg-blue-200 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    {time}
                  </button>
                ))}
                {availableTimes.length > 6 && (
                  <span className="text-xs text-blue-600 font-medium">+{availableTimes.length - 6} נוספות</span>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <p className="text-xs font-medium text-yellow-700 mb-1">אין שעות זמינות</p>
              <p className="text-xs text-yellow-600">בחרי קודם תאריך זמין</p>
            </div>
          )}
        </>
      )}
      
      {/* Close button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 hover:bg-red-100 rounded transition-all duration-200 hover:shadow-sm text-red-600 hover:text-red-700"
          title="סגור בחירת שעה"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
} 