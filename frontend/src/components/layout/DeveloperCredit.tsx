import React from 'react';

const DeveloperCredit: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="text-gray-500 text-xs flex items-center">
            {/* Empty space for balance */}
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-gray-500 text-xs">פותח על ידי:</span>
            <a 
              href="https://portfolio-teal-pi-42.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 transition-colors duration-200 text-xs font-medium flex items-center"
            >
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
              Nif-Web
            </a>
            <span className="text-gray-500 text-xs">•</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperCredit; 