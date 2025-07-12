import React from 'react';

// Base Skeleton Components - Reusable across the app
export const SkeletonBox = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} {...props} />
);

export const SkeletonText = ({ lines = 1, className = "" }: { lines?: number; className?: string }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonBox 
        key={index} 
        className={`h-3 ${index === lines - 1 ? 'w-1/2' : index === lines - 2 ? 'w-3/4' : ''}`} 
      />
    ))}
  </div>
);

export const SkeletonIcon = ({ className = "" }: { className?: string }) => (
  <SkeletonBox className={`w-4 h-4 rounded ${className}`} />
);

export const SkeletonButton = ({ className = "" }: { className?: string }) => (
  <SkeletonBox className={`h-8 rounded-xl ${className}`} />
);

export const SkeletonInput = ({ className = "" }: { className?: string }) => (
  <SkeletonBox className={`h-12 rounded-xl ${className}`} />
);

export const SkeletonImage = ({ className = "" }: { className?: string }) => (
  <SkeletonBox className={`w-full h-full object-cover ${className}`} />
); 