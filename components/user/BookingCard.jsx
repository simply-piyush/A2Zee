'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BookingCard({ booking }) {
  if (!booking) return null;

  const isEmergency = Boolean(
    booking.isEmergency || 
    booking.jobType === 'Instant' || 
    booking.type === 'Emergency'
  );

  // Normalize status to: "Pending", "In Progress", or "Done"
  const rawStatus = (booking.status || '').toUpperCase();
  let statusLabel = 'Pending';
  let statusStyle = 'bg-amber-50 text-amber-700 border-amber-200/80';
  let dotStyle = 'bg-amber-500';

  if (rawStatus === 'COMPLETED' || rawStatus === 'DONE') {
    statusLabel = 'Done';
    statusStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    dotStyle = 'bg-emerald-500';
  } else if (
    rawStatus === 'IN_PROGRESS' || 
    rawStatus === 'ACCEPTED' || 
    rawStatus === 'ASSIGNED' ||
    rawStatus === 'ACTIVE'
  ) {
    statusLabel = 'In Progress';
    statusStyle = 'bg-blue-50 text-[#1F4072] border-blue-200/80';
    dotStyle = 'bg-[#1F4072] animate-ping';
  }

  const jobDesc = booking.serviceTitle || 
    booking.title || 
    booking.customJobDescription || 
    booking.description || 
    'Service Booking';

  const refNumber = booking.bookingCode || 
    (booking.id ? (booking.id.startsWith('A2Z') ? booking.id : `A2Z-${booking.id.slice(-6).toUpperCase()}`) : 'A2Z-PENDING');

  const amount = booking.finalPrice ?? booking.basePrice ?? booking.amount ?? 299;
  const targetId = booking.id || booking.bookingCode;

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-3">
      {/* Top Row: Type and Status */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
            isEmergency
              ? 'bg-rose-50 text-rose-600 border-rose-200/80'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          {isEmergency ? 'Emergency' : 'Non-Emergency'}
        </span>

        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statusStyle}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
          {statusLabel}
        </span>
      </div>

      {/* Middle: Job Description */}
      <div>
        <p className="text-gray-900 font-medium text-sm sm:text-base leading-snug">
          {jobDesc}
        </p>
      </div>

      {/* Bottom: Ref number, Amount, and Details Button */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
        <div className="flex items-center gap-2.5 sm:gap-3 text-gray-500 font-normal">
          <span className="truncate max-w-[130px] sm:max-w-none">
            Ref: <span className="font-semibold text-gray-700">#{refNumber}</span>
          </span>
          <span className="text-gray-300">•</span>
          <span className="font-bold text-gray-900 text-sm">
            ₹{amount}
          </span>
        </div>

        <Link href={`/user/track/${encodeURIComponent(targetId)}`}>
          <Button
            size="sm"
            variant="default"
            className="h-8 px-3 rounded-xl text-xs gap-1 bg-[#1F4072] hover:bg-[#163056] text-white cursor-pointer"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default BookingCard;
