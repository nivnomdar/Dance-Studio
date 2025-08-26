import React from 'react';
import Modal from './Modal';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
  buttonText?: string;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  buttonText = "אישור"
}) => {
  const iconClasses = {
    success: "bg-green-100 text-green-600",
    error: "bg-red-100 text-red-600"
  };

  const buttonClasses = {
    success: "bg-gradient-to-r from-[#EC4899] to-[#4B2E83] hover:from-[#4B2E83] hover:to-[#EC4899]",
    error: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
  };

  const icon = type === 'success' ? (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      showCloseButton={false}
      ariaLabelledbyId="status-modal-title"
      ariaDescribedbyId="status-modal-message"
    >
      <div className="text-center">
        <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${iconClasses[type]}`} aria-hidden="true">
          {icon}
        </div>
        <h2 id="status-modal-title" className="text-xl font-bold text-[#4B2E83] mb-2">{title}</h2>
        <p id="status-modal-message" className="text-[#4B2E83]/70 mb-6" role="alert" aria-live="polite">{message}</p>
        <button
          onClick={onClose}
          className={`px-6 py-3 text-white rounded-xl font-medium transition-all duration-300 ${buttonClasses[type]}`}
          aria-label={`${buttonText} - ${title}`}
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
};

 