'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { AdminCanvas } from '@/components/admin/AdminCanvas';
import { AdminMetricsBanner } from '@/components/admin/AdminMetricsBanner';
import { useAdmin } from '@/components/admin/AdminContext';

export default function AdminOverviewPage() {
  const { stats, loadAdminData, isLoading } = useAdmin();

  return (
    <AdminCanvas
      title="Executive Overview"
      subtitle="Federation metrics, dispatch volume, workforce analytics and revenue split partition"
      icon={BarChart3}
    >
      <AdminMetricsBanner
        stats={stats}
        onRefresh={loadAdminData}
        isLoading={isLoading}
      />
    </AdminCanvas>
  );
}
