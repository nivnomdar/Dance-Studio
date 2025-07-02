import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
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
          <Link 
            to="/gallery" 
            className="inline-flex items-center gap-2 text-[#EC4899] hover:text-[#EC4899]/80 transition-colors duration-300 text-lg font-agrandir-regular group"
          >
            <span>לצפייה בגלריה המלאה</span>
            <svg 
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
        </div>

        <Swiper
          modules={[Pagination, Navigation]}
          spaceBetween={30}
          slidesPerView={1}
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
          className="rounded-lg overflow-hidden"
        >
          {/* Videos First */}
          <SwiperSlide>
            <div className="relative w-full h-96">
              <video
                src="/videos/NewHeroVideo.MP4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative w-full h-96">
              <video
                src="/videos/ClassesVideo.mp4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative w-full h-96">
              <video
                src="/videos/HeroVideo.MP4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative w-full h-96">
              <video
                src="/videos/Heronew.mp4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </SwiperSlide>

          {/* Images After Videos */}
          <SwiperSlide>
            <img src="/carousel/image1.png" alt="ריקוד על עקבים" className="w-full h-96 object-cover" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="/carousel/image2.png" alt="ריקוד על עקבים" className="w-full h-96 object-cover" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="/carousel/image3.png" alt="ריקוד על עקבים" className="w-full h-96 object-cover" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="/carousel/image4.png" alt="ריקוד על עקבים" className="w-full h-96 object-cover" />
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  );
}

export default PhotosCarousel; 