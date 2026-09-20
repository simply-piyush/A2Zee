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
  const worker75 = stats?.revenueSplit?.workerWallet75 || stats?.revenueSplit?.workerWallet85 || Math.round(grossVolume * 0.75);
  const society10 = stats?.revenueSplit?.societyOperations10 || Math.round(grossVolume * 0.10);
  const platform10 = stats?.revenueSplit?.platformOperations10 || Math.round(grossVolume * 0.10);
  const welfare5 = stats?.revenueSplit?.welfareTrust5 || Math.round(grossVolume * 0.05);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-7 font-secondary">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-display">
            Ethical 75-10-10-5 A2ZEE Cooperative Revenue Partitioning
          </h2>
          <Badge variant="ncct" className="text-xs px-2.5 py-0.5">
            COOPERATIVE BYLAW MANDATED
          </Badge>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Zero predatory middlemen • 100% of customer gig fees allocated transparently between artisan (75%), grassroots society (10%), A2ZEE platform operations (10%), and social security trust (5%).
        </p>
      </div>

      {/* 4 Pillars of 75-10-10-5 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 75% Worker Take-Home */}
        <div className="bg-gradient-to-br from-white to-blue-50/60 rounded-3xl border border-[#1F4072]/25 p-6 space-y-4 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#1F4072] uppercase tracking-wider block">
              75% Artisan Take-Home
            </span>
            <Badge variant="default" className="font-extrabold text-[10px]">75% SHARE</Badge>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 font-display">
            ₹{worker75.toLocaleString()}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Directly credited to individual artisan cooperative wallets immediately upon job completion and customer sign-off (+100% of tips).
          </p>
          <div className="pt-2 border-t border-blue-100 flex items-center gap-2 text-xs text-[#1F4072] font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Floor Wage Guarantee</span>
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
            Funds primary society tool banks, certified equipment leasing, ward dispute resolution, and local collective governance.
          </p>
          <div className="pt-2 border-t border-blue-100 flex items-center gap-2 text-xs text-[#1F4072] font-bold">
            <Building2 className="w-4 h-4" />
            <span>Grassroots Societies</span>
          </div>
        </div>

        {/* 10% Platform Operations */}
        <div className="bg-gradient-to-br from-white to-sky-50/50 rounded-3xl border border-sky-200 p-6 space-y-4 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
              10% Platform Ops
            </span>
            <Badge variant="secondary" className="font-extrabold text-[10px] bg-sky-100 text-sky-800 border-sky-200">10% SHARE</Badge>
          </div>
          <p className="text-3xl font-extrabold text-sky-900 font-display">
            ₹{platform10.toLocaleString()}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Powers A2ZEE digital infrastructure, ML demand forecasting engines, server hosting, automated routing, and SMS/call gateways.
          </p>
          <div className="pt-2 border-t border-sky-100 flex items-center gap-2 text-xs text-sky-700 font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>A2ZEE Tech & Infra</span>
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
            Dedicated social security trust reserve. Automatically finances PMSBY accident cover and emergency artisan relief.
          </p>
          <div className="pt-2 border-t border-indigo-100 flex items-center gap-2 text-xs text-indigo-700 font-bold">
            <HeartHandshake className="w-4 h-4" />
            <span>Social Safety Net</span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default RevenueLedgerTab;
