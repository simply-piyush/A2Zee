'use client';

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

export function EmergencyRadarMap({
  nearbyArtisans = [],
  userCoords = { lat: 22.6950, lng: 88.4550 },
  areaName = 'Madhyamgram, Kolkata'
}) {
  const mapUrl = `https://maps.google.com/maps?q=${userCoords.lat},${userCoords.lng}&z=14&output=embed`;

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs animate-in fade-in duration-150 space-y-2.5 sm:space-y-3">
      {/* Top Header - Mobile First without tick button */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight block">
            Emergency Radar Active
          </span>
          <span className="text-[11px] text-slate-500 block truncate">
            5 km geographic response perimeter
          </span>
        </div>
        <span className="flex-shrink-0 text-[11px] sm:text-xs font-semibold text-[#1F4072] bg-blue-50/80 px-2.5 py-1 rounded-full border border-blue-100/80">
          {nearbyArtisans.length || 4} verified karigars
        </span>
      </div>

      {/* Real Google Maps Embed - Responsive Mobile First Frame */}
      <div className="relative w-full h-44 sm:h-52 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-100 shadow-inner">
        <iframe
          title="Emergency Radar Google Maps"
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen={false}
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full filter contrast-[1.02]"
        />

        {/* Floating Minimal Location Anchor Pill */}
        <div className="absolute top-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 sm:py-1.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-800 max-w-[80%] truncate">
          <Navigation className="w-3 h-3 text-[#1F4072] flex-shrink-0" />
          <span className="truncate">Dispatching near your area</span>
        </div>

        {/* Floating Live Artisan ETA pill */}
        <div className="absolute bottom-2.5 right-2.5 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-slate-200/80 shadow-xs text-[11px] font-bold text-[#1F4072]">
          ETA: ~12-15 mins
        </div>
      </div>

      {/* Micro-footer */}
      <p className="text-[10px] sm:text-[11px] text-slate-500 text-center font-normal">
        Live GPS anchor: {userCoords.lat.toFixed(4)}° N, {userCoords.lng.toFixed(4)}° E • Fast-track emergency dispatch
      </p>
    </div>
  );
}

export default EmergencyRadarMap;
