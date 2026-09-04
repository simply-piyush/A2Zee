'use client';

import React from 'react';
import { ArrowLeft, Clock, X } from 'lucide-react';

export function SearchJobsView({
  searchQuery,
  setSearchQuery,
  recentSearches = [],
  setRecentSearches,
  onSearchSubmit,
  onSearchItemClick,
  onRemoveSearch,
  onBack,
}) {
  return (
    <div className="flex-1 flex flex-col max-w-md md:max-w-2xl mx-auto w-full pb-16 animate-in fade-in duration-200">
      
      {/* Curved Navy Header with Back Button and Search Bar */}
      <div 
        className="rounded-b-[36px] px-5 pt-8 pb-6 shadow-lg text-white"
        style={{
          background: 'radial-gradient(circle at top, #275294 0%, #1F4072 100%), repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 8px)'
        }}
      >
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <form onSubmit={onSearchSubmit} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for Jobs"
                autoFocus
                className="w-full bg-white text-gray-800 placeholder-gray-400 rounded-2xl px-4 py-3 text-base shadow-inner focus:outline-none focus:ring-2 focus:ring-[#1F4072]/30 font-normal"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Search History List - clean style with clock icon and remove button */}
      <div className="px-6 pt-6 flex-1">
        {recentSearches.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300 stroke-[1.5]" />
            <p>No recent search history</p>
            <p className="text-xs text-gray-400 mt-1">Search for any trade, repair, or household service</p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-gray-100">
              <span className="text-xs font-normal text-gray-400 uppercase tracking-wider">Search History</span>
              <button
                type="button"
                onClick={() => {
                  setRecentSearches([]);
                  try { localStorage.removeItem('a2zee_search_history'); } catch (e) {}
                }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
            {recentSearches.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSearchItemClick(item)}
                className="flex items-center justify-between py-3.5 border-b border-gray-200/80 hover:bg-black/5 rounded-lg px-2 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <Clock className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                  <span className="text-gray-800 font-normal text-sm sm:text-base">{item}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => onRemoveSearch(e, item)}
                  className="p-1 text-gray-400 hover:text-gray-700 active:scale-90 transition-all cursor-pointer"
                  aria-label={`Remove ${item}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchJobsView;
