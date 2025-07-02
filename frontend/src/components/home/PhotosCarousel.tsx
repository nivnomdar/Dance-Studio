import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, EffectCoverflow } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/swiper-bundle.css';

function PhotosCarousel() {
  return (
    <section className="py-16 bg-black">
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
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4 font-agrandir-grand">
            גלריית תמונות
          </h2>
          <div className="w-24 h-1 bg-[#EC4899] mx-auto mb-6"></div>
        </div>

        <Swiper
          modules={[Pagination, Navigation]}
          spaceBetween={30}
          slidesPerView={1}
          centeredSlides={true}
          loop={true}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="rounded-lg overflow-visible"
        >
          {/* Videos First */}
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-96 transition-all duration-500 transform-gpu ${
                  isActive ? 'scale-125 z-100 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/NewHeroVideo.MP4"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-96 transition-all duration-500 transform-gpu ${
                  isActive ? 'scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/ClassesVideo.mp4"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-96 transition-all duration-500 transform-gpu ${
                  isActive ? 'scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/HeroVideo.MP4"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-96 transition-all duration-500 transform-gpu ${
                  isActive ? 'scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/Heronew.mp4"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            )}
          </SwiperSlide>

          {/* Images After Videos */}
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-96 transition-all duration-500 transform-gpu ${
                  isActive ? 'scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <img src="/carousel/image1.png" alt="ריקוד על עקבים" className="w-full h-full object-cover" />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-96 transition-all duration-500 transform-gpu ${
                  isActive ? 'scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <img src="/carousel/image2.png" alt="ריקוד על עקבים" className="w-full h-full object-cover" />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-96 transition-all duration-500 transform-gpu ${
                  isActive ? 'scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <img src="/carousel/image3.png" alt="ריקוד על עקבים" className="w-full h-full object-cover" />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-96 transition-all duration-500 transform-gpu ${
                  isActive ? 'scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <img src="/carousel/image4.png" alt="ריקוד על עקבים" className="w-full h-full object-cover" />
              </div>
            )}
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  );
}

export default PhotosCarousel; 