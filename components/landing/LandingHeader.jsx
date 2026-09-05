'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBackground } from '@/components/ui/header-background';

/**
 * LandingHeader Component
 * Branded top header for the A2Zee landing page featuring the wavy blue background component.
 */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 rounded-b-[32px] md:rounded-b-[36px] px-6 py-3.5 sm:py-4 shadow-xl text-white overflow-hidden transition-all">
      {/* Reusable Wavy Header Background */}
      <HeaderBackground />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            onClick={(e) => {
              if (typeof window !== 'undefined' && window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="group flex items-center gap-3 cursor-pointer"
          >
              
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <span className="font-display text-2xl sm:text-3xl text-white tracking-wider uppercase drop-shadow-xs">
                    A2Zee
                  </span>
                 
                </div>
                
              </div>
            </Link>
         

          {/* Quick Action Navigation Buttons (Hidden on mobile, visible on sm+) */}
          <div className="hidden sm:flex items-center gap-3 justify-end">
            <Link href="/auth">
              <Button
                type="button"
                variant="outline"
              >
                <div className='flex flex-row gap-2 justify-between items-center'>
                  <User className="w-4 h-4" />
                  <span>Portal Login</span>
                </div>
              </Button>
            </Link>

            <Link href="/user">
              <Button
                type="button"
                variant=""
              >
                <div className='flex flex-row gap-2 justify-between items-center'>
                  <span>Book an Artisan</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}

export default LandingHeader;
