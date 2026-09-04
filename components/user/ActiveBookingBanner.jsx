'use client';

import React from 'react';
import { Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ActiveBookingBanner({ activeBooking, onOpenCart }) {
  if (!activeBooking) return null;

  return (
    <section className="bg-white border-2 border-[#1F4072] rounded-3xl p-5 shadow-lg space-y-3 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <h4 className="font-display text-base text-gray-900 tracking-wide uppercase">
            ACTIVE BOOKING IN PROGRESS
          </h4>
        </div>
        <Badge className="bg-[#1F4072] text-white text-xs font-normal">
          {activeBooking.status}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1F4072] text-white font-display text-xl flex items-center justify-center shadow">
            {activeBooking.worker?.name?.[0] || 'K'}
          </div>
          <div>
            <h5 className="font-normal text-gray-900 text-sm">
              {activeBooking.worker?.name || 'Assigned Karigar'}
            </h5>
            <p className="text-xs text-gray-600 flex items-center gap-1.5 font-normal">
              <span className="text-amber-600 font-normal">
                {activeBooking.worker?.rating || 4.9} ★
              </span>
              <span>•</span>
              <span className="truncate max-w-[150px] font-normal">
                {activeBooking.serviceTitle}
              </span>
            </p>
            <p className="text-[11px] text-gray-500 font-normal">
              {activeBooking.isEmergency
                ? 'Emergency Artisan on route (~12 mins ETA)'
                : `Scheduled: ${activeBooking.scheduledTime || 'Confirmed'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeBooking.worker?.phone && (
            <a
              href={`tel:${activeBooking.worker.phone}`}
              className="p-2.5 bg-[#1F4072] text-white rounded-xl shadow active:scale-95 transition-transform"
              aria-label="Call artisan"
            >
              <Phone className="w-4 h-4 text-[#A8C7FA]" />
            </a>
          )}
          <button
            type="button"
            onClick={onOpenCart}
            className="px-3 py-2 bg-black text-white rounded-xl text-xs font-normal hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Cart & Track
          </button>
        </div>
      </div>
    </section>
  );
}

export default ActiveBookingBanner;
