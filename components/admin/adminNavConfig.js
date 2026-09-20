import { 
  BarChart3, ClipboardList, Landmark, Sparkles, HardHat, Users, ShieldAlert 
} from 'lucide-react';

export function getAdminNavItems({ bookingsCount = 0, workersCount = 0, customersCount = 0, pendingCount = 0 } = {}) {
  return [
    { 
      id: 'overview', 
      label: 'Executive Overview', 
      shortLabel: 'Overview',
      subtitle: 'Executive metrics, dispatches volume and federation revenue analytics',
      href: '/admin',
      icon: BarChart3,
    },
    { 
      id: 'dispatches', 
      label: 'Bookings & Dispatches', 
      shortLabel: 'Dispatches',
      subtitle: 'Live bookings, assignment dispatch and cooperative tracking',
      href: '/admin/dispatches',
      icon: ClipboardList, 
      count: bookingsCount,
    },
    { 
      id: 'earnings', 
      label: 'Cooperative Earnings', 
      shortLabel: 'Earnings',
      subtitle: '75% Worker wallet, 10% Society ops, 10% Platform & 5% Welfare trust split',
      href: '/admin/earnings',
      icon: Landmark,
    },
    { 
      id: 'forecast', 
      label: 'AI Demand Forecast', 
      shortLabel: 'AI Forecast',
      subtitle: 'Hexagonal demand spatial distribution and worker redeployment',
      href: '/admin/forecast',
      icon: Sparkles,
    },
    { 
      id: 'workers', 
      label: 'Artisan Directory', 
      shortLabel: 'Artisans',
      subtitle: 'Verified artisans roster, skill levels and cooperative allocation',
      href: '/admin/workers',
      icon: HardHat, 
      count: workersCount,
    },
    { 
      id: 'customers', 
      label: 'Citizen Roster', 
      shortLabel: 'Citizens',
      subtitle: 'Registered citizen consumers, addresses and order frequency',
      href: '/admin/customers',
      icon: Users, 
      count: customersCount,
    },
    { 
      id: 'verifications', 
      label: 'Approvals Queue', 
      shortLabel: 'Approvals',
      subtitle: 'Pending artisan KYC verification and cooperative admission',
      href: '/admin/verifications',
      icon: ShieldAlert, 
      count: pendingCount, 
      alert: pendingCount > 0,
    },
  ];
}
