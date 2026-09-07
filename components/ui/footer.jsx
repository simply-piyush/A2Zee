'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, HeartHandshake, Award } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // Hide footer on authentication portal and all post-login pages
  if (
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/user') ||
    pathname?.startsWith('/worker') ||
    pathname?.startsWith('/admin')
  ) {
    return null;
  }

  return (
    <footer className="relative bg-[#1F4072] text-[#FFF6F0] mt-auto">
      
      {/* Top Scalloped Cloud SVG Silhouette matching user reference */}
      <div className="w-full overflow-hidden leading-none select-none pointer-events-none -mt-16 sm:-mt-24 lg:-mt-28 relative z-10 -mb-1">
        <svg
          viewBox="0 0 1440 142"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-16 sm:h-24 lg:h-28 block text-[#1F4072] translate-y-[2px]"
          preserveAspectRatio="none"
        >
          <path
            d="M0,142 L0,90 C0,90 25,35 110,18 C195,0 260,35 300,90 C340,95 380,45 490,20 C600,-5 710,10 780,75 C820,95 860,60 940,40 C1020,20 1100,55 1140,90 C1180,68 1240,32 1330,38 C1400,42 1440,90 1440,90 L1440,142 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-2 pb-12 space-y-10">
        
        {/* Top Content Row matching reference image */}
        <div className="pb-1 max-w-3xl">
          {/* Brand Logo in Luckiest Guy */}
          <h2 className="font-display text-4xl sm:text-4xl font-bold  text-white tracking-wide">
            A2ZEE
          </h2>

          {/* Motto */}
          <p className="font-secondary font-medium text-base sm:text-lg text-white/75">
            "Your Need. Our People. One Platform."
          </p>
        </div>

        {/* Bottom Legal & Tech Strip */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-[#FFF6F0]/60 gap-3 pt-6 border-t border-white/10 font-secondary">
          <p>© 2026 A2Zee Platform. Built for Labour Cooperative Federations & Primary Societies.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#A8C7FA] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Police Verified Karigars
            </span>
            <span>Ministry of Cooperation</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
