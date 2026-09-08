'use client';

import React from 'react';
import { MapPin, Clock, Flame, ChevronRight, XCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * WorkerJobMinimalCard Component
 * Standard minimal card for assigned jobs:
 * - Minimal info only: Emergency/Standard pin, bold service title, truncated location with ...,
 *   scheduled time, and 85% worker payout.
 * - Clean Swiss-inspired minimal box without extraneous visual clutter.
 * - Mobile-friendly with overflow hidden & text-ellipsis.
 */
export function WorkerJobMinimalCard({
  booking,
  onOpenDetails,
  onOpenRejectModal,
  isSubmitting = false,
  className = '',
}) {
  if (!booking) return null;

  const isEmergency = Boolean(booking.isEmergency);
  const basePrice = Number(booking.basePrice || 250);
  const extraAmount = Number(booking.extraAmount || 0);
  const artisanShare = Math.round((basePrice + extraAmount) * 0.85);

  const address = booking.customerAddress || booking.address || 'Address on file';
  const serviceTitle = booking.serviceTitle || booking.service?.name || 'Assigned Household Service';
  const bookingCode = booking.bookingCode || 'BK-2026';
  const scheduledTime = booking.scheduledTime || 'Scheduled for Today';

  return (
    <div
      onClick={() => onOpenDetails?.(booking)}
      className={`group relative bg-white border border-slate-200/90 hover:border-[#1F4072]/40 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-left select-none ${className}`}
    >
      <div className="flex flex-col gap-3">
        {/* Top Header Strip: Emergency or Standard Pin + Code + Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isEmergency ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse shrink-0 font-outfit">
                <Flame className="w-3 h-3 text-amber-600 fill-amber-600" />
                <span>EMERGENCY</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 shrink-0 font-secondary">
                <span>STANDARD</span>
              </span>
            )}

            <span className="text-slate-300">•</span>
            <span className="font-mono text-xs font-semibold text-slate-500 truncate">
              {bookingCode}
            </span>
          </div>

          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full shrink-0 font-outfit">
            ₹{artisanShare} Pay
          </span>
        </div>

        {/* Service Title */}
        <div>
          <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-[#1F4072] transition-colors leading-snug line-clamp-1 font-outfit">
            {serviceTitle}
          </h3>

          {/* Location with Mobile-Friendly Truncate Ellipsis */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-[#1F4072] shrink-0" />
            <span 
              className="truncate block min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-secondary"
              title={address}
            >
              {address}
            </span>
          </div>
        </div>

        {/* Bottom Row: Time and More Details Trigger */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-secondary truncate mr-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{scheduledTime}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenRejectModal && booking.status !== 'IN_PROGRESS' && booking.status !== 'COMPLETED' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenRejectModal?.(booking);
                }}
                disabled={isSubmitting}
                className="h-8 px-2.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg cursor-pointer"
              >
                <XCircle className="w-3 h-3 mr-1" />
                <span>Reject</span>
              </Button>
            )}

            <span className="inline-flex items-center gap-1 font-bold text-[#1F4072] font-outfit text-xs group-hover:translate-x-0.5 transition-transform">
              <span>More Details</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerJobMinimalCard;
