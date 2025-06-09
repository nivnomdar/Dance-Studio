import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

function PhotosCarousel() {
  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4 font-agrandir-grand">
            גלריית תמונות
          </h2>
          <div className="w-24 h-1 bg-[#E6C17C] mx-auto"></div>
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