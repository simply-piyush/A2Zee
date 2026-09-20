'use client';

import React from 'react';
import { Landmark } from 'lucide-react';
import { AdminCanvas } from '@/components/admin/AdminCanvas';
import { RevenueLedgerTab } from '@/components/admin/RevenueLedgerTab';
import { useAdmin } from '@/components/admin/AdminContext';

export default function AdminEarningsPage() {
  const { stats } = useAdmin();

  return (
    <AdminCanvas
      title="Cooperative Earnings & 75-10-10-5 Ledger"
      subtitle="Transparent democratic revenue partition: 75% Artisan Wallet, 10% Society Operations, 10% Platform Ops, and 5% Social Security Trust"
      icon={Landmark}
    >
      <RevenueLedgerTab stats={stats} />
    </AdminCanvas>
  );
}
