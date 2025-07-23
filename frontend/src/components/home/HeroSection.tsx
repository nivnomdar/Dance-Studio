import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const video = videoRef.current;
    if (!video) return;

    // Mobile-specific optimizations
    if (isMobile) {
      video.preload = 'metadata';
      video.playsInline = true;
      video.muted = true;
      video.loop = true;
      video.defaultPlaybackRate = 1.0;
      video.playbackRate = 1.0;
      
      // Mobile-specific attributes
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('x5-playsinline', 'true');
      video.setAttribute('x5-video-player-type', 'h5');
      video.setAttribute('x5-video-player-fullscreen', 'false');
      video.setAttribute('x5-video-orientation', 'portraint');
    } else {
      video.preload = 'auto';
      video.playsInline = true;
      video.muted = true;
      video.loop = true;
    }

    const startVideo = async () => {
      try {
        if (video.paused) {
          await video.play();
          console.log('Video started successfully');
        }
      } catch (error) {
        console.log('Video play failed:', error);
        // Fallback for mobile browsers
        if (isMobile) {
          setTimeout(() => {
            video.play().catch(() => {
              console.log('Mobile fallback play failed');
            });
          }, 100);
        }
      }
    };

    const handleCanPlay = () => {
      startVideo();
    };

    const handleCanPlayThrough = () => {
      // Ensure video is playing when fully loaded
      if (video.paused) {
        startVideo();
      }
    };

    const handleLoadedData = () => {
      // Start playing as soon as data is loaded
      if (video.paused) {
        startVideo();
      }
    };

    const handleTimeUpdate = () => {
      // Ensure video keeps playing on mobile
      if (isMobile && video.paused && video.readyState >= 2) {
        startVideo();
      }
    };

    const handleStalled = () => {
      // Handle buffering issues on mobile
      if (isMobile) {
        console.log('Video stalled, attempting to resume');
        setTimeout(() => {
          if (video.paused) {
            startVideo();
          }
        }, 500);
      }
    };

    const handleWaiting = () => {
      // Handle buffering on mobile
      if (isMobile) {
        console.log('Video waiting for data');
      }
    };

    const handleEnded = () => {
      // Ensure smooth restart
      if (video.loop) {
        video.currentTime = 0;
        startVideo();
      }
    };

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isMobile) {
          video.pause();
        }
      } else {
        if (video.paused) {
          startVideo();
        }
      }
    };

    // Add event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Mobile-specific: Handle page focus/blur
    const handlePageFocus = () => {
      if (isMobile && video.paused) {
        setTimeout(() => {
          startVideo();
        }, 100);
      }
    };

    const handlePageBlur = () => {
      if (isMobile) {
        video.pause();
      }
    };

    window.addEventListener('focus', handlePageFocus);
    window.addEventListener('blur', handlePageBlur);

    // Cleanup
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handlePageFocus);
      window.removeEventListener('blur', handlePageBlur);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload={isMobile ? "metadata" : "auto"}
          webkit-playsinline="true"
          x5-playsinline="true"
          x5-video-player-type="h5"
          x5-video-player-fullscreen="false"
          x5-video-orientation="portraint"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        >
          <source src="/videos/Heronew.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        {/* Hero Image + Buttons */}
        <div className="flex flex-col items-center">
          <img
            src="/images/ontopHero.png"
            alt="Studio Dance - סטודיו להעצמה נשית וחיבור לגוף"
            className="max-w-sm md:max-w-md lg:max-w-lg h-auto"
          />
          <div className="flex flex-row items-center gap-2 -mt-6">
            <Link
              to="/classes"
              className="bg-[#EC4899] hover:bg-[#EC4899]/80 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-200 flex items-center"
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
              <svg className="w-6 h-6 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
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