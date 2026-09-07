'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  ChevronRight, 
  LogOut,
  MapPin,
  Building2,
  Wrench,
  Award,
  Wallet,
  CheckCircle2,
  Edit2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TopHeaderBanner } from '@/components/ui/top-header-banner';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function WorkerProfileView({
  worker,
  onBack,
  onOpenWallet,
  onUpdateWorker,
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState(worker?.name || 'Ramesh Kumar');
  const [phone, setPhone] = useState(worker?.phone || '+91 98765 43210');
  const [email, setEmail] = useState(worker?.email || 'ramesh.kumar@a2zee.local');
  const [trade, setTrade] = useState(worker?.trade || 'Electrician');

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updated = { ...worker, name, phone, email, trade };
    onUpdateWorker?.(updated);
    setIsEditModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn(e);
    }
    document.cookie = "a2zee_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;";
    window.location.replace('/auth');
  };

  const skillsList = worker?.skills || [
    'Electrician', 'Ceiling Fan Repair', 'MCB Switchboard', 
    'Home Wiring', 'Inverter Servicing', 'Appliance Diagnostics'
  ];

  return (
    <div className="flex-1 flex flex-col max-w-md md:max-w-3xl mx-auto w-full pb-24 animate-in fade-in duration-200">
      
      {/* Top Header Banner matching user/create-job/page.jsx */}
      <TopHeaderBanner
        title="ARTISAN PROFILE"
        subtitle="Government NCCT Tier-1 Certified • Member Cooperative Society"
        onBack={onBack}
      />

      {/* Edit Worker Profile Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Artisan Profile"
        description="Update your contact details and trade specialization"
        className="max-w-md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Full Legal Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Mobile Number</label>
            <Input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Primary Trade</label>
            <Input
              type="text"
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
              className="h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-10 px-5 font-bold bg-[#1F4072] hover:bg-[#163056]"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      <div className="p-6 space-y-6 flex-1">
        
        {/* 1. Profile Card with flex-direction row (Avatar + Column Details) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-row items-center gap-5">
          
          {/* Profile Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-[#1F4072] text-white text-3xl font-bold flex items-center justify-center flex-shrink-0 shadow-md border-2 border-white font-brand">
            {name[0]?.toUpperCase() || 'R'}
          </div>

          {/* User Details & Edit Profile in flex-direction col */}
          <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-lg sm:text-xl text-slate-900 truncate">
                {name}
              </h2>
              <Badge variant="ncct" className="text-[10px] px-2 py-0.5 font-bold">
                {worker?.ncctTier || 'NCCT Tier-1'}
              </Badge>
            </div>

            <p className="text-xs font-semibold text-[#1F4072]">
              {trade} • {worker?.society || 'Pragati Labour Cooperative'}
            </p>

            <div className="space-y-0.5 text-xs text-slate-500 pt-0.5">
              <p className="flex items-center gap-1.5 truncate">
                <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span>{phone}</span>
              </p>
              <p className="flex items-center gap-1.5 truncate">
                <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span>{email}</span>
              </p>
            </div>

            {/* Edit Profile Button */}
            <div className="pt-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="h-7 text-xs px-3 rounded-lg border-[#1F4072]/40 text-[#1F4072] hover:bg-[#1F4072] hover:text-white cursor-pointer transition-colors"
              >
                <Edit2 className="w-3 h-3 mr-1" />
                <span>Edit Profile</span>
              </Button>
            </div>
          </div>

        </div>  

        {/* 2. Simple List: 'Your Completed Gigs & Earnings' option matching UserProfileView */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={onOpenWallet}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] text-[#1F4072] flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Your Completed Gigs & Settlements
                </h3>
                <p className="text-xs text-slate-500">
                  52 gigs completed • 85% net payout wallet & ledger
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                ₹4,200.00
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </button>
        </div>

        {/* 3. Cooperative Society & Operating Cluster */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1F4072]" />
              <span>Affiliated Cooperative Society</span>
            </h3>
            <Badge variant="success" className="text-[10px]">Good Standing</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Society Name</span>
              <span className="font-bold text-slate-800">{worker?.society || 'Pragati Labour Cooperative Society'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Registration Number</span>
              <span className="font-mono font-bold text-slate-800">WB-COOP-2024-0412</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Base Cluster Node</span>
              <span className="font-bold text-slate-800">Madhyamgram, North 24 Parganas</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Apex Federation</span>
              <span className="font-bold text-slate-800">West Bengal State Apex Body</span>
            </div>
          </div>
        </div>

        {/* 4. Verified Trade Skills & Equipment */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#1F4072]" />
              <span>Verified Trade Skills</span>
            </h3>
            <span className="text-xs text-slate-400">{skillsList.length} skills</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {skillsList.map((skill, idx) => (
              <Badge 
                key={idx} 
                variant="primary" 
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#1F4072]/5 text-[#1F4072] border-[#1F4072]/20 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{skill}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* 5. Direct Settlement Banking / UPI Account */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#1F4072]" />
              <span>Direct Settlement Account</span>
            </h3>
            <Badge variant="success" className="text-[10px]">Verified for 85% Payouts</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Registered UPI VPA</span>
              <span className="font-mono font-bold text-slate-800">ramesh.kumar@okhdfcbank</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Bank Account</span>
              <span className="font-mono font-bold text-slate-800">HDFC Bank ••••••4129 (IFSC: HDFC0001248)</span>
            </div>
          </div>
        </div>

        {/* 6. Logout Action with ghost variant matching UserProfileView */}
        <div className="pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            className="w-full h-12 rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 gap-2"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>LOG OUT OF ARTISAN ACCOUNT</span>
          </Button>
        </div>

      </div>
    </div>
  );
}

export default WorkerProfileView;
