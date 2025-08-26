import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "טוען...", 
  size = 'md',
  className = ""
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={`text-center ${className}`} role="status" aria-live="polite" aria-label={message}>
      <div 
        className={`animate-spin rounded-full border-b-2 border-[#EC4899] mx-auto mb-4 ${sizeClasses[size]}`}
        aria-hidden="true"
      ></div>
      <p className="text-lg text-[#4B2E83]/70">{message}</p>
    </div>
  );
};

export default LoadingSpinner; 