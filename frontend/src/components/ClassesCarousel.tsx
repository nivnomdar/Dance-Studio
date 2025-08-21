import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Class } from '../types/class';
import { getSimpleColorScheme } from '../utils/colorUtils';
import { Link } from 'react-router-dom';
import 'swiper/swiper-bundle.css';

interface ClassesCarouselProps {
  classes: Class[];
  usedTrialClassIds: Set<string>;
}

const ClassesCarousel: React.FC<ClassesCarouselProps> = ({ classes, usedTrialClassIds }) => {
  if (!classes || classes.length === 0) {
    return null;
  }

  const getClassRoute = (slug: string) => `/class/${slug}`;

  // Only show non-trial classes and trial classes that haven't been used
  const visibleClasses = classes.filter((classItem) => {
    const isTrial = (classItem.category || '').toLowerCase() === 'trial';
    const isUsedTrial = isTrial && usedTrialClassIds.has(classItem.id);
    return !isUsedTrial;
  });

  if (visibleClasses.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <style>{`
        /* Hide overflow on small screens to prevent horizontal scroll */
        .swiper,
        .swiper-wrapper { overflow: hidden !important; }
        @media (min-width: 768px) {
          .swiper,
          .swiper-wrapper { overflow: visible !important; }
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4B2E83] mb-3 sm:mb-4 font-agrandir-grand">
            שיעורי ריקוד
          </h2>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[#4B2E83] mx-auto mb-4 sm:mb-6"></div>
        </div>

        <div className="mx-auto w-full overflow-visible">
          <Swiper
            modules={[Navigation]}
            spaceBetween={24}
            slidesPerView={3}
            loop={visibleClasses.length > 3}
            loopAdditionalSlides={3}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 0 },
              640: { slidesPerView: 1, spaceBetween: 8 },
              768: { slidesPerView: 2, spaceBetween: 16 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1280: { slidesPerView: 4, spaceBetween: 24 },
              1440: { slidesPerView: 4, spaceBetween: 24 },
            }}
            navigation
            className="rounded-lg overflow-hidden sm:overflow-visible"
          >
          {visibleClasses.map((classItem) => {
            const colorScheme = getSimpleColorScheme(classItem);
            const route = getClassRoute(classItem.slug);
            const isTrialClass = (classItem.category || '').toLowerCase() === 'trial';
            const hasUsedTrial = isTrialClass && usedTrialClassIds.has(classItem.id);

            return (
             <SwiperSlide key={classItem.id}>
                   <div className="relative w-full transition-all duration-300">
                     <div
                       className={`bg-white rounded-2xl shadow-xl h-full lg:flex lg:flex-col relative transition-all duration-300 ${
                         hasUsedTrial ? 'lg:opacity-50 opacity-40 grayscale' : ''
                       }`}
                     >
                      {/* Desktop Image */}
                      <div className="relative h-32 sm:h-40 lg:h-48 hidden lg:block">
                        <img
                          src={classItem.image_url || '/carousel/image1.png'}
                          alt={classItem.name}
                          className="w-full h-full object-cover rounded-t-2xl"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPuaJp+ihjOaTjeS9nDwvdGV4dD4KPC9zdmc+';
                          }}
                        />
                        <div className="absolute bottom-3 right-3">
                          <span className={`${colorScheme.bgColor} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                            {classItem.price} ש"ח
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 sm:p-4 lg:p-6 lg:flex lg:flex-col lg:h-full lg:pt-6 pt-3">
                        <h3 className={`text-base sm:text-lg lg:text-xl font-bold ${colorScheme.textColor} mb-2 sm:mb-3 font-agrandir-grand line-clamp-2`}>
                          {classItem.name}
                        </h3>
                        
                        <div className="h-12 sm:h-16 lg:h-20 mb-3 sm:mb-4">
                          <p className="text-[#2B2B2B] font-agrandir-regular leading-relaxed text-xs sm:text-sm lg:text-sm line-clamp-3">
                            {classItem.description}
                          </p>
                        </div>
                        
                        {/* Class Details */}
                        <div className="space-y-2 mb-4 sm:mb-6 h-10 sm:h-12 lg:h-14">
                          {classItem.duration && (
                            <div className={`flex items-center ${colorScheme.textColor} text-xs sm:text-sm`}>
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              <span className="font-agrandir-regular">{classItem.duration} דקות</span>
                            </div>
                          )}
                          {classItem.level && (
                            <div className={`flex items-center ${colorScheme.textColor} text-xs sm:text-sm`}>
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                              </svg>
                              <span className="font-agrandir-regular">רמה: {classItem.level}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Button */}
                        <div className="lg:mt-auto">
                          {hasUsedTrial ? (
                            <div className="inline-flex items-center justify-center w-full bg-gray-500 text-white px-3 lg:px-4 py-2 rounded-xl font-medium text-xs sm:text-sm cursor-not-allowed opacity-90">
                              נוצל
                              <svg className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <Link
                              to={route}
                              className={`inline-flex items-center justify-center w-full ${colorScheme.bgColor} ${colorScheme.hoverColor} text-white px-3 lg:px-4 py-2 rounded-xl transition-colors duration-300 font-medium text-xs sm:text-sm`}
                            >
                              הרשמה
                              <svg className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                              </svg>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
              </SwiperSlide>
            );
          })}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default ClassesCarousel;
