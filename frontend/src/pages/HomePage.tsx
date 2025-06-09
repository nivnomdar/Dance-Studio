import HeroSection from '../components/home/HeroSection';
import PhotosCarousel from '../components/home/PhotosCarousel';
import JoinMe from '../components/home/JoinMe';

function HomePage() {
  return (
    <main className="flex flex-col bg-black">
      <HeroSection />
      <PhotosCarousel />
      <JoinMe />
    </main>
  );
}

export default HomePage; 