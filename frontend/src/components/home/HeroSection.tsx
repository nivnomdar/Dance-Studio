import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HOMEPAGE_ASSETS } from '../../config/homepageAssets';
import { assetUrl } from '../../lib/assets';

function HeroSection() {
  const [desktopImageLoaded, setDesktopImageLoaded] = useState(false);
  const [mobileImageLoaded, setMobileImageLoaded] = useState(false);

  const desktopLqipUrl = assetUrl(HOMEPAGE_ASSETS.hero.desktop, { width: 40, quality: 10, format: 'jpeg' });
  const mobileLqipUrl = assetUrl(HOMEPAGE_ASSETS.hero.mobile, { width: 20, quality: 10, format: 'jpeg' });

  // Preload desktop image
  useEffect(() => {
    const img = new Image();
    img.src = assetUrl(HOMEPAGE_ASSETS.hero.desktop);
    img.onload = () => setDesktopImageLoaded(true);
    img.onerror = () => {
      console.error('Failed to load desktop hero image');
      setDesktopImageLoaded(true); // Still show LQIP if full image fails
    };
  }, []);

  // Preload mobile image
  useEffect(() => {
    const img = new Image();
    img.src = assetUrl(HOMEPAGE_ASSETS.hero.mobile);
    img.onload = () => setMobileImageLoaded(true);
    img.onerror = () => {
      console.error('Failed to load mobile hero image');
      setMobileImageLoaded(true); // Still show LQIP if full image fails
    };
  }, []);

  return (
    <section className="relative w-full h-auto md:h-screen overflow-visible md:overflow-hidden bg-black">
      {/* Large screens background image */}
      <div className="absolute inset-0 w-full h-full hidden md:block">
        <img
          src={desktopImageLoaded ? assetUrl(HOMEPAGE_ASSETS.hero.desktop) : desktopLqipUrl}
          alt="רקע סטודיו לדנסאס"
          className="w-full h-full object-cover object-bottom transition-opacity duration-500"
          style={{ opacity: desktopImageLoaded ? 1 : 0 }}
          loading="eager"
        />
        {!desktopImageLoaded && (
          <img
            src={desktopLqipUrl}
            alt="רקע סטודיו לדנסאס (טוען)"
            className="absolute inset-0 w-full h-full object-cover object-bottom blur-lg scale-110"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Small screens background image */}
      <div className="block md:hidden w-full">
        <img
          src={mobileImageLoaded ? assetUrl(HOMEPAGE_ASSETS.hero.mobile) : mobileLqipUrl}
          alt="רקע סטודיו לדנסאס"
          className="w-full h-auto object-contain transition-opacity duration-500"
          style={{
            objectFit: 'contain',
            objectPosition: 'top',
            opacity: mobileImageLoaded ? 1 : 0
          }}
          loading="lazy" // Changed from eager to lazy
        />
        {!mobileImageLoaded && (
          <img
            src={mobileLqipUrl}
            alt="רקע סטודיו לדנסאס (טוען)"
            className="absolute inset-0 w-full h-full object-contain blur-lg scale-110"
            style={{ objectPosition: 'top' }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="relative inset-0" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 h-full text-white px-8 sm:px-6 lg:px-8">
        {/* Main Heading - מיקום קבוע למעלה */}
       
        
        {/* Subtitle - מיקום קבוע באמצע */}
        <div className="absolute bottom-120 left-1/2 transform -translate-x-1/2 text-center md:absolute md:top-110 lg:top-100 xl:top-95 2xl:top-85 md:left-1/2 md:transform-none">
    
        </div>
        
        {/* Buttons - מיקום קבוע למטה */}
        <div className="absolute bottom-60 left-1/2 transform -translate-x-1/2 flex flex-row items-center justify-center gap-3 sm:gap-4 md:absolute md:bottom-50 md:top-auto lg:bottom-50 xl:bottom-65 2xl:bottom-70 md:left-1/2 md:transform-none">
          <Link
            to="/classes"
            className="group w-auto bg-gradient-to-r from-[#4B2E83] to-[#EC4899] hover:from-[#4B2E83]/90 hover:to-[#EC4899]/90 text-white px-6 sm:px-8 py-3 rounded-full text-base sm:text-lg font-semibold transition-all duration-200 flex items-center justify-center hover:shadow-lg hover:shadow-pink-500/20 transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 whitespace-nowrap"
            aria-label="לקביעת שיעור"
            title="לקביעת שיעור"
          >
            לקביעת שיעור
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              לקביעת שיעור
            </div>
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
    </section>
  );
}

export default HeroSection; 