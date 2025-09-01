import { useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/swiper-bundle.css';

function PhotosCarousel() {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="pt-2 sm:pt-3 lg:pt-0 pb-4 sm:pb-6 lg:pb-8 mb-4 sm:mb-6 lg:mb-1 bg-black overflow-visible">
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: #EC4899 !important;
        }
        .swiper-pagination-bullet {
          background-color: #EC4899 !important;
        }
        .swiper-pagination-bullet-active {
          background-color: #EC4899 !important;
        }
        @media (max-width: 640px) {
          .swiper-button-next,
          .swiper-button-prev {
            display: none !important;
          }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-1 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 font-agrandir-grand">
            גלריית תמונות
          </h2>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[#EC4899] mx-auto mb-4 sm:mb-6"></div>
        </div>

        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          centeredSlides={true}
          loop={true}
          keyboard={{ enabled: true }}
          pagination={{ clickable: true }}
          navigation
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          breakpoints={{
            640: {
              slidesPerView: 1,
              spaceBetween: 30,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          className="rounded-lg overflow-visible"
          style={{ padding: '50px 0' }}
        >
          {/* Videos First */}
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-80 sm:h-80 lg:h-96 transition-all duration-500 transform-gpu overflow-visible ${
                  isActive ? 'scale-110 sm:scale-125 z-100 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/video1.mp4"
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay={!prefersReducedMotion && !isPaused}
                  loop={!prefersReducedMotion && !isPaused}
                  muted
                  playsInline
                  aria-label="וידאו תדמיתי של הסטודיו"
                />
                <button type="button" onClick={() => setIsPaused(p => !p)} className="absolute bottom-2 left-2 px-2 py-1 text-xs rounded bg-black/50 text-white" aria-pressed={isPaused} aria-label={isPaused ? 'המשך ניגון' : 'השהה ניגון'}>
                  {isPaused ? 'המשך' : 'השהה'}
                </button>
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-64 sm:h-80 lg:h-96 transition-all duration-500 transform-gpu overflow-visible ${
                  isActive ? 'scale-110 sm:scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/video2.mp4"
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay={!prefersReducedMotion && !isPaused}
                  loop={!prefersReducedMotion && !isPaused}
                  muted
                  playsInline
                  aria-label="וידאו שיעורים בסטודיו"
                />
                <button type="button" onClick={() => setIsPaused(p => !p)} className="absolute bottom-2 left-2 px-2 py-1 text-xs rounded bg-black/50 text-white" aria-pressed={isPaused} aria-label={isPaused ? 'המשך ניגון' : 'השהה ניגון'}>
                  {isPaused ? 'המשך' : 'השהה'}
                </button>
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-64 sm:h-80 lg:h-96 transition-all duration-500 transform-gpu overflow-visible ${
                  isActive ? 'scale-110 sm:scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/video3.mp4"
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay={!prefersReducedMotion && !isPaused}
                  loop={!prefersReducedMotion && !isPaused}
                  muted
                  playsInline
                  aria-label="וידאו רקע הסטודיו"
                />
                <button type="button" onClick={() => setIsPaused(p => !p)} className="absolute bottom-2 left-2 px-2 py-1 text-xs rounded bg-black/50 text-white" aria-pressed={isPaused} aria-label={isPaused ? 'המשך ניגון' : 'השהה ניגון'}>
                  {isPaused ? 'המשך' : 'השהה'}
                </button>
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-64 sm:h-80 lg:h-96 transition-all duration-500 transform-gpu overflow-visible ${
                  isActive ? 'scale-110 sm:scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/video4.mp4"
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay={!prefersReducedMotion && !isPaused}
                  loop={!prefersReducedMotion && !isPaused}
                  muted
                  playsInline
                  aria-label="וידאו תדמית נוסף"
                />
                <button type="button" onClick={() => setIsPaused(p => !p)} className="absolute bottom-2 left-2 px-2 py-1 text-xs rounded bg-black/50 text-white" aria-pressed={isPaused} aria-label={isPaused ? 'המשך ניגון' : 'השהה ניגון'}>
                  {isPaused ? 'המשך' : 'השהה'}
                </button>
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-64 sm:h-80 lg:h-96 transition-all duration-500 transform-gpu overflow-visible ${
                  isActive ? 'scale-110 sm:scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/video5.mp4"
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay={!prefersReducedMotion && !isPaused}
                  loop={!prefersReducedMotion && !isPaused}
                  muted
                  playsInline
                  aria-label="וידאו מספר 5"
                />
                <button type="button" onClick={() => setIsPaused(p => !p)} className="absolute bottom-2 left-2 px-2 py-1 text-xs rounded bg-black/50 text-white" aria-pressed={isPaused} aria-label={isPaused ? 'המשך ניגון' : 'השהה ניגון'}>
                  {isPaused ? 'המשך' : 'השהה'}
                </button>
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-64 sm:h-80 lg:h-96 transition-all duration-500 transform-gpu overflow-visible ${
                  isActive ? 'scale-110 sm:scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/video6.mp4"
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay={!prefersReducedMotion && !isPaused}
                  loop={!prefersReducedMotion && !isPaused}
                  muted
                  playsInline
                  aria-label="וידאו מספר 6"
                />
                <button type="button" onClick={() => setIsPaused(p => !p)} className="absolute bottom-2 left-2 px-2 py-1 text-xs rounded bg-black/50 text-white" aria-pressed={isPaused} aria-label={isPaused ? 'המשך ניגון' : 'השהה ניגון'}>
                  {isPaused ? 'המשך' : 'השהה'}
                </button>
              </div>
            )}
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  );
}

export default PhotosCarousel; 