import { Link } from 'react-router-dom';

function SecondaryNavbar() {
  return (
    <nav className="hidden md:block fixed top-12 left-0 right-0 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] shadow-lg z-40" role="navigation" aria-label="ניווט משני">
      <div className="mt-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-10">
          <div className="flex items-center space-x-8" role="menubar">
            <Link
              to="/"
              className="text-[#FDF9F6] hover:text-black px-3 py-2 text-sm font-medium transition-colors duration-200"
              role="menuitem"
              aria-label="עבור לדף הבית"
            >
              דף הבית
            </Link>
            <Link
              to="/classes"
              className="text-[#FDF9F6] hover:text-black px-3 py-2 text-sm font-medium transition-colors duration-200"
              role="menuitem"
              aria-label="עבור לעמוד השיעורים"
            >
              שיעורים
            </Link>
            <Link
              to="/shop"
              className="text-[#FDF9F6] hover:text-black px-3 py-2 text-sm font-medium transition-colors duration-200"
              role="menuitem"
              aria-label="עבור לחנות"
            >
              חנות
            </Link>
            <Link
              to="/contact"
              className="text-[#FDF9F6] hover:text-black px-3 py-2 text-sm font-medium transition-colors duration-200"
              role="menuitem"
              aria-label="עבור לעמוד יצירת קשר"
            >
              צרי קשר
            </Link>
           
    
          </div>
        </div>
      </div>
    </nav>
  );
}

export default SecondaryNavbar; 