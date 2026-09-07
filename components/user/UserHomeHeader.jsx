'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Check, ShoppingCart, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBackground } from '@/components/ui/header-background';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { AddressAddDialog } from './AddressAddDialog';

export function UserHomeHeader({
  userLocation = 'Madhyamgram, Kolkata',
  setUserLocation,
  userCoords = { lat: 22.6950, lng: 88.4550 },
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
  };

  const demoAddresses = [
    { id: 'demo-1', label: 'Home', addressLine: 'Madhyamgram, Kolkata' },
    { id: 'demo-2', label: 'Office', addressLine: 'Salt Lake Sector V, Kolkata' },
    { id: 'demo-3', label: 'Parents', addressLine: 'New Town Action Area 1, Kolkata' },
    { id: 'demo-4', label: 'Cooperative Hub', addressLine: 'Barasat Pioneer Park, Kolkata' },
    { id: 'demo-5', label: 'Workshop', addressLine: 'Howrah Station Road, Kolkata' },
  ];

  const availableAddresses = addresses && addresses.length > 2 ? addresses : [
    ...(addresses || []),
    ...demoAddresses.filter(d => !(addresses || []).some(a => a.addressLine === d.addressLine))
  ];

  const activeAddress = availableAddresses.find(
    (a) => a.addressLine === userLocation || (a.city && userLocation.includes(a.city))
  ) || availableAddresses.find((a) => a.isDefault) || availableAddresses[0];

  const locationTitle = activeAddress?.label || 'Home';

  return (
    <header 
      className="rounded-b-[36px] md:rounded-b-[48px] px-6 pt-12 sm:pt-14 pb-8 text-white relative"
    >
      <HeaderBackground className="rounded-b-[36px] md:rounded-b-[48px]" />

      {/* Quick Add Address Dialog */}
      <AddressAddDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        currentCount={addresses.length}
        initialCoords={userCoords}
        onAddAddress={async (newAddr) => {
          if (onAddAddress) {
            await onAddAddress(newAddr);
          }
          if (setUserLocation) setUserLocation(newAddr.addressLine);
          if (setUserCoords && newAddr.latitude && newAddr.longitude) {
            setUserCoords({ lat: newAddr.latitude, lng: newAddr.longitude });
          }
        }}
      />

      <div className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto w-full space-y-6 relative z-10">
        
        {/* Top Row: Location Selector & User Avatar */}
        <div className="flex items-center justify-between gap-3">
          {/* Location Selector occupying 50vw from left end to middle with strict overflow-hidden ellipsis */}
          <div className="w-[50vw] max-w-[50vw] min-w-0 relative z-50">
            <Select
              value={userLocation}
              onValueChange={(val) => {
                const selected = addresses.find((a) => a.addressLine === val || a.id === val);
                if (selected) {
                  handleSelectAddress(selected);
                } else if (val) {
                  if (setUserLocation) setUserLocation(val);
                }
              }}
            >
              <SelectTrigger 
                hideChevron
                className="border-0 bg-transparent hover:opacity-90 text-white p-0 rounded-none ring-0 focus:ring-0 focus:outline-none h-auto shadow-none w-full flex items-center text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0 w-full text-left">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm tracking-wide text-white min-w-0">
                      <span className="truncate">{locationTitle}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-white/80 shrink-0 transition-transform duration-200" />
                    </div>
                    <span 
                      className="text-[11px] sm:text-xs text-white/80 font-normal block truncate w-full"
                      title={userLocation}
                    >
                      {userLocation}
                    </span>
                  </div>
                </div>
              </SelectTrigger>

              <SelectContent className="w-72 sm:w-80 p-2 rounded-2xl bg-white border border-gray-200 shadow-2xl text-gray-800">
                <div className="flex items-center justify-between border-b border-gray-100 px-2 py-1.5 mb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Service Location ({addresses.length}/5)
                  </span>
                  {addresses.length < 5 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAddDialogOpen(true);
                      }}
                      className="text-xs font-semibold text-[#1F4072] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {availableAddresses.map((addr) => {
                    return (
                      <SelectItem
                        key={addr.id || addr.addressLine}
                        value={addr.addressLine}
                        className="w-full text-left p-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <span className="block text-[10px] font-bold uppercase text-slate-500">
                            {addr.label || 'Home'}
                          </span>
                          <span className="truncate block font-medium">
                            {addr.addressLine}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </div>

                {addresses.length < 5 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddDialogOpen(true);
                    }}
                    className="w-full mt-1.5 py-2 px-3 border border-dashed border-[#1F4072]/40 rounded-xl text-xs font-semibold text-[#1F4072] hover:bg-[#1F4072]/5 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                )}
              </SelectContent>
            </Select>
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
