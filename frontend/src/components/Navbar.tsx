import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-12 w-auto"
                src="/logo.png"
                alt="Avigail Dance Studio"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-[#2B2B2B] hover:text-[#EC4899] transition-colors duration-300"
            >
              דף הבית
            </Link>
            <Link
              to="/about"
              className="text-[#2B2B2B] hover:text-[#EC4899] transition-colors duration-300"
            >
              אודות
            </Link>
            <Link
              to="/gallery"
              className="text-[#2B2B2B] hover:text-[#EC4899] transition-colors duration-300"
            >
              גלריה
            </Link>
            <Link
              to="/contact"
              className="text-[#2B2B2B] hover:text-[#EC4899] transition-colors duration-300"
            >
              צור קשר
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#2B2B2B] hover:text-[#EC4899] focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#2B2B2B] hover:text-[#EC4899] hover:bg-[#FDF9F6] transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              דף הבית
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#2B2B2B] hover:text-[#EC4899] hover:bg-[#FDF9F6] transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              אודות
            </Link>
            <Link
              to="/gallery"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#2B2B2B] hover:text-[#EC4899] hover:bg-[#FDF9F6] transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              גלריה
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#2B2B2B] hover:text-[#EC4899] hover:bg-[#FDF9F6] transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              צור קשר
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 