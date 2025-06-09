import React from 'react';

function JoinMe() {
  return (
    <section className="relative w-full">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      >
        <source src="/videos/ClassesVideo.mp4" type="video/mp4" />
      </video>
      <div className="absolute bottom-7 left-6/11 transform -translate-x-1/2">
        <a
          href="/contact"
          className="text-[#4B2E83] text-2xl font-bold hover:text-[#6B4B9E] transition-colors duration-300"
        >
          צרי קשר
        </a>
      </div>
    </section>
  );
}

export default JoinMe; 