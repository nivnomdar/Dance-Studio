import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface MediaItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  title: string;
  description?: string;
}

const mediaItems: MediaItem[] = [
  {
    id: 1,
    type: 'image',
    url: '/carousel/image1.png',
    title: 'הופעה שנתית',
    description: 'הופעה מרהיבה של תלמידות הסטודיו'
  },
  {
    id: 2,
    type: 'image',
    url: '/carousel/image2.png',
    title: 'שיעור מחול',
    description: 'תלמידות במהלך שיעור מחול מודרני'
  },
  {
    id: 3,
    type: 'image',
    url: '/carousel/image3.png',
    title: 'הופעה מיוחדת',
    description: 'הופעה מיוחדת של קבוצת התחרות'
  },
  {
    id: 4,
    type: 'image',
    url: '/carousel/image4.png',
    title: 'סטודיו אביגיל',
    description: 'הסטודיו שלנו - מקום של יצירה, חלום והגשמה'
  },
  {
    id: 5,
    type: 'video',
    url: '/videos/NewHeroVideo.MP4',
    title: 'סרטון חדש',
    description: 'סרטון חדש של הסטודיו'
  },
  {
    id: 6,
    type: 'video',
    url: '/videos/ClassesVideo.mp4',
    title: 'סרטון שיעורים',
    description: 'סרטון מתוך שיעורים בסטודיו'
  },
  {
    id: 7,
    type: 'video',
    url: '/videos/HeroVideo.MP4',
    title: 'סרטון הופעה',
    description: 'סרטון הופעה מרהיבה'
  }
];

function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'images' | 'videos'>('all');

  const filteredItems = mediaItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'images') return item.type === 'image';
    if (filter === 'videos') return item.type === 'video';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDF9F6] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#EC4899] mb-6 font-agrandir-grand">
            גלריה
          </h1>
          <div className="w-24 h-1 bg-[#E6C17C] mx-auto"></div>
          <p className="mt-6 text-lg text-[#2B2B2B] max-w-3xl mx-auto font-agrandir-regular">
            צפו ברגעים המרגשים והמיוחדים שלנו
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full transition-colors duration-300 ${
              filter === 'all'
                ? 'bg-[#EC4899] text-white'
                : 'bg-white text-[#2B2B2B] hover:bg-[#EC4899]/10'
            }`}
          >
            הכל
          </button>
          <button
            onClick={() => setFilter('images')}
            className={`px-4 py-2 rounded-full transition-colors duration-300 ${
              filter === 'images'
                ? 'bg-[#EC4899] text-white'
                : 'bg-white text-[#2B2B2B] hover:bg-[#EC4899]/10'
            }`}
          >
            תמונות
          </button>
          <button
            onClick={() => setFilter('videos')}
            className={`px-4 py-2 rounded-full transition-colors duration-300 ${
              filter === 'videos'
                ? 'bg-[#EC4899] text-white'
                : 'bg-white text-[#2B2B2B] hover:bg-[#EC4899]/10'
            }`}
          >
            סרטונים
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg bg-white"
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedItem(item)}
            >
              {item.type === 'image' ? (
                <div className="relative w-full h-64">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="relative w-full h-64">
                  <video
                    src={item.url}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm opacity-90">{item.description}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal for full-screen view */}
        {selectedItem && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <div className="relative max-w-4xl w-full">
              <button
                className="absolute -top-12 right-0 text-white hover:text-[#EC4899] transition-colors duration-300"
                onClick={() => setSelectedItem(null)}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {selectedItem.type === 'image' ? (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <video
                  src={selectedItem.url}
                  className="w-full h-auto rounded-lg"
                  controls
                  autoPlay
                />
              )}
              <div className="mt-4 text-white text-center">
                <h3 className="text-2xl font-bold mb-2">{selectedItem.title}</h3>
                {selectedItem.description && (
                  <p className="text-lg opacity-90">{selectedItem.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GalleryPage; 