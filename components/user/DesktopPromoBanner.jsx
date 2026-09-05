'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export function DesktopPromoBanner({ onBookArtisan }) {
  return (
    <section className="mt-8 pt-8 border-t border-[#E8DDD4] text-center space-y-4 py-8">
      <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-[#1F4072] uppercase tracking-wide">
        READY FOR DEPENDABLE HOME SERVICE?
      </h2>
      <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto font-normal">
        Book a verified artisan in minutes or define a custom household repair with guaranteed ₹150 base diagnosis.
      </p>
      <div className="pt-2">
        <Button
          type="button"
          onClick={onBookArtisan}
          className="bg-[#1F4072] hover:bg-[#163056] text-white font-display text-sm md:text-base px-8 py-3.5 h-auto rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
        >
          BOOK AN ARTISIAN
        </Button>
      </div>
    </section>
  );
}

export default DesktopPromoBanner;
