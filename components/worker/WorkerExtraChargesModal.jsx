'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calculator, ShieldCheck, Clock } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function WorkerExtraChargesModal({
  isOpen,
  onClose,
  bookingCode,
  baseTariff = 250,
  onSubmit,
  isSubmitting = false,
}) {
  const [extraAmount, setExtraAmount] = useState('150.00');
  const [reason, setReason] = useState('EXTRA_TIME_TAKEN');
  const [extraMinutes, setExtraMinutes] = useState('30');
  const [notes, setNotes] = useState('Conduit rusted shut; manual chiseling & replacement parts required (+30 mins)');

  const extraNum = parseFloat(extraAmount) || 0;
  const newTotal = baseTariff + extraNum + 10;
  const extraArtisanShare = Math.round(extraNum * 0.85);
  const extraWelfareShare = Math.round(extraNum * 0.05);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      extraAmount: extraNum,
      reason,
      notes,
      extraTimeMinutes: parseInt(extraMinutes, 10) || 0,
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add Mid-Work Extra Charges"
      description={`Logged directly onto booking ${bookingCode || ''} for customer bill generation.`}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Real-time Cooperative Calculation Preview */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#1F4072]/5 via-emerald-500/5 to-amber-500/5 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-[#1F4072]" />
              <span>Live Price Calculation</span>
            </span>
            <Badge variant="success" className="text-[10px]">85% Direct to You</Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
              <span className="text-[10px] text-slate-400 block uppercase">New Total Bill</span>
              <span className="font-extrabold text-[#1F4072] text-sm">₹{newTotal.toFixed(2)}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
              <span className="text-[10px] text-slate-400 block uppercase">Your 85% Extra</span>
              <span className="font-extrabold text-emerald-600 text-sm">+₹{extraArtisanShare.toFixed(2)}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
              <span className="text-[10px] text-slate-400 block uppercase">5% Welfare</span>
              <span className="font-extrabold text-indigo-600 text-sm">+₹{extraWelfareShare.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">Extra Amount (₹)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={extraAmount}
            onChange={(e) => setExtraAmount(e.target.value)}
            required
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">Adjustment Reason</label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="w-full h-11 px-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1F4072]">
              <SelectValue placeholder="Select adjustment reason" />
            </SelectTrigger>
            <SelectContent className="w-full max-h-56">
              <SelectItem value="EXTRA_TIME_TAKEN">Extra Time Taken (Schedule Overrun)</SelectItem>
              <SelectItem value="UNFORESEEN_COMPLICATION">Unforeseen On-site Complication</SelectItem>
              <SelectItem value="SPECIALIZED_DIAGNOSIS">Specialized Diagnosis Required</SelectItem>
              <SelectItem value="SPARE_PARTS_PROCURED">Replacement Parts Procured on Behalf of Customer</SelectItem>
              <SelectItem value="HAZARDOUS_CONDITIONS">Hazardous / Confined Space Work</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">Extra Time Taken (Minutes)</label>
          <Input
            type="number"
            min="0"
            step="5"
            value={extraMinutes}
            onChange={(e) => setExtraMinutes(e.target.value)}
            placeholder="30"
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">Artisan Diagnostic Notes</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            required
            placeholder="Detail what unexpected complication was discovered on-site..."
            className="rounded-xl text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-10 px-4"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="h-10 px-5 font-bold bg-[#1F4072] hover:bg-[#163056]"
          >
            {isSubmitting ? 'Logging to Bill...' : 'Submit to Customer Bill'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
