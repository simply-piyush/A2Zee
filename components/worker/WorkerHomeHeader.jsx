'use client';

import React from 'react';
import { MapPin, Power, Wallet, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBackground } from '@/components/ui/header-background';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';

export function WorkerHomeHeader({
  worker,
  workerLocation = 'Madhyamgram, Kolkata',
  availability,
  onToggleAvailability,
  isLocating = false,
  clusterRadius = '15 km',
  onSelectClusterRadius,
  walletBalance = '4,200.00',
  monthlyEarnings = '18,450.00',
  onOpenWallet,
  onOpenProfile,
}) {
  const isOnline = availability === 'AVAILABLE';

  const clusterRadii = [
    { label: 'Immediate Cluster (5 km)', value: '5 km', desc: 'Fastest 10-min response' },
    { label: 'Ward & Sub-District (8 km)', value: '8 km', desc: 'Inner cooperative perimeter' },
    { label: 'Standard Cluster (15 km)', value: '15 km', desc: 'Default cooperative zone' },
    { label: 'Metro Sector (20 km)', value: '20 km', desc: 'Extended city perimeter' },
    { label: 'Extended Apex (25 km)', value: '25 km', desc: 'High demand overflow' },
    { label: 'Regional Belt (35 km)', value: '35 km', desc: 'Suburban artisan corridor' },
  ];

  const workerInitial = worker?.name ? worker.name.charAt(0).toUpperCase() : 'P';

  return (
    <header className="rounded-b-[36px] md:rounded-b-[48px] px-5 sm:px-6 pt-12 sm:pt-14 pb-8 text-white relative">
      <HeaderBackground className="rounded-b-[36px] md:rounded-b-[48px]" />

      <div className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto w-full space-y-5 relative z-10">
        
        {/* Top Row: Cooperative Cluster Selector, Online/Offline Toggle Switch & Worker Avatar */}
        <div className="flex items-center justify-between gap-3">
          
          {/* Cluster Location Pill with Select component and strict overflow-hidden ellipsis occupying 50vw from left end to middle */}
          <div className="w-[50vw] max-w-[50vw] min-w-0 relative z-50">
            <Select
              value={clusterRadius}
              onValueChange={(val) => onSelectClusterRadius?.(val)}
            >
              <SelectTrigger 
                hideChevron
                className="border-0 bg-transparent hover:opacity-90 text-white p-0 rounded-none ring-0 focus:ring-0 focus:outline-none h-auto shadow-none w-full flex items-center text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0 w-full text-left">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm tracking-wide text-white min-w-0">
                      <span className="truncate">{worker?.society || 'Pragati Labour Cooperative'}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-white/80 shrink-0 transition-transform duration-200" />
                    </div>
                    <span 
                      className="text-[11px] sm:text-xs text-white/80 font-normal block truncate w-full"
                      title={`${workerLocation} • Radius: ${clusterRadius}`}
                    >
                      {workerLocation} • Radius: {clusterRadius}
                    </span>
                  </div>
                </div>
              </SelectTrigger>

              <SelectContent className="w-72 sm:w-80 p-2 rounded-2xl bg-white border border-gray-200 shadow-2xl text-gray-800">
                <div className="border-b border-gray-100 px-2 py-1.5 mb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Dispatch Coverage Radius
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Emergency and scheduled cooperative zone
                  </span>
                </div>

                <div className="space-y-1">
                  {clusterRadii.map((c) => (
                    <SelectItem
                      key={c.value}
                      value={c.value}
                      className="w-full text-left p-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <span className="block font-bold text-slate-800">{c.label}</span>
                        <span className="text-[10px] text-slate-400 font-normal block truncate">{c.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Right Action Icons: Online/Offline Toggle Switch & Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Online/Offline Toggle Switch */}
            <button
              type="button"
              onClick={onToggleAvailability}
              disabled={isLocating}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer border shadow-sm ${
                isLocating
                  ? 'bg-amber-500/90 text-white border-amber-400 animate-pulse'
                  : isOnline
                  ? 'bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600 ring-2 ring-emerald-300/40'
                  : 'bg-white/15 text-white/85 border-white/20 hover:bg-white/25'
              }`}
              title={isOnline ? 'Online - Click to go offline' : 'Offline - Click to go online & fetch GPS'}
            >
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                isOnline ? 'bg-white text-emerald-600' : 'bg-white/40 text-white'
              }`}>
                <Power className="w-2.5 h-2.5" />
              </div>
              <div className="text-left flex items-center gap-1">
                <span className="text-xs font-bold leading-none">
                  {isLocating ? 'Syncing...' : isOnline ? 'Online' : 'Offline'}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
              </div>
            </button>

            {/* Worker Avatar Circle */}
            <button
              type="button"
              onClick={onOpenProfile}
              className="w-10 h-10 rounded-full bg-[#E5EEFF] text-[#1F4072] font-black text-lg flex items-center justify-center shadow-md border-2 border-white hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              aria-label="Worker Profile"
            >
              {workerInitial}
            </button>
          </div>

        </div>

        {/* Earnings this Month (No white box container) with Button for Details */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wider text-white/80 truncate">
                Earnings this Month
              </p>
            </div>
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
                ₹{monthlyEarnings}
              </h2>
              
            </div>
          </div>

          <div className="shrink-0">
            <Button
              type="button"
              variant="secondary"
              onClick={onOpenWallet}
              className="cursor-pointer"
            >
              <span className="font-bold text-[#1F4072]">Details</span>
            </Button>
          </div>
        </div>

      </div>
    </header>
  );
}

export default WorkerHomeHeader;
