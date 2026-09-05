'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Check, ShoppingCart, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBackground } from '@/components/ui/header-background';
import { AddressAddDialog } from './AddressAddDialog';

export function UserHomeHeader({
  userLocation = 'Madhyamgram, Kolkata',
  setUserLocation,
  setUserCoords,
  locationDropdownOpen,
  setLocationDropdownOpen,
  activeBookingsCount = 0,
  addresses = [],
  onAddAddress,
  onOpenCart,
  onOpenProfile,
  onOpenSearch,
  onExplore,
}) {
  const [mounted, setMounted] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectAddress = (addr) => {
    if (setUserLocation) setUserLocation(addr.addressLine || addr.label);
    if (setUserCoords && addr.latitude && addr.longitude) {
      setUserCoords({ lat: Number(addr.latitude), lng: Number(addr.longitude) });
    }
    setLocationDropdownOpen(false);
  };

  const activeAddress = addresses.find(
    (a) => a.addressLine === userLocation || (a.city && userLocation.includes(a.city))
  ) || addresses.find((a) => a.isDefault) || addresses[0];

  const locationTitle = activeAddress?.label || 'Home';

  return (
    <header 
      className="rounded-b-[36px] md:rounded-b-[48px] px-6 pt-12 sm:pt-14 pb-8 shadow-xl text-white relative overflow-hidden"
    >
      <HeaderBackground />

      {/* Quick Add Address Dialog */}
      <AddressAddDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        currentCount={addresses.length}
        onAddAddress={async (newAddr) => {
          if (onAddAddress) {
            await onAddAddress(newAddr);
          }
          if (setUserLocation) setUserLocation(newAddr.addressLine);
          if (setUserCoords && newAddr.latitude && newAddr.longitude) {
            setUserCoords({ lat: newAddr.latitude, lng: newAddr.longitude });
          }
          setLocationDropdownOpen(false);
        }}
      />

      <div className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto w-full space-y-6 relative z-10">
        
        {/* Top Row: Location Selector & User Avatar */}
        <div className="flex items-center justify-between">
          {/* Location Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
              className="flex items-center gap-2 text-left group hover:opacity-90 transition-opacity cursor-pointer"
            >
              <MapPin className="w-5 h-5 text-white flex-shrink-0" />
              <div>
                <div className="flex items-center gap-1 font-bold text-sm tracking-wide text-white">
                  <span>{locationTitle}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/80 group-hover:translate-y-0.5 transition-transform" />
                </div>
                <span className="text-xs text-white/75 font-normal block truncate max-w-[190px] sm:max-w-[260px]">
                  {userLocation}
                </span>
              </div>
            </button>

            {/* Location Dropdown Modal */}
            {locationDropdownOpen && (
              <div className="absolute top-12 left-0 z-50 bg-white text-gray-800 rounded-2xl shadow-2xl p-4 border border-gray-200 w-80 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Service Location ({addresses.length}/5)
                  </p>
                  {addresses.length < 5 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddDialogOpen(true);
                      }}
                      className="text-xs font-semibold text-[#1F4072] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New</span>
                    </button>
                  )}
                </div>

                {/* Saved Addresses List */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-none no-scrollbar">
                  {addresses.map((addr) => {
                    const isSelected = userLocation === addr.addressLine || userLocation.includes(addr.city);
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectAddress(addr)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#E5EEFF] text-[#1F4072] font-bold'
                            : 'hover:bg-gray-100 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="block text-[11px] font-bold uppercase text-slate-500">
                            {addr.label || 'Home'}
                          </span>
                          <span className="truncate block font-medium">
                            {addr.addressLine}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#1F4072] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Add Address button at bottom if < 5 */}
                {addresses.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddDialogOpen(true)}
                    className="w-full text-xs rounded-xl mt-1 border-dashed border-[#1F4072]/40 text-[#1F4072] hover:bg-[#1F4072]/5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Add New Address</span>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Right: Quick Cart & Avatar Circle "P" */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenCart}
              suppressHydrationWarning
              className="relative w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
              aria-label="View Cart / Bookings"
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && activeBookingsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1F4072] animate-bounce">
                  {activeBookingsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenProfile}
              className="w-10 h-10 rounded-full bg-[#E5EEFF] text-[#1F4072] font-black text-lg flex items-center justify-center shadow-md border-2 border-white hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              aria-label="User profile"
            >
              P
            </button>
          </div>
        </div>

        {/* Search Bar matching Figma: "Search for Jobs" */}
        <div 
          onClick={onOpenSearch}
          className="w-full bg-white text-gray-500 rounded-2xl px-5 py-3.5 shadow-md flex items-center gap-3 cursor-pointer hover:shadow-lg transition-all"
        >
          <Search className="w-5 h-5 text-gray-400" />
          <span className="text-base font-normal text-gray-500">Search for Jobs</span>
        </div>

        {/* Slogan Banner & Explore Button using Shadcn Button */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="max-w-[240px] md:max-w-md">
            <h2 className="font-display text-lg md:text-2xl text-white tracking-wide leading-tight uppercase">
              YOUR SOLUTION JUST ONE CLICK AWAY!
            </h2>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={onExplore}
            //className="cursor-pointer bg-[#1F4072] text-white hover:bg-[#163056] shadow-xs border border-transparent"
          >
            <span className="font-bold  text-[#1F4072]">Discover</span>
          </Button>
        </div>

      </div>
    </header>
  );
}

export default UserHomeHeader;
