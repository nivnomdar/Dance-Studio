import React, { createContext, useContext, useState, ReactNode } from 'react';

// טיפוסים
interface PopupContent {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface PopupContextType {
  showPopup: (content: PopupContent) => void;
  hidePopup: () => void;
  popup: PopupContent | null;
  isVisible: boolean;
}

// יצירת הקונטקסט
const PopupContext = createContext<PopupContextType | undefined>(undefined);

// Provider Component
export const PopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [popup, setPopup] = useState<PopupContent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showPopup = (content: PopupContent) => {
    setPopup(content);
    setIsVisible(true);

    // אם יש משך זמן מוגדר, נסתיר את הפופופ אחריו
    if (content.duration) {
      setTimeout(() => {
        hidePopup();
      }, content.duration);
    }
  };

  const hidePopup = () => {
    setIsVisible(false);
    // נחכה לסיום האנימציה לפני שננקה את התוכן
    setTimeout(() => {
      setPopup(null);
    }, 300);
  };

  return (
    <PopupContext.Provider value={{ showPopup, hidePopup, popup, isVisible }}>
      {children}
      {/* Popup Component */}
      {isVisible && popup && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className={`p-4 rounded-lg shadow-xl min-w-[300px] max-w-[400px] backdrop-blur-sm border-2 border-black ${
            popup.type === 'success' ? 'bg-[#EC4899]/90 text-white' :
            popup.type === 'error' ? 'bg-red-500/90 text-white' :
            popup.type === 'warning' ? 'bg-yellow-500/90 text-white' :
            'bg-blue-500/90 text-white'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {popup.title && (
                  <h3 className="text-lg font-bold mb-2 text-right">{popup.title}</h3>
                )}
                <p className="text-right">{popup.message}</p>
              </div>
              <button
                onClick={hidePopup}
                className="mr-2 text-white hover:text-gray-200 transition-colors duration-200"
                aria-label="סגור"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
};

// Custom Hook לשימוש בקונטקסט
export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}; 