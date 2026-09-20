'use client';

import React from 'react';
import { HeaderBackground } from '@/components/ui/header-background';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminMobileDrawer } from './AdminMobileDrawer';
import { BookingDetailModal } from './BookingDetailModal';
import { useAdmin } from './AdminContext';

export function AdminShell({ children }) {
  const { selectedBooking, setSelectedBooking } = useAdmin();

  return (
    <div className="min-h-screen md:h-screen md:max-h-screen md:overflow-hidden w-full flex flex-col font-secondary selection:bg-[#1F4072]/40 selection:text-white relative">
      
      {/* Full Window Blue Canvas: Dimmed Wavy Radial Pattern without black gradient */}
      <HeaderBackground className="z-0" showVignette={false} baseGradient="bg-[#1F4072]" />

      {/* Content Wrapper Above HeaderBackground */}
      <div className="relative z-10 flex flex-col flex-1 w-full min-h-0">
        
        {/* Top Header */}
        <AdminHeader />

        {/* Mobile Drawer (Accessible via hamburger) */}
        <AdminMobileDrawer />

        {/* Body: Left Sidebar (Desktop Fixed) + Injected Main Canvas (with rounded corners) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          <AdminSidebar />
          {children}
        </div>

      </div>

      {/* Booking Details Modal Popup (Mounts across all admin routes) */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
      />

    </div>
  );
}
