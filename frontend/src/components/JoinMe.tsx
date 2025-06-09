function JoinMe() {
  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Video container with improved mobile optimization */}
      <div className="absolute inset-0 w-full h-full">
        <video 
          className="video-bg w-full h-full object-contain sm:object-cover" 
          autoPlay 
          loop 
          muted
          playsInline
          preload="auto"
        >
          <source src="/ClassesVideo.mp4" type="video/mp4"></source>
          הדפדפן לא תומך
        </video>
      </div>

      {/* Content container with improved mobile positioning */}
      <div className="absolute bottom-[12.5%] left-7/13 transform -translate-x-1/2 text-center w-full px-4 z-20">
        <h2 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-center
                      drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] max-w-[90%] sm:max-w-[80%] md:max-w-[70%] mx-auto">
          הצטרפי אלי
        </h2>
      </div>
    </div>
  );
}

export default JoinMe;
