'use client';

import React from 'react';
import { 
  ShieldCheck, Power, Wallet, Award, Clock, 
  MapPin, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HeaderBackground } from '@/components/ui/header-background';

export function WorkerHeader({
  worker,
  availability,
  onToggleAvailability,
  currentView,
  onViewChange,
  activeBookingsCount = 0,
  walletBalance = '4,200.00',
  welfareBalance = '530.00',
}) {
  const isOnline = availability === 'AVAILABLE';

  const navTabs = [
    { id: 'gigs', label: 'Incoming Gigs', count: activeBookingsCount > 0 ? activeBookingsCount : null },
    { id: 'active', label: 'Active Job' },
    { id: 'wallet', label: 'Coop Wallet' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'profile', label: 'Artisan Profile' },
  ];

  return (
    <HeaderBackground className="pb-6 pt-5 px-4 sm:px-6 md:px-8 text-white">
      <div className="max-w-5xl mx-auto space-y-5">
        
        {/* Top Profile Strip */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* Worker Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-brand text-lg shadow-inner">
              {worker?.initials || worker?.name?.slice(0, 2)?.toUpperCase() || 'RK'}
            </div>
            
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white drop-shadow-xs">
                  {worker?.name || 'Ramesh Kumar'}
                </h1>
                <Badge variant="ncct" className="bg-white/90 text-[#1F4072] border-0 font-bold text-[10px]">
                  {worker?.ncctTier || 'NCCT Tier-1 Certified'}
                </Badge>
              </div>

              <p className="text-xs text-white/80 font-medium flex items-center gap-1.5">
                <span>{worker?.trade || 'Electrician'}</span>
                <span>•</span>
                <span>{worker?.society || 'Pragati Labour Cooperative Society'}</span>
              </p>

              <div className="flex items-center gap-2 pt-0.5">
                <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Artisan</span>
                </span>
                <span className="text-white/30">•</span>
                
                {/* Online/Offline Toggle Button */}
                <button
                  type="button"
                  onClick={onToggleAvailability}
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    isOnline
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 ring-2 ring-emerald-300/40'
                      : 'bg-white/20 text-white/80 hover:bg-white/30'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
                  <Power className="w-3 h-3" />
                  <span>{isOnline ? 'Online & Available' : 'Offline'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Wallet Summary Strip */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider block">
                85% Payout Wallet
              </span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-300">
                ₹{walletBalance}
              </span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider block">
                5% Welfare Trust
              </span>
              <span className="text-base sm:text-lg font-extrabold text-amber-200">
                ₹{welfareBalance}
              </span>
            </div>
          </div>

        </div>

        {/* View Switcher Tabs Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-white/15">
          {navTabs.map((tab) => {
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onViewChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#FFEDE0] text-[#1F4072] shadow-sm scale-100'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-[#1F4072] text-white' : 'bg-amber-400 text-slate-900'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </HeaderBackground>
  );
}
