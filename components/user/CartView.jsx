'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopHeaderBanner } from '@/components/ui/top-header-banner';
import { BookingCard } from './BookingCard';

export function CartView({
  myBookings = [],
  onBack,
  onCreateJob,
}) {
  return (
    <div className="flex-1 flex flex-col max-w-md md:max-w-3xl mx-auto w-full pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <TopHeaderBanner
        title="CART & BOOKINGS"
        onBack={onBack}
      />

      <div className="p-6 space-y-6 flex-1">
        {myBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center space-y-4 border border-gray-200 shadow-sm">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto" />
            <h3 className="font-display text-xl text-gray-800">Your Cart is Empty</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto font-normal">
              You have no pending or active service requests. Select a category to book your first verified karigar!
            </p>
            <Button
              type="button"
              onClick={onCreateJob}
              className="bg-[#1F4072] text-white rounded-2xl text-xs px-6 py-2.5 font-normal cursor-pointer"
            >
              Create New Job
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-normal text-gray-800 text-base">
                Active & Past Bookings ({myBookings.length})
              </h3>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={onCreateJob}
                className="text-xs border-[#1F4072] text-[#1F4072] rounded-xl font-normal cursor-pointer"
              >
                + Book Another
              </Button>
            </div>

            <div className="space-y-3">
              {myBookings.map((b) => (
                <BookingCard key={b.id || b.bookingCode} booking={b} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartView;
