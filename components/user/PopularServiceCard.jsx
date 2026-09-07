'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * Modern Card Component for Popular Services
 * Follows Modern Web UI/UX principles:
 * - Unified 4:3 aspect ratio image container with smooth micro-scale hover
 * - Typographic hierarchy: service title directly below image, trade tag, and subtle description
 * - High accessibility (focus rings, role="button", keyboard trigger)
 * - Harmonious color tokens matching A2Zee's Federation Navy & Warm Linen palette
 */
export function PopularServiceCard({
  service,
  onClick,
  aspectRatio = 'aspect-[4/3]',
  className = '',
}) {
  if (!service) return null;

  const {
    title,
    trade,
    desc,
    image,
    price = '₹150 base',
  } = service;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(service);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(service)}
      onKeyDown={handleKeyDown}
      className={`group flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-[#1F4072]/30 active:scale-[0.98] transition-all duration-300 overflow-hidden text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4072] ${className}`}
    >
      {/* 1. Consistent Aspect Ratio Image Wrapper */}
      <div className={`relative w-full ${aspectRatio} overflow-hidden bg-slate-100 isolate`}>
        {image ? (
          <img
            src={image}
            alt={title || 'Service Image'}
            loading="eager"
            decoding="sync"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out transform-gpu will-change-transform"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
              transform: 'translate3d(0, 0, 0)',
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E5EEFF] to-[#F5F8FF] text-[#1F4072]">
            <Sparkles className="w-8 h-8 opacity-40" />
          </div>
        )}

        {/* Trade Tag Pill over image */}
        {trade && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-white/95 backdrop-blur-xs text-[#1F4072] shadow-xs border border-[#1F4072]/10">
              {trade}
            </span>
          </div>
        )}
      </div>

      {/* 2. Service Content Underneath the Picture */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1">
          {/* Service Name */}
          <h4 className="font-outfit font-semibold text-base sm:text-lg text-gray-900 group-hover:text-[#1F4072] transition-colors leading-snug line-clamp-1">
            {title}
          </h4>

          {/* Service Description */}
          {desc && (
            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {desc}
            </p>
          )}
        </div>

        {/* Footer: Base Rate & Action */}
        <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 font-outfit">
            {price}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1F4072] font-outfit group-hover:translate-x-0.5 transition-transform">
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default PopularServiceCard;
