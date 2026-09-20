'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { AdminCanvas } from '@/components/admin/AdminCanvas';
import { CustomersTab } from '@/components/admin/CustomersTab';
import { useAdmin } from '@/components/admin/AdminContext';

export default function AdminCustomersPage() {
  const { customersList } = useAdmin();

  return (
    <AdminCanvas
      title="Citizen Roster"
      subtitle="Registered citizen consumers, delivery addresses and cooperative gig demand history"
      icon={Users}
      badgeCount={customersList.length}
    >
      <CustomersTab customers={customersList} />
    </AdminCanvas>
  );
}
