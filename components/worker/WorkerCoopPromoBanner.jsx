'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';

export function WorkerCoopPromoBanner({ onOpenWallet }) {
  return (
    <section className="mt-8 pt-8 border-t border-[#E8DDD4] text-center space-y-4 py-8">
      <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-[#1F4072] uppercase tracking-wide">
        COOPERATIVE OWNERSHIP • NO PLATFORM CUTS
      </h2>
      <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto font-normal">
        Under NCCT & Ministry of Cooperation bylaws, artisans retain 85% of total job fees with 5% mutual welfare health credits. Payouts settle directly to your UPI ID without hidden deductions.
      </p>
      <div className="pt-2">
        <Button
          type="button"
          onClick={onOpenWallet}
          className="bg-[#1F4072] hover:bg-[#163056] text-white font-display text-sm md:text-base px-8 py-3.5 h-auto rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
        >
          <span>VIEW COOP WALLET</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </section>
  );
}

export default WorkerCoopPromoBanner;
