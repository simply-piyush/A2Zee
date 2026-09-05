'use client';

import React from 'react';
import { Phone, ShieldCheck } from 'lucide-react';

export function GoogleArtisanPathMap({
  artisan,
  customerCoords = { lat: 22.6950, lng: 88.4550 },
  artisanCoords = { lat: 22.7010, lng: 88.4620 },
  destinationAddress = 'Madhyamgram, Kolkata',
  status = 'IN_PROGRESS',
  etaMinutes = 12,
}) {
  const isCompleted = status === 'COMPLETED' || status === 'DONE';

  // Origin (Artisan) and Destination (Customer)
  const originLat = artisanCoords?.lat || 22.7010;
  const originLng = artisanCoords?.lng || 88.4620;
  const destLat = customerCoords?.lat || 22.6950;
  const destLng = customerCoords?.lng || 88.4550;

  // Simplified Google Maps Directions Embed
  const embedUrl = `https://maps.google.com/maps?saddr=${originLat},${originLng}&daddr=${destLat},${destLng}&output=embed&z=14`;
  const phone = artisan?.phone || '+91 98300 44556';

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs bg-slate-100">
      {/* Simplified Map Embed */}
      <div className="relative w-full h-64 sm:h-72">
        <iframe
          title="Google Maps Artisan Route"
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen={false}
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full filter contrast-[1.02]"
        />

        {/* Top Minimal ETA Pill */}
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-xs flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isCompleted ? 'bg-emerald-500' : 'bg-emerald-500 animate-ping'
            }`}
          />
          <span className="text-xs font-bold text-[#1F4072]">
            {isCompleted ? 'Work Completed' : `Arriving in ~${etaMinutes} mins`}
          </span>
        </div>

        {/* Bottom Minimal Artisan & Call Bar */}
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#1F4072] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
              {artisan?.initials || artisan?.name?.[0] || 'K'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-slate-900 truncate">
                  {artisan?.name || 'Assigned Artisan'}
                </span>
                <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {artisan?.distance || '1.4 km'} away • ★ {artisan?.rating || '4.9'}
              </p>
            </div>
          </div>

          {/* Call Artisan Action Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F4072] text-white hover:bg-[#162f55] active:scale-95 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title={`Call ${artisan?.name || 'Artisan'}`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleArtisanPathMap;
