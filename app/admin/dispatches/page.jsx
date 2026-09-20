'use client';

import React from 'react';
import { ClipboardList } from 'lucide-react';
import { AdminCanvas } from '@/components/admin/AdminCanvas';
import { BookingsTab } from '@/components/admin/BookingsTab';
import { useAdmin } from '@/components/admin/AdminContext';

export default function AdminDispatchesPage() {
  const { bookingsList, setSelectedBooking } = useAdmin();

  return (
    <AdminCanvas
      title="Bookings & Dispatches"
      subtitle="Real-time order dispatches, live cooperative allocation and gig tracking"
      icon={ClipboardList}
      badgeCount={bookingsList.length}
    >
      <BookingsTab
        bookings={bookingsList}
        onSelectBooking={(b) => setSelectedBooking(b)}
      />
    </AdminCanvas>
  );
}
