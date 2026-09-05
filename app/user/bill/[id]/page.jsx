'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ShieldCheck, Heart, ArrowRight, Receipt, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TopHeaderBanner } from '@/components/ui/top-header-banner';
import { INITIAL_BOOKING, COOP_WORKERS } from '@/lib/data';

export default function UserBillPage() {
  const params = useParams();
  const rawId = params?.id;
  const decodedId = rawId ? decodeURIComponent(rawId) : '';

  const [booking, setBooking] = useState(INITIAL_BOOKING);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      setIsLoading(true);
      let found = null;

      if (decodedId) {
        try {
          const res = await fetch(`/api/bookings/${decodedId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) found = data.data;
          }
        } catch (e) {}
      }

      if (!found && typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('a2zee_user_bookings');
          if (saved) {
            const list = JSON.parse(saved);
            if (Array.isArray(list)) {
              found = list.find(b => b.id === decodedId || b.bookingCode === decodedId);
            }
          }
        } catch (e) {}
      }

      if (found) {
        const workerObj = found.worker || COOP_WORKERS[1];
        setBooking({
          ...found,
          worker: {
            ...workerObj,
            name: workerObj.name || 'Ramesh Kumar',
            society: typeof workerObj.cooperative === 'string'
              ? workerObj.cooperative
              : workerObj.cooperative?.name || workerObj.society || 'TECB Cooperative Organisation (Ward 14)',
          }
        });
      }
      setIsLoading(false);
    }
    loadBooking();
  }, [decodedId]);

  const isEmergency = Boolean(
    booking?.isEmergency || 
    booking?.jobType === 'Instant' || 
    booking?.type === 'Emergency'
  );

  const serviceFee = Number(booking.basePrice || 250.00);
  const emergencyFee = isEmergency ? 100.00 : 0.00;
  const extraTimeFee = Number(booking.additionalPrice || booking.extraAmount || 0);

  const [selectedTip, setSelectedTip] = useState(0);
  const [isPaid, setIsPaid] = useState(
    booking.paymentStatus === 'PAID' || 
    booking.paymentStatus === 'SUCCESS' || 
    booking.payment?.paymentStatus === 'SUCCESS'
  );
  const [isPaying, setIsPaying] = useState(false);
  const [mockTxnId, setMockTxnId] = useState(booking.payment?.razorpayPaymentId || '');

  const tipOptions = [0, 10, 20, 50];
  const finalTotal = serviceFee + emergencyFee + extraTimeFee + selectedTip;

  // 85-10-5 Cooperative Split calculation
  const totalLabor = serviceFee + emergencyFee + extraTimeFee;
  const workerPayout = Math.round((totalLabor * 0.85 + selectedTip) * 100) / 100;
  const societyFund = Math.round(totalLabor * 0.10 * 100) / 100;
  const welfareDeposit = Math.round(totalLabor * 0.05 * 100) / 100;

  const handleProceedToPayment = async () => {
    setIsPaying(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/mock-pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipGratitude: selectedTip }),
      });
      const data = await res.json();
      const generatedTxn = data?.data?.razorpayPaymentId || data?.data?.transactionId || `TXN_${Date.now()}`;
      setIsPaid(true);
      setMockTxnId(generatedTxn);

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
      setIsPaid(true);
      setMockTxnId(fallbackTxn);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF6F0] font-secondary text-slate-900 pb-28">
      
      {/* Top Header */}
      <TopHeaderBanner
        title="INVOICE & SETTLEMENT"
        subtitle={`Booking Code: #${booking.bookingCode || booking.id}`}
        backHref={`/user/track/${encodeURIComponent(booking.id)}`}
        rightAction={
          <Badge variant={isPaid ? 'success' : 'warning'} className="text-xs px-3 py-1 font-semibold">
            {isPaid ? 'PAID' : 'PAYMENT PENDING'}
          </Badge>
        }
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Invoice Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-6">
        
        {/* Service Title & Artisan Info */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="space-y-0.5">
            <h3 className="font-bold text-base text-slate-900">{booking.serviceTitle}</h3>
            <p className="text-xs text-slate-500">{booking.customerAddress}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-900 block">{booking.worker?.name || 'Assigned Artisan'}</span>
            <span className="text-[11px] text-[#1F4072] font-medium">
              {(typeof booking.worker?.society === 'string' ? booking.worker.society : 'Labour Cooperative').split(' ')[0]} Co-op
            </span>
          </div>
        </div>

        {/* Itemized Line Items */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center text-slate-600">
            <span>Base Service Labor Fee</span>
            <span className="font-semibold text-slate-900">₹{serviceFee.toFixed(2)}</span>
          </div>

          {emergencyFee > 0 && (
            <div className="flex justify-between items-center text-amber-700">
              <span>Emergency Fast-Track Dispatch</span>
              <span className="font-semibold">+₹{emergencyFee.toFixed(2)}</span>
            </div>
          )}

          {extraTimeFee > 0 && (
            <div className="flex justify-between items-center text-slate-600">
              <div className="flex items-center gap-1.5">
                <span>Extra Time / Materials</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">Overrun</span>
              </div>
              <span className="font-semibold text-slate-900">+₹{extraTimeFee.toFixed(2)}</span>
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
              <span className="text-[11px] text-slate-400">Taxes & Cooperative Fees Included</span>
            </div>
            <span className="font-extrabold text-2xl text-[#1F4072]">₹{finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Gratitude Corner (Tip Selector) */}
        {!isPaid && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Gratitude Corner • Tip your artisan</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {tipOptions.map((tip) => (
                <button
                  key={tip}
                  type="button"
                  onClick={() => setSelectedTip(tip)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

        {/* Action Button */}
        {!isPaid ? (
          <Button
            size="lg"
            className="w-full shadow-xs"
            disabled={isPaying}
            onClick={handleProceedToPayment}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            <span>{isPaying ? 'Settling Payment...' : `Proceed to Payment • ₹${finalTotal.toFixed(2)}`}</span>
          </Button>
        ) : (
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Payment Successful & Settled</p>
                <p className="text-xs text-emerald-700">Reference: <strong>{mockTxnId}</strong></p>
              </div>
            </div>

            {/* 85-10-5 Split Ledger Card */}
            <div className="p-3 bg-white rounded-lg border border-emerald-200/60 text-xs space-y-1.5">
              <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                Cooperative 85-10-5 Split Ledger
              </span>
              <div className="flex justify-between text-slate-600">
                <span>Worker Take-Home (85% + Tip):</span>
                <strong className="text-slate-900">₹{workerPayout.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Primary Society Operations (10%):</span>
                <strong className="text-slate-900">₹{societyFund.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Social Security & PMSBY Trust (5%):</span>
                <strong className="text-slate-900">₹{welfareDeposit.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
