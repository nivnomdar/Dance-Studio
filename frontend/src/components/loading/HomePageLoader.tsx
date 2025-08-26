import { useState, useEffect } from 'react';

// Professional Dance Studio Loading Animation
const HomePageLoader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4; // Faster progress increment
      });
    }, 20); // Faster update interval (20ms instead of 40ms)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 flex items-center justify-center relative overflow-hidden" role="status" aria-live="polite" aria-label="טוען דף הבית">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Floating Dance Elements */}
        <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-pink-200 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-pink-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-10 h-10 bg-pink-200 rounded-full animate-bounce opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-pink-300 rounded-full animate-bounce opacity-50" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Subtle Wave Animation */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-pink-100/30 to-transparent animate-pulse"></div>
      </div>

      {/* Main Loading Content */}
      <div className="text-center relative z-10">
        {/* Logo Animation */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 animate-pulse" aria-hidden="true">
            <img 
              src="/images/LOGOladance.png" 
              alt="סטודיו אביגיל" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-[#EC4899] font-agrandir-grand animate-pulse">
            סטודיו אביגיל
          </h1>
          <div className="w-24 h-1 bg-[#EC4899] mx-auto mt-4 rounded-full animate-pulse" aria-hidden="true"></div>
        </div>

        {/* Dancing Dots Animation */}
        <div className="flex justify-center items-center space-x-2 mb-8" aria-hidden="true">
          <div className="w-4 h-4 bg-[#EC4899] rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-[#EC4899] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-4 h-4 bg-[#EC4899] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-lg text-gray-600 font-agrandir-regular animate-pulse">
            טוען חוויה מקצועית... <span aria-live="polite">{progress}%</span>
          </p>
          <div className="w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="התקדמות טעינה">
            <div 
              className="h-full bg-[#EC4899] rounded-full transition-all duration-50 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center space-x-4 opacity-60" aria-hidden="true">
          <div className="w-2 h-2 bg-[#EC4899] rounded-full animate-ping"></div>
          <div className="w-2 h-2 bg-[#EC4899] rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-2 h-2 bg-[#EC4899] rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default HomePageLoader; 