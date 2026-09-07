'use client';

import React from 'react';
import { 
  MapPin, Phone, ShieldCheck, Clock, AlertCircle, 
  CheckCircle2, Plus, XCircle, ArrowRight,
  Flame, Navigation, Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function WorkerActiveGigCard({
  booking,
  onOpenRejectModal,
  onOpenExtraChargesModal,
  onUpdateStatus,
  isSubmitting = false,
}) {
  if (!booking) {
    return (
      <Card className="p-8 text-center border-dashed border-2 border-slate-200">
        <div className="max-w-xs mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No Active Assignment</h3>
          <p className="text-xs text-slate-500">
            You currently have no active work assignments. Toggle availability to Online to receive instant emergency dispatch calls.
          </p>
        </div>
      </Card>
    );
  }

  const isPending = booking.status === 'PENDING';
  const isAccepted = booking.status === 'ACCEPTED';
  const isInProgress = booking.status === 'IN_PROGRESS';
  const isCompleted = booking.status === 'COMPLETED';

  const basePrice = Number(booking.basePrice || 250);
  const extraAmount = Number(booking.extraAmount || 0);
  const totalTariff = basePrice + extraAmount + 10; // platform surcharge
  const artisanShare = Math.round((basePrice + extraAmount) * 0.85);
  const welfareShare = Math.round((basePrice + extraAmount) * 0.05);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Work Assignment</h2>
          {booking.isEmergency && (
            <Badge variant="warning" className="bg-amber-100 text-amber-900 border-amber-300 gap-1 font-bold animate-pulse">
              <Flame className="w-3 h-3 text-amber-600 fill-amber-600" />
              <span>EMERGENCY DISPATCH</span>
            </Badge>
          )}
        </div>
        <Badge 
          variant={
            isPending ? 'warning' :
            isAccepted ? 'primary' :
            isInProgress ? 'default' : 'success'
          }
          className="font-bold px-3 py-1"
        >
          {booking.status}
        </Badge>
      </div>

      <Card className="overflow-hidden border-slate-200/90 shadow-sm">
        {/* Top Info Bar */}
        <div className="p-5 sm:p-6 space-y-4 border-b border-slate-100 bg-[#FFF6F0]/30">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Service Gig
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-xs font-bold text-[#1F4072]">
                  {booking.bookingCode || 'BK-2026-0891'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                {booking.serviceTitle || booking.service?.name || 'Ceiling Fan Repair & Fixing'}
              </h3>
              
              {/* Address with distance */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-0.5">
                <MapPin className="w-4 h-4 text-[#1F4072] shrink-0" />
                <span>{booking.customerAddress || booking.address || 'Flat 402, Madhyamgram, Kolkata'}</span>
                <span className="text-emerald-600 font-semibold">(~1.2 km away)</span>
              </div>
            </div>

            {/* Quick Customer Contact & ETA */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0">
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated ETA</span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>12 - 15 Mins</span>
                </span>
              </div>

              <a
                href={`tel:${booking.customerPhone || '+919830123456'}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F4072]/10 hover:bg-[#1F4072]/15 text-[#1F4072] text-xs font-bold transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Customer</span>
              </a>
            </div>
          </div>

          {/* Job Timeline Progression Indicator */}
          <div className="pt-2">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-xs font-bold">
              <div className={`py-1.5 px-1 rounded-lg transition-colors ${
                (!isInProgress && !isCompleted) ? 'bg-[#1F4072] text-white shadow-xs' : 'bg-emerald-100 text-emerald-800'
              }`}>
                1. Assigned
              </div>
              <div className={`py-1.5 px-1 rounded-lg transition-colors ${
                isInProgress ? 'bg-[#1F4072] text-white shadow-xs' :
                isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
              }`}>
                2. On-Site Work
              </div>
              <div className={`py-1.5 px-1 rounded-lg transition-colors ${
                isCompleted ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
              }`}>
                3. Completed
              </div>
            </div>
          </div>
        </div>

        {/* Action Decision Strip */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Phase 1: Assigned (Ready for On-Site Work or Reject) */}
          {!isInProgress && !isCompleted && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#E5EEFF] rounded-2xl border border-[#1F4072]/20">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#1F4072] flex items-center gap-1.5 font-outfit">
                  <Navigation className="w-4 h-4 text-[#1F4072]" />
                  <span>Job Assigned to You — Head to Customer Location</span>
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed font-secondary">
                  This work order is assigned to you. When you reach the customer location, click &apos;Start On-Site Work&apos;. If you cannot take this job, reject it to let the system reassign it to the next available artisan.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenRejectModal}
                  disabled={isSubmitting}
                  className="w-1/2 sm:w-auto text-rose-600 hover:bg-rose-50 border-rose-200 h-10 px-3.5 font-semibold text-xs"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  <span>Reject Job</span>
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onUpdateStatus('IN_PROGRESS')}
                  disabled={isSubmitting}
                  className="w-1/2 sm:w-auto h-10 px-4 font-bold bg-[#1F4072] hover:bg-[#163056] text-xs"
                >
                  <span>Start On-Site Work</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Phase 2: IN_PROGRESS - Complete Gig or Reject if Emergency */}
          {isInProgress && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 font-outfit">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>On-Site Work in Progress</span>
                </span>
                <p className="text-[11px] text-emerald-800 font-secondary">
                  Complete service inspection & repair. Add any extra labor hours or spare parts below before marking finished.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenRejectModal}
                  disabled={isSubmitting}
                  className="w-1/2 sm:w-auto text-rose-600 hover:bg-rose-50 border-rose-200 h-10 px-3 text-xs"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  <span>Reject Job</span>
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onUpdateStatus('COMPLETED')}
                  className="w-1/2 sm:w-auto h-10 px-5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 text-xs"
                >
                  <span>Mark Completed</span>
                  <CheckCircle2 className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Mid-Work Bill Adjustment Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Mid-Work Tariff Adjustments</span>
                  <Badge variant="primary" className="text-[10px]">Cooperative Direct Bill</Badge>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Logged directly to customer bill for unexpected complications, extra labor hours, or spare parts.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onOpenExtraChargesModal}
                disabled={isCompleted}
                className="shrink-0 h-9 border-[#1F4072]/30 text-[#1F4072] hover:bg-[#1F4072]/5"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>{booking.extraAmount > 0 ? 'Update Extra Charges' : 'Add Extra Charges'}</span>
              </Button>
            </div>

            {/* Price Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-white rounded-xl border border-slate-200/70 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-medium uppercase">Base Tariff</span>
                <span className="font-bold text-slate-900 text-sm font-outfit">₹{basePrice.toFixed(2)}</span>
              </div>
              
              <div>
                <span className="text-slate-400 block text-[10px] font-medium uppercase">Added Extra</span>
                <span className={`font-bold text-sm font-outfit ${extraAmount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {extraAmount > 0 ? `+₹${extraAmount.toFixed(2)}` : '₹0.00'}
                </span>
                {booking.extraChargeReason && (
                  <span className="text-[10px] text-slate-500 block truncate">
                    {booking.extraChargeReason}
                  </span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-medium uppercase">85% Artisan Pay</span>
                <span className="font-bold text-emerald-600 text-sm font-outfit">₹{artisanShare.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 block">+5% Welfare Trust</span>
              </div>

              <div className="sm:border-l sm:pl-3 border-slate-200">
                <span className="text-slate-400 block text-[10px] font-medium uppercase">Est. Customer Bill</span>
                <span className="font-extrabold text-[#1F4072] text-sm sm:text-base font-outfit">
                  ₹{totalTariff.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </Card>
    </div>
  );
}
