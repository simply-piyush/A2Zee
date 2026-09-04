'use client';

import React from 'react';
import { CheckCircle2, PlusCircle, X } from 'lucide-react';

export function JustBookedNotice({ notice, onBookAnother, onDismiss }) {
  if (!notice) return null;

  return (
    <div className="p-4 rounded-3xl bg-[#EBF7EE] border-2 border-[#52C41A] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <div className="font-bold text-emerald-950 text-sm flex items-center gap-2">
            <span>Job Successfully Booked!</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-normal">
              #{notice.code}
            </span>
          </div>
          <div className="text-xs text-emerald-800 font-normal">
            {notice.title} • Added to your Cart / Active Bookings
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          onClick={onBookAnother}
          className="bg-[#1F4072] text-white hover:bg-[#163056] active:scale-95 text-xs font-normal rounded-xl px-4 py-2 flex items-center gap-1.5 shadow transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5 text-[#A8C7FA]" />
          <span>Book Another Job</span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default JustBookedNotice;
