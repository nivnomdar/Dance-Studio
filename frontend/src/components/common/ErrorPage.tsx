import React from 'react';

interface ErrorPageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ 
  title = "שגיאה",
  message,
  onRetry,
  retryText = "נסה שוב",
  className = ""
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#FFF5F9] via-[#FDF9F6] to-[#FFF5F9] pt-24 pb-12 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center" aria-hidden="true">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#4B2E83] mb-2">{title}</h1>
          <p className="text-[#4B2E83]/70 mb-6" role="alert" aria-live="polite">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
              aria-label={`${retryText} - ${title}`}
            >
              {retryText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 