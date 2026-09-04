'use client';

import React from 'react';
import { MapPin } from 'lucide-react';

export function EmergencyRadarMap({ nearbyArtisans = [], userCoords = { lat: 22.6950, lng: 88.4550 } }) {
  const offsets = [
    { top: '20%', left: '25%' },
    { top: '30%', right: '22%' },
    { bottom: '25%', left: '35%' },
    { bottom: '20%', right: '30%' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm animate-in fade-in duration-150">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Emergency Radar Active</span>
        </div>
        <span className="text-xs text-gray-500 font-medium">{nearbyArtisans.length} verified artisans near you</span>
      </div>

      {/* Simulated Radar Map View */}
      <div className="relative w-full h-36 bg-[#E9F0FA] rounded-xl overflow-hidden border border-[#D0E0F5] flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(#1F4072_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        
        {/* Radar Pulse Circles */}
        <div className="absolute w-28 h-28 rounded-full border border-[#1F4072]/20 animate-ping pointer-events-none" />
        <div className="absolute w-44 h-44 rounded-full border border-[#1F4072]/15 pointer-events-none" />

        {/* Customer Marker */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-[#1F4072] text-white flex items-center justify-center shadow-lg border-2 border-white">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold bg-white/90 px-2 py-0.5 rounded shadow text-gray-700 mt-1">You</span>
        </div>

        {/* Nearby Artisan Markers */}
        {nearbyArtisans.slice(0, 4).map((artisan, idx) => {
          const pos = offsets[idx % offsets.length];
          return (
            <div
              key={artisan.id || idx}
              style={pos}
              className="absolute z-10 flex flex-col items-center group cursor-pointer"
              title={`${artisan.name} (${artisan.rating}★)`}
            >
              <div className="w-6 h-6 rounded-full bg-[#1F4072]/20 text-[#1F4072] flex items-center justify-center font-bold text-xs shadow border border-[#1F4072]/40 backdrop-blur-sm group-hover:scale-125 transition-transform">
                ★
              </div>
              <span className="text-[9px] font-semibold bg-black/75 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {artisan.name?.split(' ')[0]} • {artisan.distanceKm || '1.8'} km
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-500 mt-2 text-center font-normal">
        Live coordinates: {userCoords.lat.toFixed(4)}° N, {userCoords.lng.toFixed(4)}° E • Guaranteed base diagnosis ₹150
      </p>
    </div>
  );
}

export default EmergencyRadarMap;
