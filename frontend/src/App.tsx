import "./App.css";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import JoinMe from "./components/JoinMe";
import Contact from "./components/Contact";

function App() {
  // const handleInstagram = () => {
  //   console.log("Clicked");
  // };

  return (
    <div className="bg-black  text-white">
      <HeroSection />
      <AboutSection />
      <JoinMe />
      <Contact />
    </div>
  );
}

export default App;
