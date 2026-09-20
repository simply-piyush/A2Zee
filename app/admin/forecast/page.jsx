'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { AdminCanvas } from '@/components/admin/AdminCanvas';
import { DemandForecastTab } from '@/components/admin/DemandForecastTab';

export default function AdminForecastPage() {
  return (
    <AdminCanvas
      title="AI Demand Forecast"
      subtitle="Hexagonal spatial demand distribution, clustering hotspots and artisan rebalancing"
      icon={Sparkles}
    >
      <DemandForecastTab />
    </AdminCanvas>
  );
}
