'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, User, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBackground } from '@/components/ui/header-background';

/**
 * LandingHeader Component (components/landing/LandingHeader.jsx)
 * Branded top header with the signature wavy background.
 * In admin mode, renders "A2Zee" brand text with live status badge and Logout button.
 * In landing mode, renders "A2Zee" brand text with portal links.
 */
export function LandingHeader({
  variant = 'landing',
  title = 'A2Zee',
  badge = null,
}) {
  const isAdmin = variant === 'admin';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn(e);
    }
    document.cookie = "a2zee_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;";
    window.location.replace('/auth');
  };

  if (isAdmin) {
    return (
      <header className="sticky top-0 z-40 rounded-b-[32px] md:rounded-b-[36px] px-6 py-3.5 sm:py-4 shadow-xl text-white overflow-hidden transition-all">
        {/* Signature Reusable Wavy Header Background */}
        <HeaderBackground />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/admin" 
                onClick={(e) => {
                  if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="cursor-pointer select-none flex items-center gap-2.5"
              >
                <span className="font-display text-2xl sm:text-3xl text-white tracking-wider uppercase font-bold drop-shadow-xs">
                  A2Zee
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20 text-[11px] font-bold tracking-wider uppercase backdrop-blur-xs max-w-[280px] truncate" title={badge || 'Apex Admin'}>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span className="truncate">{badge || 'Apex Admin'}</span>
                </span>
              </Link>
            </div>

            {/* Right Action: Live Status Indicator & Logout Button */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs text-xs font-semibold text-white/90">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span>{badge ? `${badge} Portal` : 'Federation Live'}</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="group relative inline-flex items-center justify-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/10 hover:bg-red-500/25 active:bg-red-600/30 text-white font-bold text-xs sm:text-sm border border-white/20 hover:border-red-400/40 shadow-xs hover:shadow-md backdrop-blur-md transition-all duration-200 cursor-pointer active:scale-95"
                title={`Log out from ${badge || 'Admin'} Portal`}
              >
                <LogOut className="w-4 h-4 text-red-200 group-hover:text-white transition-colors" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 rounded-b-[32px] md:rounded-b-[36px] px-6 py-3.5 sm:py-4 shadow-xl text-white overflow-hidden transition-all">
      {/* Signature Reusable Wavy Header Background */}
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
                <span className="font-display text-2xl sm:text-3xl text-white tracking-wider uppercase font-bold drop-shadow-xs">
                  {title}
                </span>
              </div>
            </div>
          </Link>

          {/* Quick Action Navigation Buttons */}
          <div className="hidden sm:flex items-center gap-3 justify-end">
            <Link href="/auth">
              <Button
                type="button"
                variant="outline"
              >
                <div className="flex flex-row gap-2 justify-between items-center">
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
                <div className="flex flex-row gap-2 justify-between items-center">
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
