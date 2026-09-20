'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  X, ShieldCheck, RefreshCw, LogOut, ChevronRight, Activity, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBackground } from '@/components/ui/header-background';
import { useAdmin } from './AdminContext';
import { getAdminNavItems } from './adminNavConfig';

export function AdminMobileDrawer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTabParam = searchParams.get('tab') || 'forecast';

  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    adminBadge,
    stats,
    bookingsList,
    workersList,
    customersList,
    pendingVerifications,
    isLoading,
    loadAdminData,
    handleLogout
  } = useAdmin();

  if (!isMobileMenuOpen) return null;

  const navItems = getAdminNavItems({
    bookingsCount: bookingsList.length,
    workersCount: workersList.length,
    customersCount: customersList.length,
    pendingCount: pendingVerifications.length,
  });

  return (
    <div className="md:hidden fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">

      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-[85%] max-w-sm h-full bg-[#163056] text-white shadow-2xl flex flex-col z-10 border-l border-white/20 overflow-hidden animate-in slide-in-from-right duration-300">

        {/* Dimmed Wavy HeaderBackground in Drawer */}
        <HeaderBackground className="z-0" />

        {/* Drawer Content */}
        <div className="relative z-10 flex flex-col h-full p-5 justify-between">

          {/* Top Bar of Drawer: Brand & Close */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <span className="font-display text-2xl font-black tracking-wider uppercase">
                  A2ZEE
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-[10px] font-bold tracking-wider uppercase border border-white/20">
                  {adminBadge}
                </span>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:bg-white/20 rounded-xl h-9 w-9"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>




            {/* Navigation List */}
            <nav className="mt-5 space-y-2">
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-wider px-1">
                Admin Navigation
              </p>

              <div className="space-y-1.5 pt-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.id === 'overview' && (pathname === '/admin' || pathname === '/admin/overview'));

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all ${isActive
                          ? 'bg-white text-[#1F4072] font-bold shadow-md shadow-black/20 scale-[1.01]'
                          : 'bg-[#1F4072] text-white hover:bg-white/20 border border-white/10'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-[#1F4072]/10 text-[#1F4072]' : 'bg-white/10 text-white'
                          }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.alert ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-pulse">
                            {item.count} Action
                          </span>
                        ) : item.count !== undefined && item.count > 0 ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-[#1F4072]/15 text-[#1F4072]' : 'bg-white/20 text-white'
                            }`}>
                            {item.count}
                          </span>
                        ) : null}
                        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#1F4072]' : 'text-white/40'}`} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Bottom Actions: Sync & Logout */}
          <div className="pt-4 border-t border-white/15 space-y-2.5">
            <Button
              type="button"
              variant="default"
              onClick={() => {
                loadAdminData();
                setIsMobileMenuOpen(false);
              }}
              disabled={isLoading}
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-2xl h-11 text-xs font-bold gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Syncing Live Data...' : 'Sync Live Data'}</span>
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full bg-rose-600/80 hover:bg-rose-600 text-white border border-rose-400/30 rounded-2xl h-11 text-xs font-bold gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </Button>
          </div>

        </div>

      </div>

    </div>
  );
}
