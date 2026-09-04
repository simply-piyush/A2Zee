'use client';

import React from 'react';
import { Star, PhoneCall } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function AssignedArtisanCard({ assignedArtisan, onViewInCart }) {
  if (!assignedArtisan) return null;

  return (
    <div className="bg-white border-2 border-[#1F4072] rounded-2xl p-5 shadow-xl space-y-4 animate-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-emerald-800 text-sm tracking-wide">
            Artisan Successfully Assigned!
          </span>
        </div>
        <Badge className="bg-[#1F4072] text-white text-xs font-normal px-2.5 py-0.5">
          {assignedArtisan.etaMinutes ? `ETA ~${assignedArtisan.etaMinutes} mins` : 'Scheduled'}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#1F4072] text-white flex items-center justify-center font-display text-2xl shadow-md border-2 border-white">
            {assignedArtisan.name?.[0] || 'K'}
          </div>
          <div>
            <h3 className="font-display text-lg text-gray-900 tracking-wide">
              {assignedArtisan.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5 font-normal">
              <span className="inline-flex items-center text-amber-600 font-normal">
                <Star className="w-3.5 h-3.5 fill-amber-500 mr-0.5" />
                {assignedArtisan.rating} ★
              </span>
              <span>•</span>
              <span className="text-gray-500 truncate max-w-[160px] font-normal">
                {assignedArtisan.cooperative}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5 font-normal">
              Distance: ~{assignedArtisan.distanceKm} km away
            </p>
          </div>
        </div>

        {/* Direct Phone Call Button */}
        <a
          href={`tel:${assignedArtisan.phone}`}
          className="flex flex-col items-center justify-center bg-[#1F4072] hover:bg-[#163056] text-white w-12 h-12 rounded-2xl shadow active:scale-95 transition-transform"
          aria-label={`Call ${assignedArtisan.name}`}
        >
          <PhoneCall className="w-5 h-5 text-[#A8C7FA]" />
          <span className="text-[9px] font-normal mt-0.5">Call</span>
        </a>
      </div>

      <div className="bg-[#FFF6F0] p-3 rounded-xl flex items-center justify-between text-xs font-normal">
        <div>
          <span className="text-gray-500 block font-normal">Booking Reference:</span>
          <span className="font-bold text-[#1F4072]">{assignedArtisan.bookingCode}</span>
        </div>
        <Button
          size="sm"
          type="button"
          onClick={onViewInCart}
          className="bg-black text-white hover:bg-gray-800 text-xs rounded-xl font-normal px-3 py-1 cursor-pointer"
        >
          View in Cart
        </Button>
      </div>
    </div>
  );
}

export default AssignedArtisanCard;
