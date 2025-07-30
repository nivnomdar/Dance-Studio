import React from 'react';

interface RefreshButtonProps {
  onClick: () => void;
  isFetching: boolean;
  className?: string;
}

export default function RefreshButton({ onClick, isFetching, className = '' }: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isFetching}
      className={`px-3 sm:px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isFetching ? 'מעדכן...' : 'רענן נתונים'}
    </button>
  );
} 