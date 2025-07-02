import React from 'react';

function HeroSection() {
  return (
    <section className="relative w-full h-[100vh] overflow-hidden pt-16">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
        >
          <source src="/videos/Heronew.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-start h-full text-white pt-20 md:pt-32">
        {/* Hero Image */}
        <div className="mb-8">
          <img
            src="/images/ontopHero.png"
            alt="Studio Dance - סטודיו להעצמה נשית וחיבור לגוף"
            className="max-w-md md:max-w-lg lg:max-w-xl h-auto"
          />
        </div>
        <a
          href="https://www.instagram.com/avigailladani?igsh=MXc4ZXU5cGdsM3U2cw=="
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#EC4899] hover:bg-[#EC4899]/80 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-200"
        >
         לקביעת שיעור
        </a>
      </div>
    </section>
  );
}

export default HeroSection; 