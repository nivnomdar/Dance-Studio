import "./App.css";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";

function App() {
  // const handleInstagram = () => {
  //   console.log("Clicked");
  // };

  return (
    <div className="bg-black  text-white">
      <HeroSection />
      <AboutSection />
    </div>
  );
}

export default App;
