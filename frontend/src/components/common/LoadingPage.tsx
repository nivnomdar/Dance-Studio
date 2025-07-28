import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingPageProps {
  message?: string;
  className?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ 
  message = "טוען...",
  className = ""
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#FFF5F9] via-[#FDF9F6] to-[#FFF5F9] pt-24 pb-12 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSpinner message={message} size="lg" />
      </div>
    </div>
  );
};

export default LoadingPage; 