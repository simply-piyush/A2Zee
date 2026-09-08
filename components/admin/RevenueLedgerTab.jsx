'use client';

import React from 'react';
import { 
  Wallet, ShieldCheck, Building2, TrendingUp, 
  ArrowUpRight, Landmark, CheckCircle2, HeartHandshake 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function RevenueLedgerTab({
  stats,
}) {
  const grossVolume = stats?.revenueSplit?.totalGrossRevenue || 142000;
  const worker85 = stats?.revenueSplit?.workerWallet85 || 120700;
  const society10 = stats?.revenueSplit?.societyOperations10 || 14200;
  const welfare5 = stats?.revenueSplit?.welfareTrust5 || 7100;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-7 font-secondary">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-display">
            Ethical 85-10-5 Cooperative Revenue Partitioning
          </h2>
          <Badge variant="ncct" className="text-xs px-2.5 py-0.5">
            COOPERATIVE BYLAW MANDATED
          </Badge>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Zero corporate extraction • 100% of customer gig fees allocated transparently between artisan, grassroots society, and social security trust
        </p>
      </div>

      {/* 3 Pillars of 85-10-5 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* 85% Worker Take-Home */}
        <div className="bg-gradient-to-br from-white to-blue-50/60 rounded-3xl border border-[#1F4072]/25 p-6 space-y-4 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#1F4072] uppercase tracking-wider block">
              85% Artisan Take-Home
            </span>
            <Badge variant="default" className="font-extrabold text-[10px]">85% SHARE</Badge>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 font-display">
            ₹{worker85.toLocaleString()}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Directly credited to individual artisan cooperative wallets immediately upon job completion and customer verification. No middleman deductions.
          </p>
          <div className="pt-2 border-t border-blue-100 flex items-center gap-2 text-xs text-[#1F4072] font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Guaranteed Minimum Floor Wage</span>
          </div>
        </div>

        {/* 10% Society Operations */}
        <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl border border-blue-200 p-6 space-y-4 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#1F4072] uppercase tracking-wider block">
              10% Society Operations
            </span>
            <Badge variant="default" className="font-extrabold text-[10px]">10% SHARE</Badge>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 font-display">
            ₹{society10.toLocaleString()}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Funds primary society tool banks, certified equipment leasing, ward-level dispute resolution centers, and local administrative overhead.
          </p>
          <div className="pt-2 border-t border-blue-100 flex items-center gap-2 text-xs text-[#1F4072] font-bold">
            <Building2 className="w-4 h-4" />
            <span>Pragati & Navchetana Societies</span>
          </div>
        </div>

        {/* 5% Welfare Trust */}
        <div className="bg-gradient-to-br from-white to-indigo-50/50 rounded-3xl border border-indigo-200 p-6 space-y-4 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block">
              5% Welfare & PMSBY Trust
            </span>
            <Badge variant="ncct" className="font-extrabold text-[10px]">5% SHARE</Badge>
          </div>
          <p className="text-3xl font-extrabold text-indigo-600 font-display">
            ₹{welfare5.toLocaleString()}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dedicated state social security trust reserve. Automatically finances Pradhan Mantri Suraksha Bima Yojana (PMSBY) accident cover and health micro-insurance.
          </p>
          <div className="pt-2 border-t border-indigo-100 flex items-center gap-2 text-xs text-indigo-700 font-bold">
            <HeartHandshake className="w-4 h-4" />
            <span>Social Safety Net Guarantee</span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default RevenueLedgerTab;
