import React from 'react';

type ProductRecord = {
  id: string;
  name: string;
  main_image?: string | null;
  gallery_images?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

interface ProductImageGalleryProps {
  product: ProductRecord;
  activeImageIdx: number;
  setActiveImageIdx: (idx: number) => void;
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

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ product, activeImageIdx, setActiveImageIdx }) => {
  const allImages = React.useMemo(() => {
    if (!product) return [] as string[];
    const verTs = product.updated_at || product.created_at || undefined;
    const main = buildImageUrl(product.main_image || '', verTs || null);
    const gallery = Array.isArray(product.gallery_images) ? product.gallery_images : [];
    const processed = [main, ...gallery.map((g) => buildImageUrl(g, verTs || null))].filter(Boolean);
    return processed.length ? processed : [''];
  }, [product]);

  return (
    <div role="region" aria-roledescription="גלריית תמונות">
      <div className="relative flex items-center justify-center rounded-2xl overflow-hidden bg-white border border-[#EC4899]/10 p-3 lg:p-4 shadow-md lg:shadow-lg" aria-live="polite">
        <img
          src={allImages[activeImageIdx]}
          alt={product.name}
          className="h-auto max-h-72 sm:max-h-96 lg:max-h-[500px] w-auto object-contain rounded-xl"
          onError={handleImageError}
          loading="lazy"
        />
      </div>

      {allImages.length > 1 && (
        <div className="mt-3 flex justify-center">
          <div className="flex flex-wrap gap-2">
            {allImages.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                aria-pressed={activeImageIdx === idx}
                aria-label={`בחר תמונה ${idx + 1} של ${product.name}`}
                aria-current={activeImageIdx === idx ? 'true' : undefined}
                className={`rounded-md overflow-hidden border ${activeImageIdx === idx ? 'border-2 border-[#EC4899] bg-[#EC4899]/10 shadow-sm' : 'border border-transparent'} focus-visible:outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0`}
                title={`תמונה ${idx + 1}`}
              >
                <img src={src} alt={`תמונה ${idx + 1} של ${product.name}`} className="h-12 w-12 object-contain bg-gray-50" onError={handleImageError} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
