'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  CreditCard,
  Check,
  Receipt,
  Heart,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TopHeaderBanner } from '@/components/ui/top-header-banner';
import { GoogleArtisanPathMap } from '@/components/user/GoogleArtisanPathMap';
import { INITIAL_BOOKING, COOP_WORKERS } from '@/lib/data';

export default function TrackExpertPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const decodedId = rawId ? decodeURIComponent(rawId) : '';

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [actionNotice, setActionNotice] = useState('');
  const [selectedTip, setSelectedTip] = useState(0);
  const [mockTxnId, setMockTxnId] = useState('');

  // 1. Fetch live booking from DB with localStorage fallback
  const fetchLiveBooking = useCallback(async () => {
    let foundBooking = null;

    if (decodedId) {
      try {
        const res = await fetch(`/api/bookings/${decodedId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            foundBooking = json.data;
          }
        }
      } catch (err) {
        console.warn('Could not fetch booking from API:', err);
      }
    }

    if (!foundBooking && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('a2zee_user_bookings');
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            foundBooking = list.find(
              (b) => b.id === decodedId || b.bookingCode === decodedId
            );
          }
        }
      } catch (err) {
        console.warn('Could not parse localStorage bookings:', err);
      }
    }

    if (!foundBooking) {
      if (decodedId && decodedId !== INITIAL_BOOKING.id && decodedId !== INITIAL_BOOKING.bookingCode) {
        foundBooking = {
          ...INITIAL_BOOKING,
          id: decodedId,
          bookingCode: decodedId.startsWith('A2Z') ? decodedId : `A2Z-${decodedId.slice(-6).toUpperCase()}`,
        };
      } else {
        foundBooking = INITIAL_BOOKING;
      }
    }

    const workerObj = foundBooking.worker || COOP_WORKERS[1];
    const normalizedBooking = {
      ...foundBooking,
      worker: {
        id: workerObj.id || 'w_default',
        name: workerObj.name || workerObj.workerName || 'Ramesh Kumar',
        phone: workerObj.phone || '+91 98300 44556',
        rating: workerObj.rating || 4.9,
        society: typeof workerObj.cooperative === 'string' 
          ? workerObj.cooperative 
          : workerObj.cooperative?.name || workerObj.society || 'TECB Cooperative Organisation (Ward 14)',
        ncctTier: workerObj.ncctTier || 'NCCT Certified Artisan (Level 2)',
        distance: workerObj.distance || '1.4 km',
        etaMinutes: workerObj.etaMinutes || (foundBooking.isEmergency ? 12 : 25),
        initials: workerObj.initials || (workerObj.name ? workerObj.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'RK'),
        totalJobs: workerObj.totalJobs || 248,
      }
    };

    if (foundBooking.payment?.razorpayPaymentId) {
      setMockTxnId(foundBooking.payment.razorpayPaymentId);
    } else if (foundBooking.mockTxnId) {
      setMockTxnId(foundBooking.mockTxnId);
    }

    setBooking(normalizedBooking);
    setIsLoading(false);
  }, [decodedId]);

  useEffect(() => {
    fetchLiveBooking();
    // Live polling every 6 seconds to synchronize service progress with the DB
    const interval = setInterval(fetchLiveBooking, 6000);
    return () => clearInterval(interval);
  }, [fetchLiveBooking]);

  // 2. Pricing Calculations (100% unified with DB & bill)
  const isEmergency = Boolean(
    booking?.isEmergency || 
    booking?.jobType === 'Instant' || 
    booking?.type === 'Emergency'
  );

  const basePrice = Number(booking?.basePrice || 250);
  const emergencyFee = isEmergency ? 100 : 0;
  const extraPrice = Number(booking?.additionalPrice || booking?.extraAmount || 0);
  const subtotal = Number(booking?.finalPrice) || (basePrice + emergencyFee + extraPrice);
  const totalPayable = subtotal + selectedTip;

  const isPaid = Boolean(
    booking?.paymentStatus === 'PAID' || 
    booking?.paymentStatus === 'SUCCESS' ||
    booking?.payment?.paymentStatus === 'SUCCESS'
  );

  // 3. Advance / update service progress directly in the DB
  const handleUpdateStatusInDb = async (newStatus) => {
    if (!booking) return;
    setIsUpdatingStatus(true);
    setActionNotice('');

    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice(`Service status updated to ${newStatus}.`);
        const updatedBooking = { ...booking, status: newStatus };
        setBooking(updatedBooking);

        // Sync with local cache
        if (typeof window !== 'undefined') {
          try {
            const saved = JSON.parse(localStorage.getItem('a2zee_user_bookings') || '[]');
            const updatedList = saved.map(b => (b.id === booking.id || b.bookingCode === booking.id) ? { ...b, status: newStatus } : b);
            localStorage.setItem('a2zee_user_bookings', JSON.stringify(updatedList));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Failed to update status in DB:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 4. Register mock payment stored as PAID in DB and localStorage
  const handleRegisterMockPayment = async () => {
    if (!booking) return;
    setIsPaying(true);
    setActionNotice('');

    try {
      const res = await fetch(`/api/bookings/${booking.id}/mock-pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipGratitude: selectedTip }),
      });

      const data = await res.json();
      const generatedTxn = data?.data?.razorpayPaymentId || data?.data?.transactionId || `TXN_${Date.now()}`;
      setMockTxnId(generatedTxn);

      const updatedBooking = {
        ...booking,
        paymentStatus: 'PAID',
        status: 'COMPLETED',
        mockTxnId: generatedTxn,
        paidAmount: totalPayable,
      };
      setBooking(updatedBooking);
      setActionNotice('Payment settled successfully! Your booking is now fully completed.');

      // Sync local storage so it instantly reflects everywhere
      if (typeof window !== 'undefined') {
        try {
          const saved = JSON.parse(localStorage.getItem('a2zee_user_bookings') || '[]');
          const updatedList = saved.map(b => 
            (b.id === booking.id || b.bookingCode === booking.id) 
              ? { ...b, paymentStatus: 'PAID', status: 'COMPLETED', mockTxnId: generatedTxn } 
              : b
          );
          localStorage.setItem('a2zee_user_bookings', JSON.stringify(updatedList));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Payment error:', err);
      const fallbackTxn = `TXN_MOCK_${Math.floor(10000000 + Math.random() * 90000000)}`;
      setMockTxnId(fallbackTxn);
      setBooking(prev => ({ ...prev, paymentStatus: 'PAID', status: 'COMPLETED', mockTxnId: fallbackTxn }));
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading || !booking) {
    return (
      <div className="min-h-screen bg-[#FFF6F0] flex flex-col items-center justify-center p-6 space-y-4 font-secondary">
        <div className="w-10 h-10 border-4 border-[#1F4072] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-600 font-medium">Loading live booking & route details...</p>
      </div>
    );
  }

  const worker = booking.worker;
  const rawStatus = (booking.status || '').toUpperCase();
  let statusLabel = 'Pending';
  let statusBadgeVariant = 'warning';
  let timelineStep = 1;

  if (rawStatus === 'COMPLETED' || rawStatus === 'DONE') {
    statusLabel = 'Done';
    statusBadgeVariant = 'success';
    timelineStep = 5;
  } else if (rawStatus === 'IN_PROGRESS') {
    statusLabel = 'In Progress';
    statusBadgeVariant = 'primary';
    timelineStep = 4;
  } else if (rawStatus === 'ACCEPTED' || rawStatus === 'ASSIGNED') {
    statusLabel = 'Assigned';
    statusBadgeVariant = 'primary';
    timelineStep = 2;
  }

  const jobDesc = booking.customJobDescription || 
    booking.description || 
    booking.serviceTitle || 
    booking.title || 
    'General Household Repair Service';

  const steps = [
    { title: 'Booked', desc: 'Confirmed', statusKey: 'PENDING' },
    { title: 'Assigned', desc: 'Matched', statusKey: 'ACCEPTED' },
    { title: 'En Route', desc: 'On way', statusKey: 'IN_PROGRESS' },
    { title: 'In Progress', desc: 'Ongoing', statusKey: 'IN_PROGRESS' },
    { title: 'Done', desc: 'Completed', statusKey: 'COMPLETED' },
  ];

  const tipOptions = [0, 10, 20, 50];

  return (
    <div className="min-h-screen bg-[#FFF6F0] font-secondary text-slate-900 pb-28">
      
      {/* Reusable Curved Top Header Banner */}
      <TopHeaderBanner
        title="LIVE ARTISAN TRACKING"
        subtitle={`Ref: #${booking.bookingCode || booking.id}`}
        onBack={() => router.push('/user')}
        
      />

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 pt-6 space-y-6">

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm p-3.5 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-150">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {actionNotice}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActionNotice('')}
              className="text-xs h-auto p-1 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Top Summary Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-row items-center gap-2">
            <Badge 
              variant={isEmergency ? 'danger' : 'secondary'}
              className="text-xs font-semibold px-3 py-1"
            >
              {isEmergency ? 'Emergency' : 'Standard'}
            </Badge>

            <Badge 
              variant={statusBadgeVariant}
              className="text-xs font-semibold px-3 py-1 flex items-center gap-1.5"
            >
              {statusLabel === 'In Progress' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F4072] animate-ping" />
              )}
              {statusLabel}
            </Badge>

            <Badge 
              variant={isPaid ? 'success' : 'warning'}
              className="text-xs font-semibold px-3 py-1"
            >
              {isPaid ? 'Paid' : 'Unpaid'}
            </Badge>
          </div>

          <div className="flex flex-col justify-center items-center ">
            <span className="text-[10px] text-gray-400 block uppercase font-medium">Payable Amount</span>
            <span className="text-lg font-bold text-[#1F4072]">₹{totalPayable.toFixed(2)}</span>
          </div>
        </div>

        {/* Visual 5-Step Service Progress Timeline */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Service Progress</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            
            {/* Simulation Status Controls */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdatingStatus}
                onClick={() => handleUpdateStatusInDb('IN_PROGRESS')}
                className="text-[11px] h-7 px-2 rounded-lg cursor-pointer"
              >
                In Progress
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdatingStatus}
                onClick={() => handleUpdateStatusInDb('COMPLETED')}
                className="text-[11px] h-7 px-2 rounded-lg text-emerald-700 border-emerald-200 hover:bg-emerald-50 cursor-pointer"
              >
                Completed
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 relative pt-1">
            {steps.map((step, idx) => {
              const stepNum = idx + 1;
              const isPassed = stepNum <= timelineStep;
              const isCurrent = stepNum === timelineStep;

              return (
                <div key={step.title} className="text-center space-y-1.5">
                  <div 
                    className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#1F4072] text-white ring-4 ring-[#1F4072]/20 shadow-md'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isPassed && !isCurrent ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      stepNum
                    )}
                  </div>
                  <div>
                    <p className={`text-[11px] sm:text-xs font-semibold ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.title}
                    </p>
                    <p className="text-[10px] text-slate-400 hidden sm:block">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simplified Google Maps View with Direct Call Button */}
        <GoogleArtisanPathMap
          artisan={worker}
          customerCoords={{ lat: 22.6950, lng: 88.4550 }}
          artisanCoords={{ lat: 22.7010, lng: 88.4620 }}
          destinationAddress={booking.customerAddress || booking.address || 'Madhyamgram, Kolkata'}
          status={booking.status}
          etaMinutes={worker.etaMinutes || 12}
        />

        {/* Job Scope Card */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Job Description & Scope
            </h3>
            
          </div>

          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-normal">
            {jobDesc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium uppercase text-[10px] block">Service Location</span>
              <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1F4072] flex-shrink-0" />
                <span className="truncate">{booking.address || booking.customerAddress || 'Madhyamgram, Kolkata'}</span>
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium uppercase text-[10px] block">Scheduled Slot</span>
              <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#1F4072] flex-shrink-0" />
                <span>{booking.scheduledTime || (isEmergency ? 'Immediate Dispatch' : 'Today, Standard Hours')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Embedded Official Invoice & Settlement Bill (No separate page needed) */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs p-6 space-y-5">
          
          {/* Bill Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1F4072]/10 text-[#1F4072] flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Official Invoice & Settlement</h3>
                <p className="text-xs text-slate-500">Booking Code: #{booking.bookingCode || booking.id}</p>
              </div>
            </div>

            <Badge variant={isPaid ? 'success' : 'warning'} className="text-xs px-3 py-1 font-semibold">
              {isPaid ? 'PAID' : 'PENDING'}
            </Badge>
          </div>

          {/* Itemized Line Items */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center text-slate-600">
              <span>Base Service Labor Fee</span>
              <span className="font-semibold text-slate-900">₹{basePrice.toFixed(2)}</span>
            </div>

            {emergencyFee > 0 && (
              <div className="flex justify-between items-center text-amber-700">
                <span>Emergency Fast-Track Dispatch</span>
                <span className="font-semibold">+₹{emergencyFee.toFixed(2)}</span>
              </div>
            )}

            {extraPrice > 0 && (
              <div className="flex justify-between items-center text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span>Additional Work / Materials</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">Overrun</span>
                </div>
                <span className="font-semibold text-slate-900">+₹{extraPrice.toFixed(2)}</span>
              </div>
            )}

            {selectedTip > 0 && (
              <div className="flex justify-between items-center text-emerald-600">
                <span>Gratitude Tip (100% to artisan)</span>
                <span className="font-semibold">+₹{selectedTip.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-base">
              <div>
                <span className="font-bold text-slate-900 block">Total Payable</span>
                <span className="text-[11px] text-slate-400">Taxes & Cooperative Fee Included</span>
              </div>
              <span className="font-extrabold text-2xl text-[#1F4072]">
                ₹{totalPayable.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Gratitude Corner (Tip Selector) when unpaid */}
          {!isPaid && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Gratitude Corner • Tip your artisan (optional)</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {tipOptions.map((tip) => (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => setSelectedTip(tip)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedTip === tip
                        ? 'bg-[#1F4072] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {tip === 0 ? 'No tip' : `₹${tip}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Action or Success Confirmation */}
          {!isPaid ? (
            <Button
              size="lg"
              disabled={isPaying}
              onClick={handleRegisterMockPayment}
              className="w-full shadow-md bg-[#1F4072] hover:bg-[#18345c] text-white rounded-2xl font-bold text-sm py-6 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              <span>{isPaying ? 'Settling Payment...' : `Proceed to Pay • ₹${totalPayable.toFixed(2)}`}</span>
            </Button>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Payment Successful & Settled</p>
                  <p className="text-xs text-emerald-700">
                    Transaction ID: <strong>{mockTxnId || `TXN_${Date.now()}`}</strong>
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-emerald-800 pt-1">
                Receipt recorded in your orders history. Thank you for supporting cooperative gig artisans!
              </p>
            </div>
          )}

        </div>

        {/* Back to Home Action */}
        <div className="pt-2 text-center">
          <Link href="/user">
            <Button 
              variant="outline" 
              className="rounded-2xl text-xs px-6 py-2.5 text-slate-600 border-slate-200 hover:bg-white cursor-pointer"
            >
              ← Return to Dashboard
            </Button>
          </Link>
        </div>

      </div>

    </div>
  );
}

