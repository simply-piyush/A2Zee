'use client';

import React from 'react';
import { ArrowLeft, ShoppingCart, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function CartView({
  myBookings = [],
  onBack,
  onCreateJob,
}) {
  return (
    <div className="flex-1 flex flex-col max-w-md md:max-w-3xl mx-auto w-full pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div 
        className="rounded-b-[36px] px-6 pt-8 pb-6 shadow-lg text-white"
        style={{
          background: 'radial-gradient(circle at top, #275294 0%, #1F4072 100%)'
        }}
      >
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display text-2xl tracking-wider uppercase text-white">
            CART & BOOKINGS
          </h1>
        </div>
      </div>

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

            {myBookings.map((b) => {
              const workerObj = b.worker;
              const isFinished = b.status === 'COMPLETED' || b.status === 'CANCELLED';

              return (
                <div 
                  key={b.id} 
                  className={`bg-white rounded-3xl p-5 border shadow-md space-y-4 transition-all ${
                    !isFinished ? 'border-[#1F4072] ring-1 ring-[#1F4072]/20' : 'border-gray-200'
                  }`}
                >
                  {/* Booking Top Badge Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${!isFinished ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                      <Badge className={b.isEmergency ? "bg-red-500 text-white font-normal" : "bg-[#1F4072] text-white font-normal"}>
                        {b.isEmergency ? "Instant Emergency" : "Timely Scheduled"}
                      </Badge>
                    </div>
                    <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {b.status}
                    </span>
                  </div>

                  {/* Job Title & Scheduled Slot */}
                  <div>
                    <h4 className="font-display text-lg text-gray-900 tracking-wide">
                      {b.serviceTitle || b.title || 'General Repair Job'}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-1 mt-0.5 font-normal">{b.address || b.customerAddress}</p>
                    <p className="text-xs font-normal text-[#1F4072] mt-1">
                      Scheduled: {b.scheduledTime || (b.isEmergency ? 'Immediate (~15 mins)' : 'Day 12, 9 am - 5 pm')}
                    </p>
                  </div>

                  {/* Assigned Worker Details Card */}
                  {workerObj ? (
                    <div className="bg-[#FFF9F5] p-4 rounded-2xl border border-[#F0E4D8] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#1F4072] text-white font-display text-xl flex items-center justify-center shadow">
                          {workerObj.name?.[0] || 'K'}
                        </div>
                        <div>
                          <span className="font-normal text-gray-900 text-sm block">
                            {workerObj.name}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-gray-600 font-normal">
                            <span className="text-amber-600 font-normal">
                              {workerObj.rating || 4.9} ★
                            </span>
                            <span>•</span>
                            <span className="text-gray-500 truncate max-w-[140px] font-normal">
                              {typeof workerObj.cooperative === 'string' ? workerObj.cooperative : workerObj.cooperative?.name || 'Labour Society'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {workerObj.phone && (
                        <a 
                          href={`tel:${workerObj.phone}`}
                          className="p-3 bg-[#1F4072] hover:bg-[#163056] text-white rounded-xl shadow active:scale-95 transition-transform"
                          aria-label="Call worker"
                        >
                          <Phone className="w-4 h-4 text-[#A8C7FA]" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="bg-amber-50 p-3 rounded-xl text-xs text-amber-700 font-normal">
                      Dispatching nearest certified cooperative artisan...
                    </div>
                  )}

                  {/* Pricing and Reference Strip */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 text-gray-500 font-normal">
                    <span>Ref: #{b.bookingCode || b.id?.slice(-8).toUpperCase()}</span>
                    <span className="font-normal text-gray-900 text-sm">
                      ₹{b.finalPrice || 299}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CartView;
