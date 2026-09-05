'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { BookingCard } from './BookingCard';

export function ActiveBookingBanner({ activeBooking, onOpenCart }) {
  if (!activeBooking) return null;

  return (
    <section className="space-y-2 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-normal text-xs uppercase tracking-wider text-gray-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Active Booking
        </h3>
        {onOpenCart && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenCart}
            className="text-xs text-[#1F4072] hover:text-[#1F4072] hover:bg-[#1F4072]/5 h-auto py-1 px-2 cursor-pointer font-normal"
          >
            View all in cart
          </Button>
        )}
      </div>
      <BookingCard booking={activeBooking} />
    </section>
  );
}

export default ActiveBookingBanner;
