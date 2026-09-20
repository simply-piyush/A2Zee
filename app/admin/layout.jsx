import React, { Suspense } from 'react';
import { AdminProvider } from '@/components/admin/AdminContext';
import { AdminShell } from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1F4072] flex items-center justify-center text-white text-xs font-mono">Loading Federation Admin...</div>}>
      <AdminProvider>
        <AdminShell>
          {children}
        </AdminShell>
      </AdminProvider>
    </Suspense>
  );
}
