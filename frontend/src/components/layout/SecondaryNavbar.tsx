import { Link } from 'react-router-dom';

function SecondaryNavbar() {
  // console.log('SecondaryNavbar render at:', new Date().toISOString()); // Debug log
  return (
    <div className="hidden md:block fixed top-12 left-0 right-0 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-10">
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-[#FDF9F6] hover:text-black px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              דף הבית
            </Link>
            <Link
              to="/classes"
              className="text-[#FDF9F6] hover:text-black px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              שיעורים
            </Link>
            <Link
              to="/shop"
              className="text-[#FDF9F6] hover:text-black px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              חנות
            </Link>
            <Link
              to="/contact"
              className="text-[#FDF9F6] hover:text-black px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              צור קשר
            </Link>
    
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecondaryNavbar; 