'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { AdminCanvas } from '@/components/admin/AdminCanvas';
import { WorkerApprovalsTab } from '@/components/admin/WorkerApprovalsTab';
import { useAdmin } from '@/components/admin/AdminContext';

export default function AdminVerificationsPage() {
  const { pendingVerifications, handleVerifyArtisan, stats } = useAdmin();

  return (
    <AdminCanvas
      title="Approvals Queue"
      subtitle="Pending artisan KYC review, police certificate validation and cooperative admission"
      icon={ShieldAlert}
      badgeCount={pendingVerifications.length}
    >
      <WorkerApprovalsTab
        pendingVerifications={pendingVerifications}
        onVerifyArtisan={handleVerifyArtisan}
        cooperativeName={stats?.activeCooperativeName}
        isCooperativeScoped={stats?.isCooperativeScoped}
      />
    </AdminCanvas>
  );
}
