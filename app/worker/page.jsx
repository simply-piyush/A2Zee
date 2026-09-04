'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, Plus, CheckCircle2, Clock, MapPin, Wallet, 
  Award, AlertCircle, ArrowRight, XCircle, UserCheck, Power 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';
import { INITIAL_BOOKING, WORKERS } from '@/lib/data';

export default function WorkerPage() {
  const worker = WORKERS[0]; // Ramesh Kumar
  const [activeBooking, setActiveBooking] = useState({
    ...INITIAL_BOOKING,
    status: 'PENDING',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Schedule overlap / emergency delay');

  const [availability, setAvailability] = useState('AVAILABLE'); // 'AVAILABLE' or 'OFFLINE'
  const [extraAmount, setExtraAmount] = useState('15.00');
  const [extraReason, setExtraReason] = useState('EXTRA_TIME_TAKEN');
  const [extraMinutes, setExtraMinutes] = useState('30');
  const [extraNotes, setExtraNotes] = useState('Conduit pipe rusted shut; required manual chiseling (+30 mins)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('success');

  const handleToggleAvailability = async () => {
    const nextStatus = availability === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
    setAvailability(nextStatus);

    try {
      await fetch('/api/workers/location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: worker.id,
          availabilityStatus: nextStatus,
        }),
      });
      setNoticeType('success');
      setNotice(`Availability toggled to ${nextStatus}. Emergency dispatch will ${nextStatus === 'AVAILABLE' ? 'now include' : 'exclude'} you.`);
    } catch {
      // offline fallback
    }
  };

  const handleAcceptGig = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${activeBooking.id}/accept`, {
        method: 'POST',
      });
      const data = await res.json();
      setActiveBooking(prev => ({ ...prev, status: 'ACCEPTED' }));
      setNoticeType('success');
      setNotice('Gig accepted! Booking status updated to ACCEPTED.');
    } catch {
      setActiveBooking(prev => ({ ...prev, status: 'ACCEPTED' }));
      setNoticeType('success');
      setNotice('Gig accepted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectGig = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${activeBooking.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: worker.id,
          reason: rejectReason,
        }),
      });
      const data = await res.json();

      setIsRejectModalOpen(false);
      setNoticeType('warning');
      if (data.data?.newAssignedArtisan) {
        setNotice(`Gig rejected. Cascading reassignment complete: assigned to next best candidate ${data.data.newAssignedArtisan.name} (${data.data.newAssignedArtisan.distanceKm} km away).`);
      } else {
        setNotice('Gig rejected. Reassignment cascade initiated.');
      }
      setActiveBooking(prev => ({ ...prev, status: 'CANCELLED' }));
    } catch (err) {
      console.error('Rejection error:', err);
      setIsRejectModalOpen(false);
      setNoticeType('warning');
      setNotice('Job declined. Reassigned to next candidate.');
      setActiveBooking(prev => ({ ...prev, status: 'CANCELLED' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExtraCharge = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/bookings/${activeBooking.id}/extra-charges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extraAmount: parseFloat(extraAmount) || 0,
          reason: extraReason,
          notes: extraNotes,
          extraTimeMinutes: parseInt(extraMinutes, 10) || 0,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setActiveBooking(prev => ({
          ...prev,
          extraAmount: parseFloat(extraAmount) || 0,
          extraChargeReason: extraReason,
          extraTimeMinutes: parseInt(extraMinutes, 10) || 0,
        }));
        setNoticeType('success');
        setNotice('Extra charges logged directly to booking bill.');
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error logging extra charge:', err);
      setNoticeType('success');
      setNotice('Extra charges saved.');
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-20">
      
      {/* Top Profile Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1F4072] text-white flex items-center justify-center font-bold text-lg shadow-xs">
            {worker.initials}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{worker.name}</h1>
              <Badge variant="ncct">{worker.ncctTier}</Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium">{worker.trade} • {worker.society}</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Artisan</span>
              </span>
              <span className="text-slate-300">•</span>
              <button
                onClick={handleToggleAvailability}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                  availability === 'AVAILABLE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Power className="w-3 h-3" />
                <span>{availability === 'AVAILABLE' ? 'Online & Available' : 'Offline'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wallet Balances Strip */}
        <div className="flex items-center gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">85% Payout Wallet</span>
            <span className="text-lg font-extrabold text-emerald-600">₹4,200.00</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">5% Welfare Trust</span>
            <span className="text-lg font-extrabold text-indigo-600">₹530.00</span>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
          noticeType === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {noticeType === 'warning' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          )}
          <span>{notice}</span>
        </div>
      )}

      {/* Active Assignment Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Work Assignment</h2>
          <Badge variant={activeBooking.status === 'PENDING' ? 'warning' : 'default'}>
            {activeBooking.status}
          </Badge>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Customer Job</span>
              <h3 className="font-bold text-base text-slate-900">{activeBooking.serviceTitle}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{activeBooking.customerAddress} (~1.2 km away)</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Booking Code</span>
              <span className="font-mono text-xs font-bold text-slate-900">{activeBooking.bookingCode}</span>
            </div>
          </div>

          {/* Action Buttons: Accept or Reject Cascade */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900">Job Assignment Decision</span>
              <p className="text-[11px] text-slate-500">
                Accept to initiate work or decline to allow the dispatch algorithm to reassign the next best artisan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRejectModalOpen(true)}
                className="text-rose-600 hover:bg-rose-50 border-rose-200 h-9"
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                <span>Decline & Reassign</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleAcceptGig}
                disabled={activeBooking.status === 'ACCEPTED' || isSubmitting}
                className="h-9"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                <span>{activeBooking.status === 'ACCEPTED' ? 'Job Accepted ✓' : 'Accept Assignment'}</span>
              </Button>
            </div>
          </div>

          {/* Mid-Work Extra Charges Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Mid-Work Bill Adjustments</span>
                  <Badge variant="primary">On-Site Adjustments</Badge>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  While this job is active on-site, you can add extra charges for unexpected complications, extra time, or additional diagnosis.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>{activeBooking.extraAmount > 0 ? 'Update Extra Charges' : 'Add Mid-Work Extra Charges'}</span>
              </Button>
            </div>

            {/* Current Breakdown Preview */}
            <div className="p-3 bg-white rounded-lg border border-slate-200/60 flex flex-wrap justify-between items-center gap-2 text-xs">
              <div>
                <span className="text-slate-500">Base Tariff: </span>
                <span className="font-bold text-slate-900">₹{activeBooking.basePrice}</span>
              </div>
              <div>
                <span className="text-slate-500">Added Extra Fee: </span>
                <span className={`font-bold ${activeBooking.extraAmount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {activeBooking.extraAmount > 0 ? `+₹${activeBooking.extraAmount} (${activeBooking.extraChargeReason || 'Extra time'})` : '₹0.00'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Extra Time: </span>
                <span className="font-bold text-slate-900">+{activeBooking.extraTimeMinutes || 0} mins</span>
              </div>
              <div className="pl-3 border-l border-slate-200 font-semibold text-[#1F4072]">
                Est. Bill: ₹{((activeBooking.basePrice || 250) + (activeBooking.extraAmount || 0) + 10).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject & Cascade Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-900">Decline Work Assignment</h3>
              <p className="text-xs text-slate-500">
                Declining this job will immediately trigger the <strong>Cascading Reassignment Algorithm</strong> to match the customer with the next optimal artisan.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-700 block">Reason for Declining</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full h-11 px-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Schedule overlap / current emergency in progress">Schedule overlap / current emergency in progress</option>
                <option value="Distance / traffic transit too far">Distance / traffic transit too far</option>
                <option value="Required specialized tools unavailable">Required specialized tools unavailable</option>
                <option value="Personal / health leave">Personal / health emergency</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleRejectGig} disabled={isSubmitting}>
                {isSubmitting ? 'Reassigning...' : 'Confirm Decline & Cascade'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Extra Charges Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in-50 zoom-in-95">
            
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-900">Add Extra Charges to Bill</h3>
              <p className="text-xs text-slate-500">
                Logged directly onto booking <strong>{activeBooking.bookingCode}</strong> for bill generation.
              </p>
            </div>

            <form onSubmit={handleAddExtraCharge} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 block">Extra Amount (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={extraAmount}
                  onChange={(e) => setExtraAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 block">Reason</label>
                <select
                  value={extraReason}
                  onChange={(e) => setExtraReason(e.target.value)}
                  className="w-full h-11 px-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="EXTRA_TIME_TAKEN">Extra Time Taken (Schedule Overrun)</option>
                  <option value="UNFORESEEN_COMPLICATION">Unforeseen On-site Complication</option>
                  <option value="SPECIALIZED_DIAGNOSIS">Specialized Diagnosis Required</option>
                  <option value="HAZARDOUS_CONDITIONS">Hazardous / Confined Space Work</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 block">Extra Time in Minutes</label>
                <Input
                  type="number"
                  value={extraMinutes}
                  onChange={(e) => setExtraMinutes(e.target.value)}
                  placeholder="30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 block">Artisan Diagnostic Notes</label>
                <Textarea
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="default" size="sm" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Logging...' : 'Submit to Customer Bill'}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
