'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAdmin } from './AdminContext';
import { getAdminNavItems } from './adminNavConfig';

export function AdminSidebar() {
  const pathname = usePathname();

  const { 
    bookingsList, 
    workersList, 
    customersList, 
    pendingVerifications, 
  } = useAdmin();

  const navItems = getAdminNavItems({
    bookingsCount: bookingsList.length,
    workersCount: workersList.length,
    customersCount: customersList.length,
    pendingCount: pendingVerifications.length,
  });

  return (
    <aside className="hidden md:flex flex-col items-center py-5 px-3 lg:px-4 gap-3 shrink-0 select-none z-20">
      
      {/* Stack of Rounded Square Navigation Buttons */}
      <div className="flex flex-col items-center gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.id === 'overview' && (pathname === '/admin' || pathname === '/admin/overview'));

          return (
            <div key={item.id} className="relative group flex items-center justify-center">
              <Link href={item.href} className="outline-none focus:outline-none">
                <Button
                  type="button"
                  variant=""
                  className={`relative w-11 h-11 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center p-0 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#1F4072] shadow-lg shadow-black/25 scale-105 ring-2 ring-white/80 hover:bg-white hover:text-[#1F4072]'
                      : ' text-white/80 hover:bg-white/20 hover:text-white hover:scale-105 border border-white/15 backdrop-blur-xs'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  
                  {/* Alert / Count Badge */}
                  {item.alert ? (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 ring-2 ring-[#1F4072] animate-pulse">
                      {item.count}
                    </span>
                  ) : item.count !== undefined && item.count > 0 ? (
                    <span className={`absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-black ring-2 ring-[#1F4072] ${
                      isActive ? 'bg-[#1F4072] text-white' : 'bg-white/20 text-white'
                    }`}>
                      {item.count}
                    </span>
                  ) : null}
                </Button>
              </Link>

              {/* Interactive Tooltip on Hover */}
              <div className="pointer-events-none absolute left-full ml-3.5 z-50 hidden md:flex items-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                <div className="bg-slate-950/95 text-white border border-white/15 px-3 py-1.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 whitespace-nowrap">
                  <span className="text-xs font-bold">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 text-white font-black">
                      {item.count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </aside>
  );
}
