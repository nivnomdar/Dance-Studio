// import InstagramIcon from "@mui/icons-material/Instagram";

function HeroSection() {
  return (
    <div className="h-screen relative overflow-hidden">
      {/* Overlay gradient for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-[1]" />
      
      {/* Content container with improved mobile positioning */}
      <div
        className="absolute bottom-[15%] sm:bottom-[10%] left-1/2 transform -translate-x-1/2 text-center w-full px-4 z-[2]"
      >
        <button
          type="button"
          className="bg-[#cfe611] font-['agrandir_grand'] text-[clamp(18px,4vw,25px)] 
                     py-[clamp(8px,2vw,12px)] px-[clamp(16px,4vw,24px)] rounded-lg 
                     hover:bg-[#b9dd38] transition-all duration-300 ease-in-out 
                     w-full sm:w-auto transform hover:scale-105 active:scale-95
                     shadow-lg hover:shadow-xl text-black font-bold
                     drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
          onClick={() => {
            console.log("Clicked");
            window.open("https://www.instagram.com/avigailladani/", "_blank");
          }}
        >
          לפרטים נוספים
        </button>
      </div>

      {/* Video container with improved mobile optimization */}
      <div className="absolute inset-0 w-full h-full">
      <video
          className="video-bg w-full h-full object-cover object-center"
        autoPlay
        loop
        muted
          playsInline
          preload="auto"
        >
        <source src="/HeroVideo.MP4" type="video/mp4" />
        הדפדפן לא תומך
      </video>
      </div>
    </div>
  );
}

export default HeroSection;
