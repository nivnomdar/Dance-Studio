import React from 'react';
import { Link } from 'react-router-dom';
import { Class } from '../types/class';
import { getSimpleColorScheme } from '../utils/colorUtils';
import { getDefaultClassImage } from '../config/classImages';

interface ClassCardProps {
  classItem: Class;
  usedTrialClassIds: Set<string>;
}

const ClassCard: React.FC<ClassCardProps> = ({ classItem, usedTrialClassIds }) => {
  const colorScheme = getSimpleColorScheme(classItem);
  const route = `/class/${classItem.slug}`;
  const isTrialClass = (classItem.category || '').toLowerCase() === 'trial';
  const hasUsedTrial = isTrialClass && usedTrialClassIds.has(classItem.id);

  return (
    <article
      className={`w-75 bg-white rounded-2xl shadow-xl h-full flex flex-col relative transition-all duration-300 ${
        hasUsedTrial ? 'lg:opacity-50 opacity-40 grayscale' : ''
      }`}
      aria-labelledby={`class-title-${classItem.id}`}
      aria-describedby={`class-description-${classItem.id}`}
    >
      {/* Trial ribbon (only for unused trials) */}
      {isTrialClass && !hasUsedTrial && (
        <div className="pointer-events-none absolute top-2 right-2 z-20 select-none" aria-hidden="true">
          <div className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 shadow-md ring-1 ring-white/40 ${colorScheme.bgColor} text-white`}>
            <svg className="w-3.5 h-3.5 opacity-90" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.017 3.134a1 1 0 00.95.69h3.297c.969 0 1.371 1.24.588 1.81l-2.667 1.94a1 1 0 00-.364 1.118l1.017 3.135c.3.92-.755 1.688-1.54 1.118l-2.667-1.94a1 1 0 00-1.176 0l-2.667 1.94c-.784.57-1.838-.198-1.54-1.118l1.017-3.135a1 1 0 00-.364-1.118L2.097 8.56c-.783-.57-.38-1.81.588-1.81h3.297a1 1 0 00.95-.69l1.017-3.134z"/>
            </svg>
            <span className="text-[12px] sm:text-sm font-agrandir-grand font-semibold tracking-[0.04em]">ניסיון</span>
          </div>
        </div>
      )}
      {/* Card Image (same size across sizes to match desktop) */}
      <div className="relative h-56 block">
        <img
          src={classItem.image_url || getDefaultClassImage().url}
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
      <div className="p-6 flex flex-col h-full pt-6">
        <h3 id={`class-title-${classItem.id}`} className={`text-xl font-bold ${colorScheme.textColor} mb-3 font-agrandir-grand line-clamp-2`}>
          {classItem.name}
        </h3>

        <div className="h-20 mb-4">
          <p id={`class-description-${classItem.id}`} className="text-[#2B2B2B] font-agrandir-regular leading-relaxed text-sm line-clamp-3">
            {classItem.description}
          </p>
        </div>

        {/* Class Details */}
        <div className="space-y-2 mb-6 h-14">
          {classItem.duration && (
            <div className={`flex items-center ${colorScheme.textColor} text-sm`}>
              <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-agrandir-regular">{classItem.duration} דקות</span>
            </div>
          )}
          {classItem.level && (
            <div className={`flex items-center ${colorScheme.textColor} text-sm`}>
              <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <span className="font-agrandir-regular">רמה: {classItem.level}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="lg:mt-auto">
          {hasUsedTrial ? (
            <div className="inline-flex items-center justify-center w-full bg-gray-500 text-white px-3 lg:px-4 py-2 rounded-xl font-medium text-xs sm:text-sm cursor-not-allowed opacity-90" role="status" aria-label="שיעור ניסיון שכבר נוצל">
              נוצל
              <svg className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <Link
              to={route}
              className={`inline-flex items-center justify-center w-full ${colorScheme.bgColor} ${colorScheme.hoverColor} text-white px-3 lg:px-4 py-2 rounded-xl transition-colors duration-300 font-medium text-xs sm:text-sm`}
              aria-label={`הרשמה לשיעור ${classItem.name}`}
            >
              הרשמה
              <svg className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

export default ClassCard;


