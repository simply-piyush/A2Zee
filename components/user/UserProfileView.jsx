'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Receipt, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  ChevronRight, 
  LogOut,
  MapPin
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TopHeaderBanner } from '@/components/ui/top-header-banner';
import { EditProfileModal } from './EditProfileModal';
import { SavedAddressesCard } from './SavedAddressesCard';
import { AddressAddDialog } from './AddressAddDialog';

export function UserProfileView({
  userName = 'Priyush Customer',
  userPhone = '+91 98765 43210',
  userEmail = 'priyush@a2zee.local',
  userGender = 'Male',
  addresses = [],
  onAddAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onUpdateProfile,
  myBookings = [],
  onBack,
}) {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);

  const [currentName, setCurrentName] = useState(userName);
  const [currentPhone, setCurrentPhone] = useState(userPhone);
  const [currentEmail, setCurrentEmail] = useState(userEmail);
  const [currentGender, setCurrentGender] = useState(userGender);

  const handleSaveProfile = async (updatedData) => {
    setCurrentName(updatedData.name);
    setCurrentPhone(updatedData.phone);
    setCurrentEmail(updatedData.email);
    setCurrentGender(updatedData.gender);

    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
    } catch (e) {
      console.warn('Profile API update warning:', e);
    }

    if (onUpdateProfile) {
      onUpdateProfile(updatedData);
    }
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

  return (
    <div className="flex-1 flex flex-col max-w-md md:max-w-3xl mx-auto w-full pb-20 animate-in fade-in duration-200">
      
      {/* Top Header Banner */}
      <TopHeaderBanner
        title="USER PROFILE"
        onBack={onBack}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        initialData={{
          name: currentName,
          phone: currentPhone,
          email: currentEmail,
          gender: currentGender,
        }}
        onSave={handleSaveProfile}
      />

      {/* Add Address Modal */}
      <AddressAddDialog
        isOpen={isAddAddressOpen}
        onClose={() => setIsAddAddressOpen(false)}
        currentCount={addresses.length}
        onAddAddress={onAddAddress}
      />

      <div className="p-6 space-y-6 flex-1">
        
        {/* 1. Profile Card with flex-direction row (Avatar + Column Details) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-row items-center gap-5">
          
          {/* Profile Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-[#1F4072] text-white text-3xl font-bold flex items-center justify-center flex-shrink-0 shadow-md border-2 border-white">
            {currentName[0]?.toUpperCase() || 'P'}
          </div>

          {/* User Details & Edit Profile in flex-direction col */}
          <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-lg sm:text-xl text-slate-900 truncate">
                {currentName}
              </h2>
              <Badge variant="primary" className="text-[10px] px-2 py-0.5">
                {currentGender}
              </Badge>
            </div>

            <div className="space-y-0.5 text-xs text-slate-500">
              <p className="flex items-center gap-1.5 truncate">
                <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span>{currentPhone}</span>
              </p>
              <p className="flex items-center gap-1.5 truncate">
                <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span>{currentEmail}</span>
              </p>
            </div>

            {/* Edit Profile Button */}
            <div className="pt-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditProfileOpen(true)}
                className="h-7 text-xs px-3 rounded-lg border-[#1F4072]/40 text-[#1F4072] hover:bg-[#1F4072] hover:text-white cursor-pointer transition-colors"
              >
                Edit Profile
              </Button>
            </div>
          </div>

        </div>  

        {/* 2. Simple List: 'Your Orders' option revealing separate /user/order page */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <Link
            href="/user/order"
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] text-[#1F4072] flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Your Orders
                </h3>
                <p className="text-xs text-slate-500">
                  {myBookings.length} {myBookings.length === 1 ? 'order' : 'orders'} placed • View receipts & status
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1F4072] bg-blue-50 px-2.5 py-1 rounded-full">
                {myBookings.length}
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </Link>
        </div>

        {/* 3. Saved Addresses Section (max 5) */}
        <SavedAddressesCard
          addresses={addresses}
          onSetDefault={onSetDefaultAddress}
          onDeleteAddress={onDeleteAddress}
          onOpenAddModal={() => setIsAddAddressOpen(true)}
        />

        {/* 4. Logout Action with ghost variant */}
        <div className="pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            className="w-full h-12 rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 gap-2"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>LOG OUT OF ACCOUNT</span>
          </Button>
        </div>

      </div>
    </div>
  );
}

export default UserProfileView;
