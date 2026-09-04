'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function UserProfileView({
  userName = 'Piyush Customer',
  userPhone = '+91 98765 43210',
  userLocation = 'Madhyamgram, Kolkata',
  userCoords = { lat: 22.6950, lng: 88.4550 },
  onBack,
}) {
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
    <div className="flex-1 flex flex-col max-w-md md:max-w-2xl mx-auto w-full pb-16 animate-in fade-in duration-200">
      <div 
        className="rounded-b-[36px] px-6 pt-8 pb-6 shadow-lg text-white"
        style={{
          background: 'radial-gradient(circle at top, #275294 0%, #1F4072 100%)'
        }}
      >
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display text-2xl tracking-wider uppercase text-white">
            USER PROFILE
          </h1>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1">
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-[#1F4072] text-white text-3xl font-bold flex items-center justify-center mx-auto shadow-md border-4 border-[#FFF6F0]">
            P
          </div>
          <h2 className="font-display text-2xl text-gray-900">{userName}</h2>
          <p className="text-xs text-gray-500 font-normal">{userPhone}</p>
          <Badge className="bg-[#1F4072]/15 text-[#1F4072] font-normal border border-[#1F4072]/30">
            Verified Citizen Customer
          </Badge>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2">
          <h3 className="font-normal text-sm text-gray-800">Saved Address</h3>
          <p className="text-xs text-gray-600 font-normal">{userLocation}</p>
          <p className="text-[11px] text-gray-400 font-normal">GPS: {userCoords.lat}° N, {userCoords.lng}° E</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-display text-sm py-3.5 rounded-2xl shadow transition-colors cursor-pointer"
          >
            LOG OUT OF ACCOUNT
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfileView;
