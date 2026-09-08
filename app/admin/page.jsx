'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertCircle, RefreshCw, X,
  ClipboardList, HardHat, Users, ShieldAlert, Landmark
} from 'lucide-react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AdminMetricsBanner } from '@/components/admin/AdminMetricsBanner';
import { BookingsTab } from '@/components/admin/BookingsTab';
import { WorkersTab } from '@/components/admin/WorkersTab';
import { CustomersTab } from '@/components/admin/CustomersTab';
import { WorkerApprovalsTab } from '@/components/admin/WorkerApprovalsTab';
import { RevenueLedgerTab } from '@/components/admin/RevenueLedgerTab';
import { BookingDetailModal } from '@/components/admin/BookingDetailModal';

export default function AdminDashboardPage() {
  // Default tab is 'bookings' as explicitly requested
  const [activeTab, setActiveTab] = useState('bookings');
  
  const [stats, setStats] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionNotice, setActionNotice] = useState('');
  const [actionNoticeType, setActionNoticeType] = useState('success');

  // Load Admin Stats & Verification Queue
  const loadAdminData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      // 1. Load Stats & Bookings
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data);
          // Keep open modal in sync if status changed
          setSelectedBooking(prev => {
            if (!prev) return null;
            const updated = statsData.data.recentBookings?.find(
              b => b.id === prev.id || b.bookingCode === prev.id || b.bookingCode === prev.bookingCode
            );
            return updated ? { ...prev, ...updated } : prev;
          });
        }
      }

      // 2. Load Pending Unverified Workers
      const verifRes = await fetch('/api/admin/verifications?status=PENDING');
      if (verifRes.ok) {
        const verifData = await verifRes.json();
        if (verifData.success) {
          setPendingVerifications(verifData.data);
        }
      }
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    // 5-second polling interval for live admin updates
    const interval = setInterval(() => loadAdminData(true), 5000);

    let channel;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('a2zee_booking_channel');
        channel.onmessage = (msg) => {
          if (msg.data?.type === 'STATUS_CHANGE' || msg.data?.type === 'NEW_BOOKING') {
            loadAdminData(true);
          }
        };
      } catch (e) {}
    }

    const handleSync = () => loadAdminData(true);
    window.addEventListener('storage', handleSync);
    window.addEventListener('a2zee-booking-status-change', handleSync);

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('a2zee-booking-status-change', handleSync);
    };
  }, []);

  // Handle Verify / Reject Worker
  const handleVerifyArtisan = async (workerId, status) => {
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, status }),
      });
      const data = await res.json();

      if (data.success) {
        setActionNoticeType(status === 'VERIFIED' ? 'success' : 'warning');
        setActionNotice(
          `Artisan ${data.data.name} has been ${status === 'VERIFIED' ? 'APPROVED & VERIFIED' : 'REJECTED'}.`
        );
        // Refresh live data
        loadAdminData();
      }
    } catch (err) {
      console.error('Error updating worker status:', err);
    }
  };

  const bookingsList = stats?.recentBookings || [];
  const workersList = stats?.workers || [];
  const customersList = stats?.customers || [];

  const ADMIN_TABS = [
    { id: 'bookings', label: 'Bookings & Dispatches', icon: ClipboardList, count: bookingsList.length },
    { id: 'workers', label: 'Artisan Directory', icon: HardHat, count: workersList.length },
    { id: 'customers', label: 'Citizen Roster', icon: Users, count: customersList.length },
    { id: 'verifications', label: 'Approvals Queue', icon: ShieldAlert, count: pendingVerifications.length, alert: pendingVerifications.length > 0 },
    { id: 'revenue', label: '85-10-5 Ledger', icon: Landmark },
  ];

  return (
    <div className="min-h-screen bg-[#FFF6F0] text-slate-900 font-secondary selection:bg-[#1F4072]/20 selection:text-[#1F4072] pb-12">
      
      {/* Top Header: Branded Wavy Landing Header in Admin Mode with Logout button */}
      <LandingHeader 
        variant="admin" 
        badge={stats?.isCooperativeScoped ? (stats?.activeCooperativeName || 'Cooperative Admin') : 'Apex Admin'} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Main Content Area */}
        <main className="w-full space-y-7">
          
          {/* Action Confirmation Toast */}
          {actionNotice && (
            <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
              actionNoticeType === 'success'
                ? 'bg-blue-50 border-blue-200 text-[#1F4072]'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1F4072] shrink-0" />
                <span>{actionNotice}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setActionNotice('')} 
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Executive Metrics Summary Banner */}
          <AdminMetricsBanner
            stats={stats}
            onRefresh={loadAdminData}
            isLoading={isLoading}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />

          {/* PRO MAX Glassmorphic Top Tab Navigation Bar */}
          <div className="sticky top-[68px] sm:top-[74px] z-30 py-2 -my-2 backdrop-blur-md bg-[#FFF6F0]/85 transition-all">
            <div className="flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-lg rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto no-scrollbar">
              {ADMIN_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer select-none ${
                      isActive
                        ? 'bg-[#1F4072] text-white shadow-xs scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        tab.alert
                          ? 'bg-amber-400 text-amber-950 animate-pulse'
                          : isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: ALL BOOKINGS (DEFAULT TAB) */}
          {activeTab === 'bookings' && (
            <BookingsTab
              bookings={bookingsList}
              onSelectBooking={(b) => setSelectedBooking(b)}
            />
          )}

          {/* TAB 2: WORKERS DIRECTORY */}
          {activeTab === 'workers' && (
            <WorkersTab
              workers={workersList}
              cooperativeName={stats?.activeCooperativeName}
              isCooperativeScoped={stats?.isCooperativeScoped}
            />
          )}

          {/* TAB 3: CUSTOMERS ROSTER */}
          {activeTab === 'customers' && (
            <CustomersTab
              customers={customersList}
            />
          )}

          {/* TAB 4: WORKER APPROVALS (UNVERIFIED WORKERS) */}
          {activeTab === 'verifications' && (
            <WorkerApprovalsTab
              pendingVerifications={pendingVerifications}
              onVerifyArtisan={handleVerifyArtisan}
              cooperativeName={stats?.activeCooperativeName}
              isCooperativeScoped={stats?.isCooperativeScoped}
            />
          )}

          {/* TAB 5: 85-10-5 REVENUE SPLIT */}
          {activeTab === 'revenue' && (
            <RevenueLedgerTab
              stats={stats}
            />
          )}

        </main>

      </div>

      {/* Booking Details Modal Popup (Styled like AddressAddModal with Timeline from Image 2) */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
      />

    </div>
  );
}
