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

const isVideoUrl = (url?: string | null) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTIwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iOTAiIGZpbGw9IiNGRkZGRkYiLz48cGF0aCBkPSJNNDUgMzVMMC A2NSAwIDAgNDUgMzV6IiBmaWxsPSIjRTJFMkUyIi8+PC9zdmc+';
  target.onerror = null;
};

const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
  const video = e.currentTarget as HTMLVideoElement;
  // Show a minimal placeholder poster on error
  const svg =
    'data:image/svg+xml;base64,' +
    btoa(
      '<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="400" height="300" fill="#F3F4F6"/>' +
        '<circle cx="200" cy="150" r="46" fill="#E5E7EB"/>' +
        '<path d="M186 130L226 150L186 170V130Z" fill="#9CA3AF"/>' +
      '</svg>'
    );
  video.poster = svg;
};

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ product, activeImageIdx, setActiveImageIdx }) => {
  const allSources = React.useMemo(() => {
    if (!product) return [] as string[];
    const verTs = product.updated_at || product.created_at || undefined;
    const main = buildImageUrl(product.main_image || '', verTs || null);
    const gallery = Array.isArray(product.gallery_images) ? product.gallery_images : [];
    const processed = [main, ...gallery.map((g) => buildImageUrl(g, verTs || null))].filter(Boolean);
    return processed.length ? processed : [''];
  }, [product]);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Pause video when component is not visible to avoid CPU/network usage
  React.useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            try {
              node.pause();
            } catch {}
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [activeImageIdx]);

  // Preload next/previous videos metadata for snappier switching
  React.useEffect(() => {
    const urls: string[] = [];
    if (!allSources.length) return;
    const next = allSources[activeImageIdx + 1];
    const prev = allSources[activeImageIdx - 1];
    if (next && isVideoUrl(next)) urls.push(next);
    if (prev && isVideoUrl(prev)) urls.push(prev);
    const links: HTMLLinkElement[] = urls.map((u) => {
      const l = document.createElement('link');
      l.rel = 'preload';
      l.as = 'video';
      l.href = u;
      document.head.appendChild(l);
      return l;
    });
    return () => {
      links.forEach((l) => document.head.removeChild(l));
    };
  }, [activeImageIdx, allSources]);

  return (
    <div role="region" aria-roledescription="גלריית סרטונים">
      <div className="relative flex items-center justify-center rounded-2xl overflow-hidden bg-white border border-[#EC4899]/10 p-3 lg:p-4 shadow-md lg:shadow-lg" aria-live="polite">
        {isVideoUrl(allSources[activeImageIdx]) ? (
          <video
            key={allSources[activeImageIdx]}
            ref={videoRef}
            src={allSources[activeImageIdx]}
            controls
            playsInline
            preload="metadata"
            className="h-auto max-h-72 sm:max-h-96 lg:max-h-[500px] w-auto object-contain rounded-xl bg-gray-50"
            onError={handleVideoError}
          />
        ) : (
          <img
            src={allSources[activeImageIdx]}
            alt={product.name}
            className="h-auto max-h-72 sm:max-h-96 lg:max-h-[500px] w-auto object-contain rounded-xl"
            onError={handleImageError}
            loading="lazy"
          />
        )}
      </div>

      {allSources.length > 1 && (
        <div className="mt-3 flex justify-center">
          <div className="flex flex-wrap gap-2">
            {allSources.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                aria-pressed={activeImageIdx === idx}
                aria-label={`בחר וידאו ${idx + 1} של ${product.name}`}
                aria-current={activeImageIdx === idx ? 'true' : undefined}
                className={`rounded-md overflow-hidden border ${activeImageIdx === idx ? 'border-2 border-[#EC4899] bg-[#EC4899]/10 shadow-sm' : 'border border-transparent'} focus-visible:outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0`}
                title={`וידאו ${idx + 1}`}
              >
                {isVideoUrl(src) ? (
                  <video
                    src={src}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-12 w-12 object-contain bg-gray-50"
                    onError={handleVideoError}
                  />
                ) : (
                  <img src={src} alt={`תמונה ${idx + 1} של ${product.name}`} className="h-12 w-12 object-contain bg-gray-50" onError={handleImageError} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
