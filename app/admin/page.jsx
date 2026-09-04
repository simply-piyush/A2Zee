'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Wallet, ShieldCheck, TrendingUp, CheckCircle2, 
  XCircle, AlertCircle, Calendar, Star, MapPin, Phone, Mail, 
  Search, RefreshCw, BarChart3, Layers, Clock, ArrowUpRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications' | 'bookings' | 'workers' | 'revenue'
  const [stats, setStats] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');
  const [actionNoticeType, setActionNoticeType] = useState('success');
  const [searchWorker, setSearchWorker] = useState('');
  const [filterBookingStatus, setFilterBookingStatus] = useState('ALL');

  // Load Admin Stats & Verification Queue
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // 1. Load Stats
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // 2. Load Pending Verifications
      const verifRes = await fetch('/api/admin/verifications?status=PENDING');
      const verifData = await verifRes.json();
      if (verifData.success) {
        setPendingVerifications(verifData.data);
      }
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handle Verify / Reject Artisan
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
        setActionNotice(`Artisan ${data.data.name} has been ${status === 'VERIFIED' ? 'APPROVED & VERIFIED' : 'REJECTED'}.`);
        // Refresh data
        loadAdminData();
      }
    } catch (err) {
      console.error('Error verifying worker:', err);
    }
  };

  const filteredBookings = stats?.recentBookings?.filter((b) => {
    if (filterBookingStatus === 'ALL') return true;
    return b.status === filterBookingStatus;
  }) || [];

  const filteredWorkers = stats?.workers?.filter((w) => {
    const term = searchWorker.toLowerCase();
    return (
      w.name.toLowerCase().includes(term) ||
      w.cooperative.toLowerCase().includes(term) ||
      w.skills.some((s) => s.toLowerCase().includes(term))
    );
  }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 pb-28 font-secondary">
      
      {/* ========================================================================= */}
      {/* TOP APEX FEDERATION HEADER                                                */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F4072]/10 text-[#1F4072] text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>State Apex Labour Cooperative Federation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Federation Governance & Administration Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Overseeing Pragati & Navchetana Labour Cooperatives • Ministry of Cooperation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAdminData}
            className="h-10 text-xs font-bold gap-1.5 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Live Data</span>
          </Button>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in-50 ${
          actionNoticeType === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice('')} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4 REVENUE & WORKLOAD KPI METRICS                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Gross Booking Volume
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            ₹{(stats?.revenueSplit?.totalGrossRevenue || 142000).toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center pt-0.5">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> 100% Transparent Split
          </span>
        </div>

        {/* 85% Worker Share */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            85% Worker Payouts
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-display">
            ₹{(stats?.revenueSplit?.workerWallet85 || 120700).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Direct worker wallet</span>
        </div>

        {/* 5% Welfare Trust */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            5% Worker Welfare Trust
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-display">
            ₹{(stats?.revenueSplit?.welfareTrust5 || 7100).toLocaleString()}
          </p>
          <span className="text-[11px] text-indigo-700 font-semibold">PMSBY & PMJJBY Insurance</span>
        </div>

        {/* Total Verified Artisans */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Verified Artisan Roster
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1F4072] font-display">
            {stats?.overview?.totalWorkers || 20} Artisans
          </p>
          <span className="text-[11px] text-amber-600 font-bold">
            ⭐ {stats?.overview?.averageRating || 4.8} Avg Platform Rating
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE-FIRST NAVIGATION TABS                                              */}
      {/* ========================================================================= */}
      <div className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'verifications'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Verification Queue</span>
          {pendingVerifications.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
              {pendingVerifications.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'bookings'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#1F4072]" />
          <span>All Bookings ({stats?.overview?.totalBookings || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          className={`py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'workers'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>Worker Directory ({stats?.overview?.totalWorkers || 20})</span>
        </button>

        <button
          onClick={() => setActiveTab('revenue')}
          className={`py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'revenue'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-4 h-4 text-indigo-600" />
          <span>85-10-5 Split Ledger</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ARTISAN VERIFICATION QUEUE (Approve / Reject Action)               */}
      {/* ========================================================================= */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Pending Artisan Verification Requests
              </h2>
              <p className="text-xs text-slate-500">
                Newly registered workers must be verified by cooperative admin before receiving gig dispatches.
              </p>
            </div>
            <Badge variant="warning">{pendingVerifications.length} Pending Approval</Badge>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingVerifications.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-2xl border border-amber-200/90 shadow-xs p-5 sm:p-6 space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{w.name}</h3>
                      <Badge variant="warning" className="text-[10px]">PENDING VERIFICATION</Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Cooperative: <strong>{w.cooperative}</strong> • Primary Trade: <strong className="text-[#1F4072]">{w.skills.join(', ') || 'Artisan'}</strong>
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {w.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {w.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {w.latitude?.toFixed(4)}° N, {w.longitude?.toFixed(4)}° E
                      </span>
                    </div>
                  </div>

                  {/* Actions: Approve / Reject */}
                  <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyArtisan(w.id, 'REJECTED')}
                      className="text-rose-600 hover:bg-rose-50 border-rose-200 h-10 text-xs font-bold gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Application</span>
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleVerifyArtisan(w.id, 'VERIFIED')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 text-xs font-bold gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Verify Artisan</span>
                    </Button>
                  </div>
                </div>

                {w.bio && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200/60">
                    <span className="font-semibold text-slate-800 block mb-0.5">Experience & Credentials:</span>
                    <p>{w.bio}</p>
                  </div>
                )}
              </div>
            ))}

            {pendingVerifications.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-slate-900 text-base">All Artisan Applications Verified</h3>
                <p className="text-xs text-slate-500">
                  There are currently no unverified artisan registrations awaiting approval.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALL PLATFORM BOOKINGS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Live Platform Bookings Monitor
              </h2>
              <p className="text-xs text-slate-500">
                Track status, assigned artisan, scheduled window, and emergency dispatches.
              </p>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
              {['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterBookingStatus(st)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    filterBookingStatus === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-slate-300 transition-all text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#1F4072]">{b.bookingCode}</span>
                    <Badge variant={b.isEmergency ? 'destructive' : 'default'} className="text-[10px]">
                      {b.isEmergency ? '⚡ Emergency' : '📅 Scheduled'}
                    </Badge>
                    <Badge variant={b.status === 'COMPLETED' ? 'success' : 'warning'} className="text-[10px]">
                      {b.status}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{b.service}</h4>
                  <p className="text-slate-500">
                    Customer: <strong className="text-slate-700">{b.customerName}</strong> • Address: {b.address}
                  </p>
                </div>

                <div className="flex flex-col md:items-end gap-1 shrink-0">
                  <span className="font-extrabold text-base text-slate-900">₹{b.finalPrice}</span>
                  <p className="text-slate-500">
                    Assigned: <strong className="text-emerald-700">{b.workerName}</strong> ({b.cooperative || 'Pragati Coop'})
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {b.scheduledStartTime ? new Date(b.scheduledStartTime).toLocaleString() : 'Scheduled Today'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WORKER DIRECTORY (20 Artisans across 2 Cooperatives)               */}
      {/* ========================================================================= */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Cooperative Artisans Directory
              </h2>
              <p className="text-xs text-slate-500">
                20 verified artisans across Pragati & Navchetana Labour Cooperatives covering all 10 trades.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
              <Input
                type="text"
                placeholder="Search by name, trade, coop..."
                value={searchWorker}
                onChange={(e) => setSearchWorker(e.target.value)}
                className="pl-8 h-10 text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkers.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm text-slate-900">{w.name}</h4>
                    <span className="text-[11px] text-slate-500 block">{w.cooperative}</span>
                  </div>
                  <Badge variant={w.verificationStatus === 'VERIFIED' ? 'success' : 'warning'} className="text-[10px]">
                    {w.verificationStatus}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="font-bold text-[#1F4072]">{w.skills.join(', ') || 'Tradesperson'}</span>
                  <span className="text-amber-600 font-bold">⭐ {w.rating} ({w.totalJobs} jobs)</span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Status: <strong className={w.availabilityStatus === 'AVAILABLE' ? 'text-emerald-600' : 'text-slate-500'}>{w.availabilityStatus}</strong></span>
                  <span>{w.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REVENUE & WELFARE TRUST 85-10-5 LEDGER                             */}
      {/* ========================================================================= */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Ethical 85-10-5 Cooperative Revenue Partitioning
            </h2>
            <p className="text-xs text-slate-500">
              Mandated by Ministry of Cooperation bylaws — zero corporate extraction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 85% Worker Payout */}
            <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">85% Worker Take-Home</span>
                <Badge variant="success">85% Share</Badge>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 font-display">
                ₹{(stats?.revenueSplit?.workerWallet85 || 120700).toLocaleString()}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Directly credited to worker take-home wallets without middleman commission.
              </p>
            </div>

            {/* 10% Society Ops */}
            <div className="bg-white p-6 rounded-3xl border border-blue-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1F4072] uppercase tracking-wider">10% Society Operations</span>
                <Badge variant="default">10% Share</Badge>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 font-display">
                ₹{(stats?.revenueSplit?.societyOperations10 || 14200).toLocaleString()}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Funds grassroots primary cooperative tool banks, administrative overhead, and ward-level centers.
              </p>
            </div>

            {/* 5% Welfare Trust */}
            <div className="bg-white p-6 rounded-3xl border border-indigo-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">5% Welfare & PMSBY Trust</span>
                <Badge variant="ncct">5% Share</Badge>
              </div>
              <p className="text-3xl font-extrabold text-indigo-600 font-display">
                ₹{(stats?.revenueSplit?.welfareTrust5 || 7100).toLocaleString()}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated social security reserve funding accident insurance (PMSBY), life cover (PMJJBY), and healthcare.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
