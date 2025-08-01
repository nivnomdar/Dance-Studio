import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Basic video setup - let HTML handle the loop
    video.preload = 'auto';
    video.playsInline = true;
    video.muted = true;
    video.loop = true;

    const startVideo = async () => {
      try {
        if (video.paused) {
          await video.play();
        }
      } catch (error) {
        // Video play failed silently
      }
    };

    const handleCanPlay = () => {
      startVideo();
    };

    // Handle visibility change only
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else {
        if (video.paused) {
          startVideo();
        }
      }
    };

    // Add only essential event listeners
    video.addEventListener('canplay', handleCanPlay);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Video Background - Hidden on small screens, visible on medium and up */}
      <div className="absolute inset-0 w-full h-full hidden md:block">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        >
          <source src="/videos/Heronew.mp4" type="video/mp4" />
        </video>
      </div>

      {/* GIF Background - Visible on small screens, hidden on medium and up */}
      <div className="absolute inset-0 w-full h-full md:hidden">
        <img
          src="/videos/Heronew.gif"
          alt="Studio Dance Background"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          loading="eager"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 sm:px-6 lg:px-8">
        {/* Hero Image + Buttons */}
        <div className="flex flex-col items-center">
          <img
            src="/images/ontopHero.png"
            alt="Studio Dance - סטודיו להעצמה נשית וחיבור לגוף"
            className="w-64 sm:w-72 md:w-80 lg:w-96 h-auto max-w-full"
            loading="eager"
          />
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 -mt-4 sm:-mt-6 w-full sm:w-auto">
            <Link
              to="/classes"
              className="w-full sm:w-auto bg-[#EC4899] hover:bg-[#EC4899]/80 text-white px-6 sm:px-8 py-3 rounded-full text-base sm:text-lg font-semibold transition-colors duration-200 flex items-center justify-center"
            >
              לקביעת שיעור
            </Link>
            <a
              href="https://www.instagram.com/avigailladani?igsh=MXc4ZXU5cGdsM3U2cw=="
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-3 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25"
              aria-label="עקבי אחרי באינסטגרם"
              title="אינסטגרם"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                אינסטגרם - Instagram
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection; 