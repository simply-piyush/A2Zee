'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [stats, setStats] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionNotice, setActionNotice] = useState('');
  const [actionNoticeType, setActionNoticeType] = useState('success');
  const [showKpiBanner, setShowKpiBanner] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load Admin Stats & Verification Queue
  const loadAdminData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      // 1. Load Stats & Bookings
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data);
          // Keep open modal in sync if status changed
          setSelectedBooking((prev) => {
            if (!prev) return null;
            const updated = statsData.data.recentBookings?.find(
              (b) => b.id === prev.id || b.bookingCode === prev.id || b.bookingCode === prev.bookingCode
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
  }, []);

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
  }, [loadAdminData]);

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
        loadAdminData();
      }
    } catch (err) {
      console.error('Error updating worker status:', err);
    }
  };

  // Handle Admin Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn(e);
    }
    document.cookie = 'a2zee_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;';
    window.location.replace('/auth');
  };

  const bookingsList = stats?.recentBookings || [];
  const workersList = stats?.workers || [];
  const customersList = stats?.customers || [];
  const adminBadge = stats?.isCooperativeScoped
    ? stats?.activeCooperativeName || 'Cooperative Admin'
    : 'Apex Admin';

  const value = {
    stats,
    setStats,
    pendingVerifications,
    isLoading,
    selectedBooking,
    setSelectedBooking,
    actionNotice,
    setActionNotice,
    actionNoticeType,
    setActionNoticeType,
    showKpiBanner,
    setShowKpiBanner,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    loadAdminData,
    handleVerifyArtisan,
    handleLogout,
    bookingsList,
    workersList,
    customersList,
    adminBadge,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return ctx;
}
