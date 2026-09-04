'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, ShieldCheck, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { INITIAL_BOOKING } from '@/lib/data';

export default function TrackExpertPage({ params }) {
  const booking = INITIAL_BOOKING;
  const worker = booking.worker;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-20">
      
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/user">
            <Button variant="outline" size="icon" className="w-9 h-9 rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Live Artisan Tracking</h1>
            <p className="text-xs text-slate-500">Booking Code: <strong>{booking.bookingCode}</strong></p>
          </div>
        </div>

        <Link href={`/user/bill/${booking.id}`}>
          <Button variant="default" size="sm">
            <span>View Bill</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Map & Status */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Simulated Map Card */}
          <div className="relative h-80 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex flex-col justify-between p-5">
            {/* Map Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-70" />

            {/* Top ETA Pill */}
            <div className="relative z-10 self-start bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs text-slate-500 font-semibold uppercase">Arriving by</span>
                <span className="text-base font-bold text-[#1F4072]">9:15 AM</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Approx. 8 mins away • Traffic clear</p>
            </div>

            {/* Worker Pin */}
            <div className="relative z-10 mx-auto my-auto flex flex-col items-center animate-bounce">
              <div className="px-3 py-2 bg-[#1F4072] text-white rounded-xl shadow-md flex items-center gap-2 border border-white">
                <div className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center">
                  {worker.initials}
                </div>
                <span className="text-xs font-semibold">{worker.name} is on the way</span>
              </div>
              <div className="w-2.5 h-2.5 bg-[#1F4072] rotate-45 -mt-1" />
            </div>

            {/* Customer Location Pin */}
            <div className="relative z-10 self-end bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-1.5 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span className="truncate max-w-[200px]">{booking.customerAddress}</span>
            </div>
          </div>

          {/* Service Scope Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Assigned Service</span>
              <h3 className="font-semibold text-sm text-slate-900">{booking.serviceTitle}</h3>
            </div>
            <Badge variant="primary">{booking.jobType}</Badge>
          </div>

        </div>

        {/* Right Col: Artisan Profile & Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 text-center">
            
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1F4072] text-white flex items-center justify-center text-xl font-bold shadow-xs">
              {worker.initials}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="text-lg font-bold text-slate-900">{worker.name}</h3>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-[#1F4072] font-medium">{worker.society}</p>
              <div className="pt-1">
                <Badge variant="ncct">{worker.ncctTier}</Badge>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Rating</p>
                <p className="text-sm font-bold text-slate-900">★ {worker.rating}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Distance</p>
                <p className="text-sm font-bold text-slate-900">{worker.distance}</p>
              </div>
            </div>

            {/* Call Action */}
            <a href={`tel:${worker.phone}`} className="block">
              <Button variant="outline" className="w-full">
                <Phone className="w-4 h-4 mr-2 text-[#1F4072]" />
                <span>Call {worker.phone}</span>
              </Button>
            </a>

          </div>
        </div>

      </div>

    </div>
  );
}
