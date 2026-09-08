'use client';

import React, { useState } from 'react';
import {
  ArrowLeft, MapPin, Phone, ExternalLink, Flame,
  CheckCircle2, AlertCircle, XCircle, Clock, Plus, Receipt, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

const PRESET_EXTRA_AMOUNTS = [
  { value: '50', label: '₹50 — Minor adjustment / 15 mins extra' },
  { value: '100', label: '₹100 — Replacement washer / 30 mins labor' },
  { value: '150', label: '₹150 — Standard spare part / 45 mins' },
  { value: '200', label: '₹200 — Heavy capacitor / MCB unit' },
  { value: '300', label: '₹300 — Wiring extension / pipe rework' },
  { value: '500', label: '₹500 — Major overhaul hardware' },
];

const EXTRA_CHARGE_REASONS = [
  { value: 'EXTRA_TIME', label: 'Additional diagnostic & labor time' },
  { value: 'SPARE_PARTS', label: 'Replacement spare parts / hardware' },
  { value: 'COMPLEX_WIRING', label: 'Hidden wiring / pipe complications' },
  { value: 'EMERGENCY_ISOLATION', label: 'Hazardous isolation & safety fix' },
];

/**
 * WorkerJobDetailView Component
 * Dedicated full-view of an assigned job:
 * - Service Location with an 'Open in Google Maps' button
 * - Customer Name with Call icon/button underneath
 * - Bill & Tariff summary
 * - Add extra amount using Shadcn Select component
 * - Start On-Site Work, Complete, or Reject actions
 */
export function WorkerJobDetailView({
  booking,
  onBack,
  onOpenRejectModal,
  onAddExtraCharges,
  onUpdateStatus,
  isSubmitting = false,
}) {
  const [selectedExtraAmount, setSelectedExtraAmount] = useState('100');
  const [selectedReason, setSelectedReason] = useState('SPARE_PARTS');
  const [isAddingExtra, setIsAddingExtra] = useState(false);

  if (!booking) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">No job selected.</p>
        <Button onClick={onBack} variant="outline">Back to Jobs</Button>
      </div>
    );
  }

  const isEmergency = Boolean(booking.isEmergency);
  const isInProgress = booking.status === 'IN_PROGRESS';
  const isCompleted = booking.status === 'COMPLETED';

  const basePrice = Number(booking.basePrice || 250);
  const extraAmount = Number(booking.extraAmount || 0);
  const emergencySurcharge = isEmergency ? 100 : 0;
  const totalTariff = basePrice + extraAmount + emergencySurcharge;
  const artisanShare = Math.round((basePrice + extraAmount + emergencySurcharge) * 0.85);

  const address = booking.customerAddress || booking.address || 'Address on file';
  const customerName = booking.customerName || booking.customer?.fullName || 'Customer';
  const customerPhone = booking.customerPhone || booking.customer?.phone || '+919830123456';
  const serviceTitle = booking.serviceTitle || booking.service?.name || 'Assigned Household Service';
  const bookingCode = booking.bookingCode || 'BK-2026-0891';
  const scheduledTime = booking.scheduledTime || 'Today';

  const handleOpenGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleApplyExtra = (e) => {
    e.preventDefault();
    const reasonLabel = EXTRA_CHARGE_REASONS.find(r => r.value === selectedReason)?.label || 'On-site adjustments';
    onAddExtraCharges?.({
      extraAmount: parseFloat(selectedExtraAmount) || 0,
      reason: reasonLabel,
      extraTimeMinutes: 30,
    });
    setIsAddingExtra(false);
  };

  return (
    <div className="max-w-md md:max-w-3xl lg:max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4 pb-24 space-y-6">



      {/* Main Job Detail Card */}
      <Card className="overflow-hidden border-slate-200 shadow-sm bg-white rounded-3xl">

        {/* Title & Code Strip */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-[#FFF6F0]/40">


          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-outfit leading-snug">
            {serviceTitle}
          </h1>
          <div className="flex flex-col  justify-between items-start pt-2 text-xs font-mono text-slate-500 pb-1">

            <span className="font-secondary text-slate-600">Order ID: {bookingCode}</span>

            <span className="font-secondary text-slate-600">{scheduledTime}</span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">

          {/* 1. Service Location with Direct Google Maps Button */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-900 font-bold  uppercase tracking-wider font-outfit flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span className='text-slate-900'>Service Location</span>
              </span>

              {/* Direct Google Maps Action */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenGoogleMaps}
                className="h-8 px-3 rounded-xl border-[#1F4072]/30 text-[#1F4072] hover:bg-[#1F4072]/5 gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <span>Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div >
              <p className="text-sm text-slate-600 leading-relaxed font-secondary">
                {address}
              </p>
            </div>
          </div>

          {/* 2. Customer Information with Call Button Underneath */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-outfit flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-900" />
              <span>Customer Details</span>
            </span>

            <div className='flex justify-between'>
              <div>
                <h4 className="text-slate-600 font-outfit">
                  {customerName}
                </h4>

              </div>


              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`tel:${customerPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F4072] text-white hover:bg-[#162f55] active:scale-95 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  title={`Call ${customerName || 'Artisan'}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          </div>

          {/* 3. Bill & Bill Summary */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-outfit flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-slate-900" />
                <span>Bill & Earnings Summary</span>
              </span>


            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-2.5 text-xs font-secondary">
              <div className="flex justify-between text-slate-600">
                <span>Base Inspection Tariff</span>
                <span className="font-bold font-outfit text-slate-600">₹{basePrice.toFixed(2)}</span>
              </div>

              {isEmergency && (
                <div className="flex justify-between text-amber-800">
                  <span>Emergency Surcharge (+100)</span>
                  <span className="font-bold font-outfit text-amber-900">₹100.00</span>
                </div>
              )}

              {Array.isArray(booking.extraCharges) && booking.extraCharges.length > 0 ? (
                booking.extraCharges.map((chg, idx) => (
                  <div key={chg.id || idx} className="flex justify-between text-indigo-700">
                    <span>Mid-Work Extra: {chg.reason || `Charge #${idx + 1}`}</span>
                    <span className="flex flow:row font-bold font-outfit text-indigo-900">+₹{Number(chg.amount || 0).toFixed(2)}</span>
                  </div>
                ))
              ) : extraAmount > 0 ? (
                <div className="flex justify-between text-indigo-700">
                  <span>Mid-Work Extra Charges ({booking.extraChargeReason || 'Extra Labor/Parts'})</span>
                  <span className="font-bold font-outfit text-indigo-900">+₹{extraAmount.toFixed(2)}</span>
                </div>
              ) : null}

              <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-200 font-outfit">
                <span>Total Customer Billing</span>
                <span className="text-base text-[#1F4072]">₹{totalTariff.toFixed(2)}</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-emerald-800 font-outfit">
                <span className="font-bold">Your Net Payout (85%)</span>
                <span className="text-lg font-extrabold text-emerald-700">₹{artisanShare.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* 4. Option to Add Extra Amount using Select Component */}
          {!isCompleted && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-outfit">
                    Add Extra Charges to Bill
                  </h4>
                  
                </div>

                {!isAddingExtra && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingExtra(true)}
                    className="h-8 px-3 rounded-xl text-xs font-semibold text-[#1F4072] border-[#1F4072]/30 hover:bg-[#1F4072]/5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Add Extra</span>
                  </Button>
                )}
              </div>

              {isAddingExtra && (
                <form onSubmit={handleApplyExtra} className="p-4 rounded-2xl bg-white border-2 border-[#1F4072]/20 space-y-4 animate-in fade-in duration-150">

                  {/* Select Extra Amount */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block font-secondary">
                      Select Extra Amount (₹)
                    </label>
                    <Select value={selectedExtraAmount} onValueChange={setSelectedExtraAmount}>
                      <SelectTrigger className="py-2.5 rounded-xl border-slate-300">
                        <SelectValue placeholder="Choose amount" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRESET_EXTRA_AMOUNTS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Extra Reason */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block font-secondary">
                      Select Justification Reason
                    </label>
                    <Select value={selectedReason} onValueChange={setSelectedReason}>
                      <SelectTrigger className="py-2.5 rounded-xl border-slate-300">
                        <SelectValue placeholder="Choose reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXTRA_CHARGE_REASONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingExtra(false)}
                      className="text-xs h-9 px-3"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="default"
                      size="sm"
                      disabled={isSubmitting}
                      className="text-xs h-9 px-4 font-bold bg-[#1F4072] hover:bg-[#163056]"
                    >
                      <span>Apply to Customer Bill</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 5. Core Actions: Start Work, Mark Completed, Reject */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Reject button is only available before clicking Start On-Site Work */}
            {!isInProgress && !isCompleted ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenRejectModal?.(booking)}
                disabled={isSubmitting}
                className="w-full sm:w-auto h-11 px-4 text-rose-600 hover:bg-rose-50 border-rose-200 text-xs font-semibold rounded-xl cursor-pointer"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                <span>Reject Job (Reassign)</span>
              </Button>
            ) : <div className="hidden sm:block" />}

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {!isInProgress && !isCompleted && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => onUpdateStatus?.('IN_PROGRESS')}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-11 px-6 font-bold bg-[#1F4072] hover:bg-[#163056] rounded-xl text-xs cursor-pointer shadow-md"
                >
                  <span>Start On-Site Work</span>
                </Button>
              )}

              {isInProgress && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => onUpdateStatus?.('COMPLETED')}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-11 px-6 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  <span>Mark Job Completed</span>
                </Button>
              )}
            </div>
          </div>

        </div>
      </Card>
    </div>
  );
}

export default WorkerJobDetailView;
