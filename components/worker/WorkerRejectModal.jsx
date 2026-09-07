'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw, XCircle } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function WorkerRejectModal({
  isOpen,
  onClose,
  bookingCode,
  onConfirmReject,
  isSubmitting = false,
}) {
  const [reason, setReason] = useState('Schedule overlap / current emergency in progress');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmReject(reason);
  };

  const REJECTION_REASONS = [
    'Schedule overlap / current emergency in progress',
    'Transit distance / heavy traffic congestion',
    'Required specialized tools/parts unavailable',
    'Health / personal emergency',
    'Shift hours completed',
    'Safety hazard at customer site reported',
    'Client location out of operative perimeter',
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Job Assignment"
      //description="Cascading Reassignment Protocol (PostgreSQL)"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Cascade Explanation Callout */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold font-outfit">
            <RefreshCw className="w-4 h-4 text-amber-600 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Automatic Fair-Share Reassignment</span>
          </div>
          <p className="leading-relaxed text-[11px] text-amber-800 font-secondary">
            Rejecting booking <strong>{bookingCode || 'current job'}</strong> and re-runs the dispatch algorithm to reassign this job to the next best available artisan.
          </p>
        </div>

        {/* Reason Dropdown with Radix ScrollArea */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block font-secondary">
            Reason for Rejection
          </label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="w-full h-11 px-3.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1F4072] font-secondary">
              <SelectValue placeholder="Select reason for rejection" />
            </SelectTrigger>
            <SelectContent className="w-full max-h-56">
              {REJECTION_REASONS.map((r) => (
                <SelectItem key={r} value={r} className="text-xs font-medium py-2.5">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-10 px-4 cursor-pointer"
          >
            Keep Assignment
          </Button>

          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={isSubmitting}
            className="h-10 px-4 font-bold bg-rose-600 hover:bg-rose-700 cursor-pointer"
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            <span>{isSubmitting ? 'Reassigning...' : 'Confirm Reject & Reassign'}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export default WorkerRejectModal;
