import React, { useEffect, useState } from 'react';
import { apiService } from '../../lib/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/swiper-bundle.css'; // Corrected import path
import { useRef } from 'react';
// import 'swiper/css'; // Removed
// import 'swiper/css/pagination'; // Removed
// import 'swiper/css/navigation'; // Removed

type ProductMini = {
  id: string;
  name: string;
  price: number;
  main_image?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_active: boolean;
  trending?: boolean | null;
};

interface RelatedProductsSectionProps {
  currentProductId: string;
  categoryId?: string | null;
}

const buildImageUrl = (url?: string | null, ts?: string | null) => {
  if (!url) return '';
  if (!ts) return url;
  const ver = new Date(ts).getTime();
  return `${url}${url.includes('?') ? '&' : '?'}v=${ver}`;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCI yeT0iMjAwIiB0ZXh0LWFuY2hvciI9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij7uaJp+ihjOaTjeS9nPC90ZXh0Pgo8L3N2Zz4=';
  target.onerror = null;
};

const RelatedProductsSection: React.FC<RelatedProductsSectionProps> = ({ currentProductId, categoryId }) => {
  const [relatedProducts, setRelatedProducts] = useState<ProductMini[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const swiperRef = useRef<any>(null);

  
  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all active products first
        const allProducts = await apiService.shop.getProducts();
        if (!mounted) return;

        let productsToDisplay: ProductMini[] = [];
        const seenProductIds = new Set<string>();

        // 1. Add related products (from same category, excluding current product)
        if (categoryId) {
          const categoryRelated = allProducts.filter(p => 
            p.id !== currentProductId && 
            p.is_active && 
            p.category_id === categoryId &&
            (p.trending ?? false)
          );
          for (const p of categoryRelated) {
            if (productsToDisplay.length < 8 && !seenProductIds.has(p.id)) {
              productsToDisplay.push(p as ProductMini);
              seenProductIds.add(p.id);
            }
          }
        }

        // 2. If not enough, add random active products (excluding current and already added)
        if (productsToDisplay.length < 8) {
          const availableForRandom = allProducts.filter(p => 
            p.id !== currentProductId && 
            p.is_active && 
            !seenProductIds.has(p.id)
          );
          
          // Shuffle and pick to fill up to 8
          const shuffled = availableForRandom.sort(() => 0.5 - Math.random());
          for (const p of shuffled) {
            if (productsToDisplay.length < 8) {
              productsToDisplay.push(p as ProductMini);
              seenProductIds.add(p.id);
            } else {
              break;
            }  
          }
        }
        
        setRelatedProducts(productsToDisplay);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'שגיאה בטעינת מוצרים קשורים');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => { mounted = false; };
  }, [categoryId, currentProductId]);

  if (loading) {
    return (
      <div className="mt-10 text-center">
        <LoadingSpinner message="טוענים מוצרים קשורים..." size="sm" />
      </div>
    );
  }

  if (error) {
    return <div className="mt-10 text-center text-red-600">{error}</div>;
  }

  if (relatedProducts.length === 0) {
    return null; // No related products to show
  }

  return (
    <section className="mt-10 lg:mt-12 bg-white py-8 sm:py-12 lg:py-16 relative">
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: #EC4899 !important;
          width: 44px !important;
          height: 44px !important;
          border-radius: 9999px !important;
          background: linear-gradient(135deg, rgba(236,72,153,0.12), rgba(75,46,131,0.12)) !important;
          border: 2px solid #EC4899 !important;
          backdrop-filter: blur(8px);
          box-shadow: 0 6px 18px rgba(236,72,153,0.25);
          display: flex; align-items: center; justify-content: center;
          top: 50% !important; transform: translateY(-50%);
          transition: transform .2s ease, box-shadow .2s ease, background .2s ease, opacity .2s ease;
          z-index: 10;
        }
        .swiper-button-next::after,
        .swiper-button-prev::after { font-size: 18px !important; }
        .swiper-button-prev { right: 20px !important; left: auto !important; }
        .swiper-button-next { left: 20px !important; right: auto !important; }
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          transform: translateY(-50%) scale(1);
          box-shadow: 0 10px 28px rgba(236,72,153,0.35);
          background: linear-gradient(135deg, rgba(236,72,153,0.18), rgba(75,46,131,0.18)) !important;
        }
        .swiper-button-next:active,
        .swiper-button-prev:active {
          transform: translateY(-50%) scale(1);
        }
        .swiper-button-next:focus-visible,
        .swiper-button-prev:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(236,72,153,0.45);
          outline: 2px solid #000000 !important; /* Changed to black */
          outline-offset: 2px;
          border-radius: 9999px;
          box-shadow: none;
          transition: none;
        }
        .swiper-button-disabled {
          opacity: .35 !important;
          box-shadow: none !important;
          cursor: not-allowed !important;
        }
        .swiper-pagination { display: none !important; }
        /* Always show navigation buttons, but adjust visibility for small screens dynamically if needed */
        @media (max-width: 768px) {
          .swiper-button-next,
          .swiper-button-prev {
            display: flex !important; /* Ensure they are visible */
            width: 36px !important;
            height: 36px !important;
            font-size: 14px !important; /* Adjust font size for smaller buttons */
          }
          .swiper-button-prev { right: 4px !important; }
          .swiper-button-next { left: 4px !important; }
        }
        .flame-svg { filter: drop-shadow(0 0 4px rgba(236,72,153,.5)); }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4B2E83] mb-4 lg:mb-6 font-agrandir-grand">מוצרים שאולי תאהבי</h2>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[#EC4899] mx-auto" />
        </div>
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          spaceBetween={16}
          slidesPerView={1.15}
          centeredSlides={false}
          loop={true}
          autoHeight={false}
          navigation={true}
          // autoplay={{ delay: 3000, disableOnInteraction: false }} // Removed autoplay
          breakpoints={{
            640: { slidesPerView: 2.15, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="overflow-visible -mx-4 sm:-mx-6 lg:-mx-8"
          role="region"
          aria-label="מוצרים שאולי תאהבי"
          ref={swiperRef}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            const nextButton = swiper.navigation.nextEl as HTMLElement;
            const prevButton = swiper.navigation.prevEl as HTMLElement;

            if (nextButton) {
              nextButton.tabIndex = 0;
              nextButton.setAttribute('role', 'button');
              nextButton.setAttribute('aria-label', 'המוצר הבא');
              nextButton.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  nextButton.click();
                }
              });
            }
            if (prevButton) {
              prevButton.tabIndex = 0;
              prevButton.setAttribute('role', 'button');
              prevButton.setAttribute('aria-label', 'המוצר הקודם');
              prevButton.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  prevButton.click();
                }
              });
            }
          }}
        >
          {relatedProducts.map((p) => (
            <SwiperSlide key={p.id} className="h-auto">
              {({ isActive }) => (
                <article className="bg-white rounded-xl border border-[#EC4899]/30 overflow-hidden transition-all duration-200 flex flex-col h-full">
                  <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-xl">
                    {p.main_image ? (
                      <>
                        <img src={buildImageUrl(p.main_image, p.updated_at || p.created_at)} alt={p.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={handleImageError} />
                        {(p.trending ?? false) && (
                          <div className="absolute top-1 sm:top-4 right-1 sm:right-1 flex items-center justify-center w-15 h-15 sm:w-10 sm:h-10" aria-hidden="true" title="מוצר חם">
                            <svg className="flame-svg w-12 h-12 sm:w-12 sm:h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <defs>
                                <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#EC4899"/>
                                  <stop offset="60%" stopColor="#F59E0B"/>
                                  <stop offset="100%" stopColor="#FDBA74"/>
                                </linearGradient>
                              </defs>
                              <path d="M12 2c2 3 5 4.5 5 8.5 0 3.59-2.91 6.5-6.5 6.5S4 14.09 4 10.5c0-1.7.66-3.25 1.76-4.41C7.12 4.67 8.3 3.94 9 3c-.2 1.6.4 2.6 1.5 3.5C11.7 5.6 12 4 12 2z" fill="url(#flameGrad)"/>
                              <path d="M10.5 9.8c1.1.9 1.5 2 .8 3.2-.6 1-1.9 1.5-3 1-1-.5-1.6-1.8-1.2-2.9.3-.9 1-1.6 1.9-2 .1.8.6 1.2 1.5 1.7z" fill="#FFF3E0" opacity=".8"/>
                            </svg>
                            <span className="sr-only">מוצר חם</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">אין תמונה</div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-gray-900 font-semibold text-base sm:text-lg line-clamp-1 min-h-[1.75rem]">{p.name}</h3>
                    {/* <p className="text-white/70 text-sm line-clamp-2 mt-1 min-h-[2.5rem]">{p.description || ''}</p> */}
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span className="text-[#EC4899] font-bold text-base">₪{Number(p.price).toLocaleString()}</span>
                      <button type="button" aria-label={`הצגת מוצר ${p.name}`} onClick={() => navigate(`/product/${p.id}`)} className="group px-3 py-1.5 rounded-full bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white text-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 transition inline-flex items-center gap-1.5 cursor-pointer"
                        tabIndex={isActive ? 0 : -1}>
                        <span>צפי במוצר</span>
                      </button>
                    </div>
                  </div>
                </article>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default RelatedProductsSection;
