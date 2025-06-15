import React from 'react';
import '../styles.css';

export const SkeletonCertificateViewer: React.FC = () => (
  <div className="trufa-certificate-viewer skeleton flex flex-col md:flex-row gap-8 animate-pulse">
    {/* Left: Badge and summary */}
    <div className="flex flex-col items-center md:w-1/3 w-full gap-4">
      <div className="bg-gray-300 rounded-full w-40 h-40 mb-4" />
      <div className="h-6 bg-gray-300 rounded w-32 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
      <div className="h-4 bg-gray-200 rounded w-20 mb-1" />
      <div className="h-10 bg-gray-300 rounded w-36 mt-4" />
    </div>
    {/* Right: Details */}
    <div className="flex-1 flex flex-col gap-6">
      <div className="h-8 bg-gray-300 rounded w-2/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-6 w-20 bg-gray-200 rounded-full" />
        ))}
      </div>
      {/* Earning Criteria */}
      <div className="space-y-2 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-3/4" />
        ))}
      </div>
      {/* Standards */}
      <div className="space-y-2 mb-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-1/3" />
        ))}
      </div>
      {/* Occupations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded" />
        ))}
      </div>
      {/* Related Badges */}
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 w-16 bg-gray-200 rounded-full" />
        ))}
      </div>
    </div>
  </div>
);

export default SkeletonCertificateViewer; 