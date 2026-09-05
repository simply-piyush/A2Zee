'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopHeaderBanner } from '@/components/ui/top-header-banner';
import { OrdersDataTable } from '@/components/user/OrdersDataTable';
import { Navbar } from '@/components/ui/navbar';
import { INITIAL_BOOKING } from '@/lib/data';

export default function UserOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      let fetchedOrders = [];

      try {
        const res = await fetch('/api/bookings');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            fetchedOrders = json.data;
          }
        }
      } catch (err) {
        console.warn('Could not fetch orders from API:', err);
      }

      // Check localStorage if API returns empty
      if (fetchedOrders.length === 0 && typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('a2zee_user_bookings');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              fetchedOrders = parsed;
            }
          }
        } catch (e) {
          console.warn('Could not parse localStorage bookings:', e);
        }
      }

      // If still empty, supply initial demo booking
      if (fetchedOrders.length === 0 && INITIAL_BOOKING) {
        fetchedOrders = [INITIAL_BOOKING];
      }

      setOrders(fetchedOrders);
      setLoading(false);
    }

    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF6F0] flex flex-col selection:bg-[#1F4072] selection:text-white">
      {/* Top Header Banner */}
      <TopHeaderBanner
        title="YOUR ORDERS"
        subtitle="Manage active services, invoices & cooperative receipts"
        backHref="/user"
      />

      {/* Main Container */}
      <main className="flex-1 max-w-md md:max-w-4xl mx-auto w-full p-4 sm:p-6 pb-28">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
            <div className="w-8 h-8 border-3 border-[#1F4072] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Loading your orders...</p>
            <p className="text-xs text-slate-400 mt-1">Retrieving cooperative service receipts</p>
          </div>
        ) : (
          <OrdersDataTable orders={orders} />
        )}
      </main>

      {/* Bottom Floating Navigation */}
      <Navbar
        activeTab="profile"
        setActiveTab={(tab) => {
          if (tab === 'home') router.push('/user');
          else if (tab === 'profile') router.push('/user');
          else if (tab === 'search') router.push('/user');
        }}
      />
    </div>
  );
}
