import React from 'react';
import { ADMIN_STYLES } from '../../utils/adminStyles';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showItemsPerPage?: boolean;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showItemsPerPage = false,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  className = ""
}: PaginationProps) {
  
  // Calculate display range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 3) {
        // Near start: show 1, 2, 3, 4, 5, ..., last
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push('...');
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        // Near end: show 1, ..., last-4, last-3, last-2, last-1, last
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle: show 1, ..., current-1, current, current+1, ..., last
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(Number(e.target.value));
    }
  };

  // Don't render if no pages
  if (totalPages <= 1 && !showItemsPerPage) {
    return null;
  }

  return (
    <div className={`${ADMIN_STYLES.container} ${className}`}>
      {/* Items info */}
      <div className={ADMIN_STYLES.info}>
        {totalItems > 0 ? (
          <>
            מציג {startItem}-{endItem} מתוך {totalItems.toLocaleString()} פריטים
          </>
        ) : (
          "אין פריטים להצגה"
        )}
      </div>

      {/* Controls */}
      <div className={ADMIN_STYLES.controls}>
        {/* Items per page selector */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">פריטים בעמוד:</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className={ADMIN_STYLES.select}
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <>
            {/* Previous button */}
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`${ADMIN_STYLES.button} ${ADMIN_STYLES.buttonSecondary}`}
              title="עמוד קודם"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page numbers */}
            <div className={ADMIN_STYLES.pageNumbers}>
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => handlePageClick(page)}
                  disabled={page === '...'}
                  className={`${ADMIN_STYLES.pageNumber} ${
                    page === currentPage 
                      ? ADMIN_STYLES.pageNumberActive 
                      : page === '...'
                        ? 'cursor-default'
                        : ADMIN_STYLES.pageNumberInactive
                  }`}
                  title={typeof page === 'number' ? `עמוד ${page}` : undefined}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`${ADMIN_STYLES.button} ${ADMIN_STYLES.buttonSecondary}`}
              title="עמוד הבא"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
} 