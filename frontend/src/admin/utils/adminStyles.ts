// Common styles for admin components
export const ADMIN_STYLES = {
  // Input styles
  input: "w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none",
  
  // Button styles
  button: "px-4 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300",
  buttonSecondary: "px-4 py-2 bg-gray-100 text-[#4B2E83] rounded-lg font-medium hover:bg-gray-200 transition-all duration-300",
  
  // Action button styles
  actionButton: "px-2 py-1 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-xs",
  actionButtonAlt: "px-2 py-1 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-xs",
  
  // Tab button styles
  tabButton: "px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm",
  tabButtonActive: "bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white",
  tabButtonInactive: "bg-gray-100 text-[#4B2E83] hover:bg-gray-200",
  
  // Pagination styles
  container: "flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-t border-gray-200",
  info: "text-sm text-gray-700",
  controls: "flex items-center gap-2",
  select: "px-2 py-1 border border-gray-300 rounded text-sm",
  pageNumbers: "flex items-center gap-1",
  pageNumber: "px-3 py-1 rounded text-sm font-medium transition-colors",
  pageNumberActive: "bg-[#EC4899] text-white",
  pageNumberInactive: "bg-gray-100 text-gray-700 hover:bg-gray-200"
};

// Table column definitions
export const TABLE_COLUMNS = {
  name: { label: "שם מלא", width: "w-24 sm:w-28" },
  email: { label: "אימייל", width: "w-28 sm:w-32" },
  phone: { label: "טלפון", width: "w-20 sm:w-24" },
  class: { label: "שיעור", width: "w-20 sm:w-24" },
  session: { label: "קבוצה", width: "w-20 sm:w-24" },
  date: { label: "תאריך", width: "w-20 sm:w-24" },
  time: { label: "שעה", width: "w-16 sm:w-20" },
  status: { label: "סטטוס", width: "w-16 sm:w-20" }
};

// Status badge styles
export const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case 'active':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        hover: 'hover:bg-green-200'
      };
    case 'cancelled':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        hover: 'hover:bg-red-100'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        hover: 'hover:bg-gray-200'
      };
  }
}; 