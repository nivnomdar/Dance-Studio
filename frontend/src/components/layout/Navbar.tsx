import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#4B2E83]/90 backdrop-blur-sm shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-[#FDF9F6] font-agrandir-grand">
              Avigail Dance
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link to="/" className="text-[#FDF9F6] hover:text-[#E6C17C] px-3 py-2 text-sm font-medium transition-colors duration-200">
                בית
              </Link>
              <Link to="/about" className="text-[#FDF9F6] hover:text-[#E6C17C] px-3 py-2 text-sm font-medium transition-colors duration-200">
                אודות
              </Link>
              <Link to="/classes" className="text-[#FDF9F6] hover:text-[#E6C17C] px-3 py-2 text-sm font-medium transition-colors duration-200">
                שיעורים
              </Link>
              <Link to="/contact" className="text-[#FDF9F6] hover:text-[#E6C17C] px-3 py-2 text-sm font-medium transition-colors duration-200">
                צור קשר
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#FDF9F6] hover:text-[#E6C17C] hover:bg-[#4B2E83] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#E6C17C] transition-colors duration-200"
            >
              <span className="sr-only">פתח תפריט</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-[#4B2E83]`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#FDF9F6] hover:text-[#E6C17C] hover:bg-[#4B2E83]/80 transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            בית
          </Link>
          <Link
            to="/about"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#FDF9F6] hover:text-[#E6C17C] hover:bg-[#4B2E83]/80 transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            אודות
          </Link>
          <Link
            to="/classes"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#FDF9F6] hover:text-[#E6C17C] hover:bg-[#4B2E83]/80 transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            שיעורים
          </Link>
          <Link
            to="/contact"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#FDF9F6] hover:text-[#E6C17C] hover:bg-[#4B2E83]/80 transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            צור קשר
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 