'use client';

import React from 'react';
import { 
  ArrowLeft, Check, Clock, User, Phone, MapPin, 
  ShieldCheck, Receipt, Sparkles, Building2, Wrench, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function BookingDetailModal({
  booking,
  isOpen,
  onClose,
}) {
  if (!isOpen || !booking) return null;

  const isCompleted = booking.status === 'COMPLETED' || booking.status === 'DONE';
  const isInProgress = booking.status === 'IN_PROGRESS';
  const isPending = booking.status === 'PENDING';
  const isAssigned = booking.status === 'ACCEPTED' || Boolean(booking.workerName);
  const isPaid = booking.paymentStatus === 'PAID' || booking.paymentStatus === 'SUCCESS';

  // Determine active step index (0 to 4) based on booking lifecycle
  let activeIndex = 0;
  if (isCompleted) {
    activeIndex = 4;
  } else if (isInProgress) {
    activeIndex = 3;
  } else if (isPending && isAssigned) {
    activeIndex = 2;
  } else if (isAssigned) {
    activeIndex = 1;
  } else {
    activeIndex = 0;
  }

  // Format timestamps
  const bookingDateObj = booking.date ? new Date(booking.date) : new Date();
  const timeStr = bookingDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const scheduledTimeStr = booking.scheduledStartTime 
    ? new Date(booking.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '10:30 AM';

  // The 5-step vertical progression matching Image 2
  const timelineSteps = [
    {
      id: 'placed',
      time: timeStr || '10:11 AM',
      title: 'Order Placed',
      description: `Your gig request #${booking.bookingCode || booking.id.slice(0, 8)} was created and queued for cooperative dispatch.`,
    },
    {
      id: 'assigned',
      time: scheduledTimeStr || '10:30 AM',
      title: 'Artisan Assigned',
      description: `${booking.workerName || 'Assigned Artisan'} from ${booking.cooperative || 'Labour Cooperative Society'} accepted this gig.`,
    },
    {
      id: 'pending',
      time: 'ETA ~12m',
      title: 'Pending Arrival',
      description: 'Artisan equipped with cooperative toolkits is en-route to the customer location.',
    },
    {
      id: 'in_progress',
      time: 'Live',
      title: 'Work In Progress',
      description: 'Artisan has started on-site work and diagnostic inspection.',
    },
    {
      id: 'completed',
      time: isCompleted ? 'Concluded' : 'Upcoming',
      title: isCompleted ? (isPaid ? 'Completed & Paid' : 'Completed & Billed') : 'Work Completed',
      description: isCompleted 
        ? 'Service successfully fulfilled and settled under 85-10-5 cooperative partitioning.' 
        : 'Final bill verified and approved by customer upon satisfactory completion.',
    },
  ];

  // Financial calculations
  const basePrice = Number(booking.basePrice || 250.00);
  const emergencyFee = booking.isEmergency ? 100.00 : 0.00;
  const extraChargesList = Array.isArray(booking.extraCharges) && booking.extraCharges.length > 0
    ? booking.extraCharges
    : (Number(booking.additionalPrice || booking.extraAmount || 0) > 0
        ? [{ id: 'chg_1', reason: booking.extraChargeReason || 'Mid-Work Adjustments', amount: Number(booking.additionalPrice || booking.extraAmount) }]
        : []);
  const tipGratitude = Number(booking.tipGratitude || 0);
  const finalPrice = Number(booking.finalPrice || (basePrice + emergencyFee + extraChargesList.reduce((s, c) => s + Number(c.amount || 0), 0) + tipGratitude));
  const workerPayout85 = Math.round((finalPrice * 0.85) * 100) / 100;
  const societyOps10 = Math.round((finalPrice * 0.10) * 100) / 100;
  const welfareTrust5 = Math.round((finalPrice * 0.05) * 100) / 100;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl  shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 font-secondary">
        
        {/* Scheme Navy Header Banner matching Image 2 */}
        <div className="bg-[#1F4072] text-white px-5 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-9 h-9 rounded-full text-white hover:bg-white/20 cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </Button>

          <div className="text-center">
            <h2 className="text-base sm:text-lg font-bold font-outfit tracking-tight">
              Order details
            </h2>
            <span className="text-[11px] text-blue-100 font-mono block">
              {booking.bookingCode || `#${booking.id.slice(0, 8)}`}
            </span>
          </div>

          <div className="w-9" />
        </div>

        {/* Scrollable Timeline & Summary Content */}
        <div className="overflow-y-auto px-5 py-6 space-y-6 flex-1 scrollbar-none">
          
          {/* Vertical Step Timeline from Image 2 */}
          <div className="space-y-6 py-2">
            {timelineSteps.map((step, idx) => {
              const isPassed = idx <= activeIndex;
              const isLast = idx === timelineSteps.length - 1;
              const isCurrent = idx === activeIndex;

              return (
                <div key={step.id} className="flex items-start gap-3.5 sm:gap-4 relative">
                  
                  {/* Left Column: Timestamp
                  <div className="w-16 sm:w-20 text-right shrink-0 pt-0.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 block font-outfit">
                      {step.time}
                    </span>
                  </div> */}

                  {/* Middle Column: Connected Circle Node with Vertical Line */}
                  <div className="flex flex-col items-center shrink-0 relative self-stretch">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs ${
                      isPassed 
                        ? 'bg-[#1F4072] text-white ring-4 ring-blue-50' 
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      {isPassed ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      )}
                    </div>
                    
                    {!isLast && (
                      <div className={`w-0.5 flex-1 my-1.5 transition-colors ${
                        idx < activeIndex ? 'bg-[#1F4072]' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>

                  {/* Right Column: Title & Description */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                        {step.title}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] bg-blue-50 text-[#1F4072] border border-blue-200 font-bold px-2 py-0.5 rounded-full">
                          Current Stage
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Bottom Card matching Image 2 Description Card */}
          <div className="bg-[#1F4072] text-white rounded-3xl p-5 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100 block">
              Description & Settlement
            </span>

            {/* Service Item & Price Pill */}
            <div className="flex items-center justify-between gap-3 bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs border border-white/15">
              <div className="flex items-center gap-3 min-w-0">
                {/* <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs">
                  <Wrench className="w-6 h-6 text-[#1F4072]" />
                </div> */}
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">
                    {booking.service || 'Cooperative Artisan Service'}
                  </h4>
                  <span className="text-xs text-blue-100 block">
                    {booking.trade || 'General Trade'} • {booking.isEmergency ? 'Emergency' : 'Scheduled'}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-base font-extrabold text-white block">
                  ₹{finalPrice.toFixed(2)}
                </span>
                <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-0.5 ${
                  isPaid ? 'bg-white text-[#1F4072]' : 'bg-amber-400 text-slate-900'
                }`}>
                  {isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Itemized Extra Charges & Tip Breakdown */}
            {(extraChargesList.length > 0 || tipGratitude > 0) && (
              <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs border border-white/15 space-y-1.5 text-xs text-white">
                <span className="text-[10px] text-blue-200 font-bold uppercase block tracking-wider">
                  Bill Breakdown & Extra Adjustments
                </span>
                <div className="flex justify-between text-blue-100">
                  <span>Base Tariff:</span>
                  <span>₹{basePrice.toFixed(2)}</span>
                </div>
                {emergencyFee > 0 && (
                  <div className="flex justify-between text-amber-300">
                    <span>Emergency Surcharge:</span>
                    <span>+₹{emergencyFee.toFixed(2)}</span>
                  </div>
                )}
                {extraChargesList.map((chg, idx) => (
                  <div key={chg.id || idx} className="flex justify-between text-indigo-200">
                    <span>Extra: {chg.reason || `Charge #${idx + 1}`}</span>
                    <span className="font-bold">+₹{Number(chg.amount || 0).toFixed(2)}</span>
                  </div>
                ))}
                {tipGratitude > 0 && (
                  <div className="flex justify-between text-emerald-300">
                    <span>Gratitude Tip:</span>
                    <span className="font-bold">+₹{tipGratitude.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Itemized 85-10-5 Split Ledger */}
            <div className="bg-white text-slate-900 rounded-2xl p-4 space-y-2 text-xs border border-blue-100">
              <div className="flex items-center justify-between font-bold border-b border-slate-100 pb-2">
                <span className="text-[11px] uppercase tracking-wider text-[#1F4072]">
                  Cooperative 85-10-5 Distribution
                </span>
                
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Worker Take-Home (85%):</span>
                <strong className="text-slate-900 font-extrabold">₹{workerPayout85.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Primary Society Operations (10%):</span>
                <strong className="text-slate-900 font-extrabold">₹{societyOps10.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Social Security & PMSBY Trust (5%):</span>
                <strong className="text-slate-900 font-extrabold">₹{welfareTrust5.toFixed(2)}</strong>
              </div>
            </div>

            {/* Customer & Assigned Artisan Info */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs border border-white/15">
                <span className="text-[10px] text-blue-100 font-bold block uppercase">Customer</span>
                <p className="font-bold text-white text-xs mt-0.5 truncate">{booking.customerName || 'Customer'}</p>
                <p className="text-[11px] text-blue-100 mt-1 truncate">{booking.address || 'Kolkata, WB'}</p>
              </div>

              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs border border-white/15">
                <span className="text-[10px] text-blue-100 font-bold block uppercase">Artisan</span>
                <p className="font-bold text-white text-xs mt-0.5 truncate">{booking.workerName || 'Assigned Karigar'}</p>
                <p className="text-[11px] text-blue-100 mt-1 truncate">{booking.cooperative || 'Pragati Coop'}</p>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Bottom Close Action */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-2xl font-bold text-xs cursor-pointer hover:bg-slate-50"
            onClick={onClose}
          >
            Close Details
          </Button>
        </div>

      </div>
    </div>
  );
}

export default BookingDetailModal;
