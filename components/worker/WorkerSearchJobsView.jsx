'use client';

import React from 'react';
import { ArrowLeft, Clock, X, Search, MapPin, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBackground } from '@/components/ui/header-background';

export function WorkerSearchJobsView({
  searchQuery,
  setSearchQuery,
  recentSearches = [],
  onSearchSubmit,
  onSearchItemClick,
  onRemoveSearch,
  onBack,
}) {
  return (
    <div className="flex-1 flex flex-col max-w-md md:max-w-2xl mx-auto w-full pb-16 animate-in fade-in duration-200">
      
      {/* Curved Navy Header with Back Button and Search Bar */}
      <div 
        className="rounded-b-[36px] md:rounded-b-[48px] px-5 pt-12 sm:pt-14 pb-6 shadow-lg text-white relative overflow-hidden"
      >
        <HeaderBackground />

        <div className="flex items-center gap-3 relative z-10">
          <Button 
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>

          <form onSubmit={onSearchSubmit} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, customer addresses, gig IDs..."
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

      {/* Search History List */}
      <div className="px-6 pt-6 flex-1">
        {recentSearches.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm space-y-2">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300 stroke-[1.5]" />
            <p className="font-semibold text-slate-700">No recent artisan searches</p>
            <p className="text-xs text-gray-400">Search customer addresses, booking codes, or repair descriptions</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Recent Searches
              </h3>
            </div>
            <div className="space-y-2">
              {recentSearches.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group"
                  onClick={() => onSearchItemClick && onSearchItemClick(item)}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400 group-hover:text-[#1F4072] transition-colors" />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 font-normal">
                      {item}
                    </span>
                  </div>
                  {onRemoveSearch && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSearch(item);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                      aria-label={`Remove ${item} from search history`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkerSearchJobsView;
