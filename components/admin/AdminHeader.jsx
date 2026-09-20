'use client';

import React from 'react';
import Link from 'next/link';
import { RefreshCw, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBackground } from '@/components/ui/header-background';
import { useAdmin } from './AdminContext';

export function AdminHeader() {
  const { 
    adminBadge, 
    isLoading, 
    loadAdminData, 
    handleLogout, 
    isMobileMenuOpen, 
    setIsMobileMenuOpen 
  } = useAdmin();

  return (
    <header className="relative overflow-hidden px-3.5 sm:px-6 lg:px-7 py-3 sm:py-3.5 sticky top-0 z-20 shrink-0 select-none">
      
      {/* HeaderBackground for Admin Header with black gradient removed */}
      <HeaderBackground showVignette={false} baseGradient="bg-[#1F4072]" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Admin Badge */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link 
            href="/admin" 
            className="cursor-pointer select-none flex items-center gap-2.5 sm:gap-3 group"
          >
            <span className="font-display text-2xl sm:text-3xl text-white tracking-wider uppercase font-black drop-shadow-md group-hover:text-blue-100 transition-colors">
              A2ZEE
            </span>
            <span 
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 border border-white/20 text-[11px] font-bold tracking-wider uppercase backdrop-blur-md max-w-[200px] sm:max-w-[280px] min-w-0 truncate overflow-hidden text-ellipsis whitespace-nowrap shadow-xs" 
              title={adminBadge}
            >
              <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{adminBadge}</span>
            </span>
          </Link>
        </div>

        {/* Right Controls: Sync, Logout & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Sync / Refresh Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadAdminData()}
            disabled={isLoading}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-md h-9 px-3 text-xs font-bold rounded-xl transition-all duration-150 disabled:opacity-50"
            title="Refresh live data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-300' : 'text-white'}`} />
            <span className="hidden sm:inline">{isLoading ? 'Syncing...' : 'Sync'}</span>
          </Button>

          {/* Log Out Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="hidden sm:inline-flex bg-white/10 hover:bg-rose-600/30 text-white hover:text-white border-white/20 hover:border-rose-400/40 backdrop-blur-md h-9 px-3.5 text-xs font-bold rounded-xl transition-all duration-150 group"
            title="Log out of Admin Portal"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-200 group-hover:text-white transition-colors" />
            <span>Log Out</span>
          </Button>

          {/* Mobile Hamburger Toggle Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-md h-9 w-9 rounded-xl transition-all"
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </Button>
        </div>
      </div>

    </header>
  );
}
