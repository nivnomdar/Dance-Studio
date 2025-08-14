import { useEffect } from 'react';

interface ContactSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSuccessModal = ({ isOpen, onClose }: ContactSuccessModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full mx-auto overflow-hidden border border-white/20" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-4 sm:p-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10 mb-4 sm:mb-6">
            <img src="/images/LOGOladance.png" alt="Ladance Avigail" className="h-17 sm:h-22 w-auto mx-auto drop-shadow-lg" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 font-agrandir-grand">תודה!</h2>
            <p className="text-sm sm:text-base text-white/90">ההודעה נשלחה. אחזור אליך בהקדם.</p>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center bg-green-100 text-green-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-center text-[#4B2E83]/80">תודה שפנית. ההודעה התקבלה במערכת.</p>
        </div>

        <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose} className="w-full py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium">
            חזרה
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactSuccessModal;


