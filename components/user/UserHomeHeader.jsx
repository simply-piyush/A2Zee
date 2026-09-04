'use client';

import React from 'react';
import { MapPin, ChevronDown, Check, ShoppingCart, Search } from 'lucide-react';

export function UserHomeHeader({
  userLocation,
  setUserLocation,
  setUserCoords,
  locationDropdownOpen,
  setLocationDropdownOpen,
  activeBookingsCount = 0,
  onOpenCart,
  onOpenProfile,
  onOpenSearch,
  onExplore,
}) {
  return (
    <header 
      className="rounded-b-[36px] md:rounded-b-[48px] px-6 pt-6 pb-8 shadow-xl text-white relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at top, #275294 0%, #1F4072 100%), repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 8px)'
      }}
    >
      <div className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto w-full space-y-6">
        
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
                  <span>Home</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/80 group-hover:translate-y-0.5 transition-transform" />
                </div>
                <span className="text-xs text-white/75 font-normal block truncate max-w-[200px]">
                  {userLocation}
                </span>
              </div>
            </button>

            {/* Location Dropdown Modal */}
            {locationDropdownOpen && (
              <div className="absolute top-12 left-0 z-50 bg-white text-gray-800 rounded-2xl shadow-2xl p-4 border border-gray-200 w-72 space-y-2 animate-in fade-in duration-150">
                <p className="text-xs font-bold text-gray-400 uppercase">Select Service Location</p>
                <button
                  type="button"
                  onClick={() => {
                    setUserLocation('Madhyamgram, Kolkata');
                    setUserCoords({ lat: 22.6950, lng: 88.4550 });
                    setLocationDropdownOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl text-sm font-medium hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <span>Madhyamgram, Kolkata</span>
                  <Check className="w-4 h-4 text-[#1F4072]" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserLocation('Salt Lake Sector V, Kolkata');
                    setUserCoords({ lat: 22.5800, lng: 88.4350 });
                    setLocationDropdownOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl text-sm font-medium hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <span>Salt Lake Sector V</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserLocation('New Town Action Area I');
                    setUserCoords({ lat: 22.5900, lng: 88.4700 });
                    setLocationDropdownOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl text-sm font-medium hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <span>New Town Action Area I</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Quick Cart & Avatar Circle "P" matching Figma */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenCart}
              className="relative w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
              aria-label="View Cart / Bookings"
            >
              <ShoppingCart className="w-5 h-5" />
              {activeBookingsCount > 0 && (
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

        {/* Slogan Banner & Explore Button matching Figma */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="max-w-[240px] md:max-w-md">
            <h2 className="font-display text-lg md:text-2xl text-white tracking-wide leading-tight uppercase">
              YOUR SOLUTION JUST ONE CLIP AWAY!
            </h2>
          </div>

          <button
            type="button"
            onClick={onExplore}
            className="bg-[#FFEDE0] hover:bg-white text-[#1F4072] font-display text-sm md:text-base px-6 py-2.5 rounded-full shadow hover:shadow-md active:scale-95 transition-all whitespace-nowrap cursor-pointer uppercase"
          >
            explore
          </button>
        </div>

      </div>
    </header>
  );
}

export default UserHomeHeader;
