'use client';

import React, { useState } from 'react';
import { 
  ArrowUpRight, TrendingUp, Calendar, RefreshCw, 
  Wallet, ShieldCheck, CheckCircle2, Building2, CreditCard, Sparkles,
  ClipboardCheck, Users, Star, Landmark, AlertTriangle, ChevronRight, HardHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export function AdminMetricsBanner({
  stats,
  onRefresh,
  isLoading,
  onNavigateTab,
}) {
  const grossVolume = Number(stats?.revenueSplit?.totalGrossRevenue || 0);
  const worker85 = Number(stats?.revenueSplit?.workerWallet85 || Math.round(grossVolume * 0.85));
  const welfare5 = Number(stats?.revenueSplit?.welfareTrust5 || Math.round(grossVolume * 0.05));
  const society10 = Number(stats?.revenueSplit?.societyOperations10 || Math.round(grossVolume * 0.10));
  
  const totalBookings = stats?.overview?.totalBookings || 0;
  const completedBookings = stats?.overview?.completedBookings || 0;
  const emergencyBookings = stats?.overview?.emergencyBookings || 0;
  
  const totalWorkers = stats?.overview?.totalWorkers || 0;
  const verifiedWorkersCount = stats?.overview?.verifiedWorkersCount || 0;
  const pendingVerificationsCount = stats?.overview?.pendingVerificationsCount || 0;
  
  const totalCustomers = stats?.overview?.totalCustomers || 0;
  const averageRating = stats?.overview?.averageRating || 4.8;
  const cooperatives = stats?.cooperatives || [];

  const [timeRange, setTimeRange] = useState('monthly');

  // Monthly activity data for Shadcn Recharts Bar Chart
  const chartData = [
    { month: 'Jan', dispatches: 38, volume: 18500 },
    { month: 'Feb', dispatches: 62, volume: 31000 },
    { month: 'Mar', dispatches: 50, volume: 24500 },
    { month: 'Apr', dispatches: 96, volume: 48000 },
    { month: 'May', dispatches: 72, volume: 36000 },
    { month: 'Jun', dispatches: 64, volume: 32000 },
  ];

  const chartConfig = {
    dispatches: {
      label: 'Dispatches',
      color: '#1F4072', // Scheme Navy
    },
    volume: {
      label: 'Gross Vol (₹)',
      color: '#152e53', // Deep Navy
    },
  };

  return (
    <div className="space-y-6 font-secondary">
      
      {/* Top Greeting Bar & Live Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              {stats?.isCooperativeScoped ? `${stats.activeCooperativeName || 'Cooperative'} Portal` : 'Apex Federation Dashboard'}
            </h1>
            
          </div>
          
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Live Date Pill */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Today, 8 Sep 2026</span>
          </div>

          {/* Live Refresh Action */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-9 px-3.5 text-xs font-bold gap-1.5 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 shadow-xs cursor-pointer active:scale-95 transition-transform"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#1F4072]' : 'text-slate-500'}`} />
            <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* PRO MAX KPI Ribbon: 4 Sleek Micro Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Gigs & Dispatches */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('bookings')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#1F4072]/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Dispatches
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1F4072] flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-display">
              {totalBookings}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              {completedBookings} Done
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            {emergencyBookings > 0 ? `${emergencyBookings} emergency fast-track` : 'Standard cooperative dispatches'}
          </p>
        </div>

        {/* KPI 2: Artisan Workforce */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('workers')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#1F4072]/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Artisans
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-display">
              {verifiedWorkersCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              / {totalWorkers} registered
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Floor Wage Guaranteed
          </p>
        </div>

        {/* KPI 3: Customer Satisfaction */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('customers')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#1F4072]/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Citizen Trust Rating
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-display">
              {averageRating}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              / 5.0 apex score
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            {totalCustomers} registered household accounts
          </p>
        </div>

        {/* KPI 4: 85-10-5 Welfare & Society Partition */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('revenue')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#1F4072]/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Social Security & Ops
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-display">
              ₹{(society10 + welfare5).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md">
              15% Retained
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            ₹{welfare5.toLocaleString()} trust pool • ₹{society10.toLocaleString()} local ops
          </p>
        </div>

      </div>

      {/* Balanced 12-Column Visual Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Column 1 (4 cols): Apex Treasury & Floor Wage Guarantee */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          
          {/* Scheme Navy Gradient Card */}
          <div className="bg-gradient-to-br from-[#1F4072] via-[#152e53] to-[#0f213d] text-white rounded-3xl p-6 shadow-md relative overflow-hidden space-y-4 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider block">
                  Gross Platform Volume
                </span>
                <p className="text-xs text-blue-200">Sum of all customer bookings & artisan earnings</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div className="pt-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-display block tracking-tight">
                ₹{grossVolume.toLocaleString()}
              </span>
              <span className="text-[11px] text-blue-100/80 font-mono tracking-widest mt-1 block">
                FED-COOP-85-10-5 • BYLAW COMPLIANT
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/15">
              <div className="flex justify-between items-center text-xs text-blue-100/90">
                <span>Artisan Wallets (85%):</span>
                <strong className="text-white font-bold">₹{worker85.toLocaleString()}</strong>
              </div>
              <div className="w-full bg-white/15 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full w-[85%]"></div>
              </div>
            </div>
          </div>

          {/* Micro Revenue Pill Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Weekly Cooperative Volume
              </span>
              <p className="text-lg font-extrabold text-slate-900 font-display mt-0.5">
                ₹{Math.round(grossVolume * 0.28).toLocaleString()}
              </p>
            </div>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
              <TrendingUp className="w-3 h-3" /> +12.8%
            </span>
          </div>

        </div>

        {/* Column 2 (5 cols): Cooperative Dispatch Activity Bar Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#1F4072]">
                <Building2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Cooperative Dispatch Rate</h3>
                <span className="text-xs text-slate-400">Monthly fulfillment volume</span>
              </div>
            </div>

            {/* Time Toggle Pills (Monthly / Annually) */}
            <div className="flex items-center p-1 bg-slate-100 rounded-full text-xs font-bold">
              <button
                type="button"
                onClick={() => setTimeRange('monthly')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  timeRange === 'monthly' ? 'bg-[#1F4072] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('annually')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  timeRange === 'annually' ? 'bg-[#1F4072] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Annually
              </button>
            </div>
          </div>

          {/* Minimal Shadcn Base Chart */}
          <div className="h-44 w-full pt-2 pb-1 border-b border-slate-100">
            <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
              <BarChart
                data={chartData}
                margin={{ top: 12, right: 8, left: 8, bottom: 0 }}
              >
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  fontSize={11}
                  fontWeight={600}
                  stroke="#94A3B8"
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(31, 64, 114, 0.08)', radius: 8 }}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar
                  dataKey="dispatches"
                  fill="var(--color-dispatches)"
                  radius={[8, 8, 2, 2]}
                  maxBarSize={32}
                />
              </BarChart>
            </ChartContainer>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
            <span>
              {stats?.isCooperativeScoped ? 'Affiliated Society: ' : 'Primary societies active: '}
              <strong>{stats?.isCooperativeScoped ? (stats?.activeCooperativeName || 'Cooperative') : `${cooperatives.length || 2} Cooperatives`}</strong>
            </span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 99.4% Fulfillment
            </span>
          </div>

        </div>

        {/* Column 3 (3 cols): Apex Governance & Approvals Widget */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
          
          {/* Pending Verifications Action Card */}
          <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
            pendingVerificationsCount > 0
              ? 'bg-amber-50/70 border-amber-200/90 shadow-xs'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Accreditation Queue
              </span>
              {pendingVerificationsCount > 0 ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-extrabold font-display ${pendingVerificationsCount > 0 ? 'text-amber-900' : 'text-slate-900'}`}>
                  {pendingVerificationsCount}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {pendingVerificationsCount === 1 ? 'applicant pending' : 'applicants pending'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {pendingVerificationsCount > 0
                  ? (stats?.isCooperativeScoped ? `Applicants pending verification for ${stats.activeCooperativeName}` : 'Artisan applicants waiting for credential & cooperative verification')
                  : 'All applicants vetted and approved for dispatch'}
              </p>
            </div>

            <Button
              type="button"
              variant={pendingVerificationsCount > 0 ? 'default' : 'outline'}
              size="sm"
              onClick={() => onNavigateTab && onNavigateTab('verifications')}
              className={`w-full text-xs font-bold rounded-2xl h-8.5 cursor-pointer flex items-center justify-center gap-1.5 ${
                pendingVerificationsCount > 0 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>{pendingVerificationsCount > 0 ? 'Review Queue' : 'View Approvals'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Registered Cooperative Societies Mini-Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space- y-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {stats?.isCooperativeScoped ? 'Society Affiliation' : 'Registered Cooperatives'}
            </span>
            <div className="space-y-2">
              {stats?.isCooperativeScoped && cooperatives.length > 0 ? (
                <div className="space-y-1 text-xs py-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1F4072]"></span>
                      <span className="font-bold text-slate-800 truncate" title={cooperatives[0].name}>
                        {cooperatives[0].name}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#1F4072] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 shrink-0">
                      {cooperatives[0].workerCount} artisans
                    </span>
                  </div>
                  {cooperatives[0].registrationNumber && (
                    <div className="text-[10px] text-slate-400 pl-3 font-medium">
                      Reg: {cooperatives[0].registrationNumber}
                    </div>
                  )}
                </div>
              ) : cooperatives.length > 0 ? cooperatives.slice(0, 2).map((coop) => (
                <div key={coop.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F4072]"></span>
                    <span className="font-bold text-slate-800 truncate" title={coop.name}>
                      {coop.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                    {coop.workerCount} workers
                  </span>
                </div>
              )) : (
                <>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                    <span className="font-bold text-slate-800 truncate">Pragati Labour Society</span>
                    <span className="text-[11px] font-semibold text-slate-500">30 workers</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="font-bold text-slate-800 truncate">Navchetana Labour Society</span>
                    <span className="text-[11px] font-semibold text-slate-500">30 workers</span>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminMetricsBanner;

