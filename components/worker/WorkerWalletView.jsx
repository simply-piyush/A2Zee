'use client';

import React, { useState, useMemo } from 'react';
import { 
  Wallet, ShieldCheck, HeartHandshake, TrendingUp, 
  ArrowUpRight, Clock, CheckCircle2, Building2, Calendar, ChevronDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function WorkerWalletView({
  walletBalance,
  welfareBalance,
  cooperativeName = 'Pragati Labour Cooperative Society',
  assignedJobs = [],
  monthlyBreakdown = {},
}) {
  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  
  // Available months from breakdown, sorted newest first
  const availableMonths = useMemo(() => {
    return Object.values(monthlyBreakdown).sort((a, b) => 
      (b.key || b.monthKey || '').localeCompare(a.key || a.monthKey || '')
    );
  }, [monthlyBreakdown]);

  const [selectedMonthKey, setSelectedMonthKey] = useState(
    monthlyBreakdown[currentMonthKey] ? currentMonthKey : (availableMonths[0]?.key || currentMonthKey)
  );

  // Keep selectedMonthKey synchronized if availableMonths change
  React.useEffect(() => {
    if (selectedMonthKey !== 'ALL' && !monthlyBreakdown[selectedMonthKey] && availableMonths.length > 0) {
      const preferred = monthlyBreakdown[currentMonthKey] ? currentMonthKey : availableMonths[0]?.key;
      if (preferred) setSelectedMonthKey(preferred);
    }
  }, [availableMonths, currentMonthKey, monthlyBreakdown, selectedMonthKey]);

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId] = useState('ramesh.kumar@okhdfcbank');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Compute selected month's summary data
  const currentSelectionData = useMemo(() => {
    if (selectedMonthKey === 'ALL') {
      const allCompleted = assignedJobs.filter(j => j.status === 'COMPLETED');
      const totalPayout = allCompleted.reduce((sum, j) => {
        const finalPrice = Number(j.finalPrice) || (Number(j.basePrice || 0) + Number(j.extraAmount || 0));
        return sum + (j.workerPayout !== undefined ? Number(j.workerPayout) : (finalPrice * 0.85));
      }, 0);
      const totalGross = allCompleted.reduce((sum, j) => {
        return sum + (Number(j.finalPrice) || (Number(j.basePrice || 0) + Number(j.extraAmount || 0)));
      }, 0);

      return {
        key: 'ALL',
        label: 'All-Time Settlements',
        totalPayout,
        totalGross,
        totalWelfare: totalGross * 0.05,
        totalPlatform: totalGross * 0.10,
        completedCount: allCompleted.length,
        jobs: allCompleted,
      };
    }

    if (monthlyBreakdown[selectedMonthKey]) {
      return monthlyBreakdown[selectedMonthKey];
    }

    return {
      key: selectedMonthKey,
      label: new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
      totalPayout: parseFloat(String(walletBalance || '0').replace(/,/g, '')) || 0,
      totalGross: (parseFloat(String(walletBalance || '0').replace(/,/g, '')) || 0) / 0.85,
      totalWelfare: parseFloat(String(welfareBalance || '0').replace(/,/g, '')) || 0,
      totalPlatform: 0,
      completedCount: 0,
      jobs: [],
    };
  }, [selectedMonthKey, monthlyBreakdown, assignedJobs, walletBalance, welfareBalance]);

  const displayPayout = currentSelectionData.totalPayout.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const displayWelfare = currentSelectionData.totalWelfare.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleWithdraw = (e) => {
    e.preventDefault();
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
        setIsWithdrawOpen(false);
      }, 1500);
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Title & Month Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-display">
            Cooperative Earnings & Welfare Trust
          </h2>
          
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Month Selector Dropdown with Radix ScrollArea */}
          <div className="w-52 sm:w-60 relative z-30">
            <Select value={selectedMonthKey} onValueChange={setSelectedMonthKey}>
              <SelectTrigger className="h-9 py-1 px-3 rounded-xl border border-slate-200/90 bg-white text-xs font-bold text-[#1F4072] hover:border-[#1F4072]/40 shadow-xs focus:ring-2 focus:ring-[#1F4072] font-outfit">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent className="w-60 p-1 rounded-2xl bg-white border border-gray-200 shadow-2xl text-gray-800">
                {availableMonths.map((m) => (
                  <SelectItem key={m.key} value={m.key} className="text-xs font-medium py-2">
                    {m.label} ({m.completedCount} {m.completedCount === 1 ? 'job' : 'jobs'})
                  </SelectItem>
                ))}
                <SelectItem value="ALL" className="text-xs font-bold py-2 border-t border-slate-100 mt-1">
                  All Time Settlements
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setWithdrawAmount(displayPayout.replace(/,/g, ''));
              setIsWithdrawOpen(true);
            }}
            className="h-9 px-3.5 font-bold bg-[#1F4072] hover:bg-[#163056] text-xs rounded-xl shadow-xs cursor-pointer font-outfit"
          >
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>Withdraw</span>
          </Button>
        </div>
      </div>

      {/* 85-5-10 Distribution Cards for Selected Month */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: 85% Artisan Payout Wallet */}
        <Card className="p-5 bg-white border-emerald-200 shadow-xs relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>85% Artisan Payout</span>
              </span>
              <Badge variant="success" className="text-[10px]">
                {currentSelectionData.label}
              </Badge>
            </div>
            
            <div className="pt-1">
              <span className="text-3xl font-extrabold text-emerald-600 font-outfit">
                ₹{displayPayout}
              </span>
            </div>

            
          </div>
        </Card>

        {/* Card 2: 5% Cooperative Welfare Trust Fund */}
        <Card className="p-5 bg-white border-indigo-200 shadow-xs relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
                <HeartHandshake className="w-4 h-4 text-indigo-600" />
                <span>5% Welfare Trust Fund</span>
              </span>
              <Badge variant="ncct" className="text-[10px]">Coop Trust</Badge>
            </div>

            <div className="pt-1">
              <span className="text-3xl font-extrabold text-indigo-700 font-outfit">
                ₹{displayWelfare}
              </span>
            </div>

            
          </div>
        </Card>

        {/* Card 3: 10% Cooperative Maintenance Fee */}
        <Card className="p-5 bg-white border-slate-200 shadow-xs relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
                <Building2 className="w-4 h-4 text-[#1F4072]" />
                <span>10% Platform & Admin</span>
              </span>
              <Badge variant="secondary" className="text-[10px]">Fixed Cap</Badge>
            </div>

            <div className="pt-1">
              <span className="text-3xl font-extrabold text-slate-700 font-outfit">10.0%</span>
            </div>

            
          </div>
        </Card>

      </div>

      {/* Earnings Ledger Table for Selected Month */}
      <Card className="overflow-hidden border-slate-200/90 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 font-outfit">
              {currentSelectionData.label} Settlements ({currentSelectionData.completedCount} Jobs)
            </CardTitle>
            
          </div>
          
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {currentSelectionData.jobs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 text-xs">
                  <TableHead className="font-bold text-slate-700">Booking Code</TableHead>
                  <TableHead className="font-bold text-slate-700">Service & End Time</TableHead>
                  <TableHead className="font-bold text-slate-700">Base Tariff</TableHead>
                  <TableHead className="font-bold text-slate-700">Extra Charges</TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">Net 85% Payout</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSelectionData.jobs.map((tx) => {
                  const baseNum = Number(tx.basePrice || 0);
                  const extraNum = Number(tx.extraAmount || 0);
                  const gross = Number(tx.finalPrice) || (baseNum + extraNum);
                  const payout = tx.workerPayout !== undefined ? Number(tx.workerPayout) : (gross * 0.85);

                  // Format scheduledEndTime
                  let dateLabel = 'Completed';
                  const dateStr = tx.scheduledEndTime || tx.scheduledDate || tx.createdAt;
                  if (dateStr) {
                    const d = new Date(dateStr);
                    if (!isNaN(d.getTime())) {
                      dateLabel = d.toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                    }
                  }

                  return (
                    <TableRow key={tx.id} className="text-xs hover:bg-slate-50/50">
                      <TableCell className="font-mono font-bold text-[#1F4072]">
                        {tx.bookingCode || `BK-${tx.id.substring(0, 8).toUpperCase()}`}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900 font-secondary">{tx.serviceTitle}</div>
                        <span className="text-[10px] text-slate-500 font-mono">End: {dateLabel}</span>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700">
                        ₹{baseNum.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-semibold text-amber-700">
                        {extraNum > 0 ? `+₹${extraNum.toFixed(2)}` : '—'}
                      </TableCell>
                      <TableCell className="text-right font-extrabold text-emerald-600 text-sm font-outfit">
                        ₹{payout.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="success" className="text-[10px] py-0.5 font-outfit">
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-slate-500 space-y-1">
              <p className="font-bold text-sm text-slate-700 font-outfit">No Completed Jobs for {currentSelectionData.label}</p>
              <p className="text-xs">When you mark active jobs as completed, their 85% payouts will automatically show here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Withdrawal Modal */}
      <Dialog
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        title="Withdraw Artisan Earnings"
        description="Instant transfer directly to your registered UPI VPA or Bank Account"
        className="max-w-md"
      >
        {withdrawSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-900">Payout Transfer Initiated!</h4>
            <p className="text-xs text-slate-500">
              ₹{withdrawAmount} transferred to {upiId}. Payout reference: A2Z-UPI-{Date.now().toString().slice(-6)}
            </p>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-4 pt-2 text-xs sm:text-sm">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Available Withdrawable Balance</label>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-lg font-outfit">
                ₹{displayPayout}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Withdrawal Amount (₹)</label>
              <Input
                type="number"
                required
                min="100"
                max={currentSelectionData.totalPayout}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="text-sm font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Registered UPI ID / VPA</label>
              <Input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@bank"
                className="text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsWithdrawOpen(false)}
                disabled={isWithdrawing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={isWithdrawing || !withdrawAmount || Number(withdrawAmount) <= 0}
                className="bg-[#1F4072] hover:bg-[#163056]"
              >
                {isWithdrawing ? 'Processing Transfer...' : 'Confirm Withdrawal'}
              </Button>
            </div>
          </form>
        )}
      </Dialog>

    </div>
  );
}

export default WorkerWalletView;
