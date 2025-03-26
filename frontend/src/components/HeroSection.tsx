// import InstagramIcon from "@mui/icons-material/Instagram";
import "bootstrap/dist/css/bootstrap.min.css";

function HeroSection() {
  return (
    <div className="h-screen relative">
      <div
        className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 text-center"
        style={{ zIndex: 10 }}>
        <button
          type="button"
          className="btn"
          // color="#cfe611"
          onClick={() => {
            console.log("Clicked");
            window.open("https://www.instagram.com/avigailladani/", "_blank");
          }}
          style={{
            backgroundColor: "#cfe611",
            fontFamily: "agrandir grand",
            fontSize: "25px",
          }}>
          לפרטים נוספים
        </button>

        {/* <InstagramIcon style={{ color: "#FF69B4", fontSize: 60 }} /> */}
      </div>
      <video
        className="video-bg w-full h-full object-cover"
        autoPlay
        loop
        muted>
        <source src="/HeroVideo.MP4" type="video/mp4" />
        הדפדפן לא תומך
      </video>
    </div>
  );
}

export default HeroSection;
