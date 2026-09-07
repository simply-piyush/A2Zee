'use client';

import React from 'react';
import { 
  Flame, Clock, MapPin, ArrowRight, ShieldCheck, 
  CheckCircle2, XCircle, AlertCircle, Wrench 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function WorkerIncomingGigs({
  gigs = [],
  onSelectGig,
  onRejectGig,
  isSubmitting = false,
}) {
  if (!gigs || gigs.length === 0) {
    return (
      <Card className="p-10 text-center border-dashed border-2 border-slate-200">
        <div className="max-w-xs mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">All Assigned Jobs Handled</h3>
          <p className="text-xs text-slate-500 font-secondary">
            No pending assigned jobs right now. When customers in your cooperative cluster place a booking, jobs are directly allocated to your queue.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight font-outfit">Assigned Jobs Queue</h2>
          <p className="text-xs text-slate-500 font-secondary">
            Work orders directly allocated to your schedule by the cooperative dispatch engine
          </p>
        </div>
        <Badge variant="primary" className="font-bold">
          {gigs.length} {gigs.length === 1 ? 'Job Assigned' : 'Jobs Assigned'}
        </Badge>
      </div>

      <div className="space-y-3.5">
        {gigs.map((gig) => {
          const isEmergency = Boolean(gig.isEmergency);
          const basePrice = Number(gig.basePrice || 250);
          const distanceKm = gig.distanceKm || 1.4;
          const etaMins = gig.etaMins || 12;

          return (
            <Card 
              key={gig.id}
              className={`p-5 transition-all duration-200 hover:shadow-md border ${
                isEmergency 
                  ? 'border-amber-300 bg-amber-50/30 ring-1 ring-amber-200' 
                  : 'border-slate-200/80 bg-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                
                {/* Left details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isEmergency ? (
                      <Badge variant="warning" className="bg-amber-100 text-amber-900 border-amber-300 font-bold gap-1 text-[10px] animate-pulse">
                        <Flame className="w-3 h-3 text-amber-600 fill-amber-600" />
                        <span>EMERGENCY DISPATCH (+₹100 SURCHARGE)</span>
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-semibold text-[10px]">
                        Standard Booking
                      </Badge>
                    )}

                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-xs font-semibold text-slate-500">
                      {gig.bookingCode || 'BK-2026'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 font-display">
                    {gig.serviceTitle || gig.service?.name || 'Artisan Service'}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-1">
                    {gig.description || 'Customer reported urgent electrical inspection needed.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1F4072]" />
                      <span>{gig.address || 'Madhyamgram, Kolkata'}</span>
                      <strong className="text-emerald-700">({distanceKm} km)</strong>
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>ETA ~{etaMins} mins</span>
                    </span>
                  </div>
                </div>

                {/* Right: Tariff & Action buttons */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Estimated 85% Pay
                    </span>
                    <span className="text-lg font-extrabold text-emerald-600">
                      ₹{Math.round(basePrice * 0.85)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Tariff: ₹{basePrice}</span>
                  </div>

                  <div className="flex items-center gap-2 w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRejectGig?.(gig)}
                      disabled={isSubmitting}
                      className="h-9 px-3 text-rose-600 hover:bg-rose-50 border-rose-200 text-xs cursor-pointer font-medium"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      <span>Reject Job</span>
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onSelectGig?.(gig)}
                      disabled={isSubmitting}
                      className="h-9 px-3.5 font-bold bg-[#1F4072] hover:bg-[#163056] text-xs cursor-pointer"
                    >
                      <span>Work on Job</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>

              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
