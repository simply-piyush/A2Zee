'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Star, Clock, MapPin, Sparkles, ArrowRight, PlusCircle, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function BookingSuccessModal({ 
  isOpen, 
  bookingData, 
  onClose, 
  onBookAnother 
}) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onClose) onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  if (!isOpen || !bookingData) return null;

  const worker = bookingData.worker || bookingData.assignedWorker;
  const isEmergency = bookingData.isEmergency || bookingData.jobType === 'Instant';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#FFF6F0] rounded-[32px] border-2 border-[#1F4072] shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center overflow-hidden animate-in zoom-in-95 duration-300"
        style={{
          boxShadow: '0 20px 60px -15px rgba(31, 64, 114, 0.4)'
        }}
      >
        {/* Decorative Top Pattern */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1F4072] via-[#8EB5EC] to-[#1F4072]" />

        {/* Animated Done Checkmark Icon */}
        <div className="relative my-3 flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full bg-[#1F4072]/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-[#1F4072]/15 border-4 border-[#1F4072] flex items-center justify-center shadow-lg transition-transform animate-in zoom-in duration-300">
            <CheckCircle2 className="w-11 h-11 text-[#1F4072] stroke-[2.5]" />
          </div>
          <Sparkles className="w-6 h-6 text-[#1F4072] absolute -top-1 -right-2 animate-bounce" />
        </div>

        {/* Heading */}
        <h2 className="font-display text-2xl sm:text-3xl text-[#1F4072] tracking-wider uppercase mt-2">
          JOB BOOKED!
        </h2>
        <p className="font-secondary text-xs sm:text-sm text-gray-700 font-semibold mt-1">
          {isEmergency 
            ? 'Verified emergency artisan dispatched immediately!' 
            : 'Scheduled appointment locked into the cooperative roster.'}
        </p>

        {/* Booking Summary Box */}
        <div className="w-full bg-white rounded-2xl p-4 border border-[#1F4072]/20 my-4 text-left shadow-sm space-y-2.5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Service Request
            </span>
            <Badge className="bg-[#1F4072] text-white text-[11px] font-semibold">
              {bookingData.trade || 'Karigar Service'}
            </Badge>
          </div>

          <div className="text-sm font-bold text-gray-900 line-clamp-2">
            {bookingData.customTitle || bookingData.serviceTitle || bookingData.customDesc || 'Standard Service Diagnosis'}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#1F4072]" />
            <span>{bookingData.scheduledTime || (isEmergency ? 'Immediate (~12-15 mins ETA)' : 'Scheduled Slot')}</span>
          </div>

          {/* Assigned Karigar preview if available */}
          {worker && (
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1F4072] text-[#A8C7FA] flex items-center justify-center font-bold text-xs">
                  {worker.name?.[0] || 'K'}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">{worker.name}</div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    <span>{worker.rating || '4.9'}</span>
                    <span>• {worker.cooperative || 'Cooperative Society'}</span>
                  </div>
                </div>
              </div>
              {worker.etaMinutes && (
                <Badge className="bg-[#1F4072]/15 text-[#1F4072] border border-[#1F4072]/30 text-[10px] font-bold">
                  ETA {worker.etaMinutes}m
                </Badge>
              )}
            </div>
          )}

          {bookingData.id && (
            <div className="text-[10px] text-gray-400 font-mono pt-1 text-center">
              Booking Ref: #{bookingData.bookingCode || bookingData.id?.slice(0, 8).toUpperCase()}
            </div>
          )}
        </div>

        {/* Reassurance Message */}
        <p className="text-xs text-slate-600 font-medium px-2 mb-4 leading-relaxed">
          Your job is stored in your <strong className="text-[#1F4072]">Cart / Active Bookings</strong>. You can book multiple services simultaneously!
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-2">
          <button
            type="button"
            onClick={onBookAnother || onClose}
            className="w-full py-3.5 px-4 bg-[#1F4072] hover:bg-[#163056] active:scale-[0.98] text-white font-display text-sm tracking-wider uppercase rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#A8C7FA]" />
            <span>Book Another Job</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-white hover:bg-gray-100 active:scale-[0.98] text-[#1F4072] font-semibold text-xs rounded-xl border border-gray-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Back to Home (Redirecting in {countdown}s...)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-1.5 rounded-full mt-4 overflow-hidden">
          <div 
            className="bg-[#1F4072] h-full transition-all duration-1000 ease-linear"
            style={{ width: `${((3 - countdown) / 3) * 100}%` }}
          />
        </div>

      </div>
    </div>
  );
}
