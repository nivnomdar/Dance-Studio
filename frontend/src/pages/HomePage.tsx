import HeroSection from '../components/home/HeroSection';
import PhotosCarousel from '../components/home/PhotosCarousel';
import JoinMe from '../components/home/JoinMe';

function HomePage() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      {/* <div className="max-w-6xl mx-auto bg-[#FDF9F6] w-full">
        <JoinMe />
      </div> */}
      <PhotosCarousel />
    </main>
  );
}

export default HomePage; 