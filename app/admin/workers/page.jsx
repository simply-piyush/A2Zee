'use client';

import React from 'react';
import { HardHat } from 'lucide-react';
import { AdminCanvas } from '@/components/admin/AdminCanvas';
import { WorkersTab } from '@/components/admin/WorkersTab';
import { useAdmin } from '@/components/admin/AdminContext';

export default function AdminWorkersPage() {
  const { workersList, stats } = useAdmin();

  return (
    <AdminCanvas
      title="Artisan Directory"
      subtitle="Verified local karigars roster, credential verification and cooperative society linkage"
      icon={HardHat}
      badgeCount={workersList.length}
    >
      <WorkersTab
        workers={workersList}
        cooperativeName={stats?.activeCooperativeName}
        isCooperativeScoped={stats?.isCooperativeScoped}
      />
    </AdminCanvas>
  );
}
