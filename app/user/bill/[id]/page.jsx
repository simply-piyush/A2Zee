'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, Heart, ArrowRight, Receipt, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { INITIAL_BOOKING } from '@/lib/data';

export default function UserBillPage({ params }) {
  const booking = INITIAL_BOOKING;

  // Billing values matching Figma Frame 89:105
  const serviceFee = 250.00;
  const extraTimeFee = 15.00;
  const gst = 10.00;

  const [selectedTip, setSelectedTip] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [mockTxnId, setMockTxnId] = useState('');

  const tipOptions = [0, 5, 10, 20, 50];
  const finalTotal = serviceFee + extraTimeFee + gst + selectedTip;

  // 85-10-5 Cooperative Split calculation
  const totalLabor = serviceFee + extraTimeFee;
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
      if (data.success) {
        setIsPaid(true);
        setMockTxnId(data.data.transactionId);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setIsPaid(true);
      setMockTxnId(`TXN_MOCK_${Math.floor(10000000 + Math.random() * 90000000)}`);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-20">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/user">
            <Button variant="outline" size="icon" className="w-9 h-9 rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Invoice & Settlement</h1>
            <p className="text-xs text-slate-500">Booking Code: <strong>{booking.bookingCode}</strong></p>
          </div>
        </div>
        <Badge variant={isPaid ? 'success' : 'warning'}>
          {isPaid ? 'PAID' : 'PAYMENT PENDING'}
        </Badge>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        
        {/* Service Title & Artisan Info */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="space-y-0.5">
            <h3 className="font-bold text-base text-slate-900">{booking.serviceTitle}</h3>
            <p className="text-xs text-slate-500">{booking.customerAddress}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-900 block">{booking.worker.name}</span>
            <span className="text-[11px] text-[#1F4072] font-medium">{booking.worker.society.split(' ')[0]} Co-op</span>
          </div>
        </div>

        {/* Itemized Line Items */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center text-slate-600">
            <span>Base Service Fee</span>
            <span className="font-semibold text-slate-900">₹{serviceFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <div className="flex items-center gap-1.5">
              <span>Extra Time Fee</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">Overrun</span>
            </div>
            <span className="font-semibold text-slate-900">₹{extraTimeFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>GST Concession (5%)</span>
            <span className="font-semibold text-slate-900">₹{gst.toFixed(2)}</span>
          </div>

          {selectedTip > 0 && (
            <div className="flex justify-between items-center text-emerald-600">
              <span>Gratitude Tip (100% to artisan)</span>
              <span className="font-semibold">+₹{selectedTip.toFixed(2)}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-base">
            <span className="font-bold text-slate-900">Total Payable</span>
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
  );
}
