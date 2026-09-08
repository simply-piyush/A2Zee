'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopHeaderBanner } from '@/components/ui/top-header-banner';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { EmergencyRadarMap } from './EmergencyRadarMap';

export function CreateJobView({
  jobType,
  setJobType,
  selectedTrade,
  setSelectedTrade,
  selectedPreset,
  setSelectedPreset,
  customJobDescription,
  setCustomJobDescription,
  presetOptions = [],
  selectedDate,
  setSelectedDate,
  startHour,
  setStartHour,
  endHour,
  setEndHour,
  nearbyArtisans = [],
  userCoords = { lat: 22.6950, lng: 88.4550 },
  userLocation = 'Current Area',
  assignedArtisan,
  bookingNotice,
  isSubmitting,
  tradeCategories = [],
  onBack,
  onSearchForExpert,
  onViewInCart,
}) {
  return (
    <div className="flex-1 flex flex-col max-w-md md:max-w-3xl mx-auto w-full pb-16 animate-in fade-in duration-200 relative">
      
      {/* Artisan Illustration: fixed to bottom of screen, 30vh */}
      <div 
        className="pointer-events-none select-none fixed right-0 bottom-0 h-[30vh] z-0 flex items-end justify-end overflow-hidden"
        aria-hidden="true"
      >
        <img
          src="/images/artisan.png"
          alt=""
          className="h-[30vh] w-auto object-contain object-bottom-right drop-shadow-lg opacity-25 sm:opacity-35 md:opacity-90 transition-opacity"
        />
      </div>

      {/* Curved Navy Header with Back Button and Display Title */}
      <TopHeaderBanner
        title="CREATE JOB"
        onBack={onBack}
      />

      <div className="px-6 pt-6 space-y-6 flex-1 flex flex-col relative z-10">
        
        {/* Job Type Segmented Toggle */}
        <div>
          <label className="block text-sm font-normal text-gray-800 mb-2">
            Job Type
          </label>
          <div className="bg-white rounded-2xl p-1 border border-gray-300 flex shadow-sm">
            <button
              type="button"
              onClick={() => setJobType('Instant')}
              className={`flex-1 py-3 text-center rounded-xl font-normal text-sm transition-all cursor-pointer ${
                jobType === 'Instant'
                  ? 'bg-[#1F4072] text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Instant
            </button>
            <button
              type="button"
              onClick={() => setJobType('Timely')}
              className={`flex-1 py-3 text-center rounded-xl font-normal text-sm transition-all cursor-pointer ${
                jobType === 'Timely'
                  ? 'bg-[#1F4072] text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Timely
            </button>
          </div>
        </div>

        {/* 1. Skill Category Dropdown (Shadcn Select - No Emojis) */}
        <div>
          <label className="block text-sm font-normal text-gray-800 mb-2">
            Skill Category
          </label>
          <Select value={selectedTrade} onValueChange={setSelectedTrade}>
            <SelectTrigger>
              <SelectValue placeholder="Select a skill category" />
            </SelectTrigger>
            <SelectContent>
              {tradeCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.trade}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 2. Job Description Bigger Dropdown (Shadcn Select - No Emojis) */}
        <div>
          <label className="block text-sm font-normal text-gray-800 mb-2">
            Job Description
          </label>
          <Select value={selectedPreset} onValueChange={setSelectedPreset}>
            <SelectTrigger>
              <SelectValue placeholder="Select a job description" />
            </SelectTrigger>
            <SelectContent>
              {presetOptions.map((preset, idx) => (
                <SelectItem key={idx} value={preset}>
                  {preset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom Request Textbox when 'Other' is selected */}
          {(selectedPreset === 'Other' || selectedPreset?.startsWith('Other')) && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-medium text-[#1F4072] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Describe Your Custom Request</span>
                <span className="text-[11px] text-gray-500 font-normal">Base diagnosis ₹150</span>
              </label>
              <textarea
                rows={3}
                value={customJobDescription}
                onChange={(e) => setCustomJobDescription(e.target.value)}
                placeholder={`Describe your specific problem, appliance model, or repair requirement for ${selectedTrade}...`}
                className="w-full bg-white text-gray-900 placeholder-gray-400 rounded-2xl p-4 border-2 border-[#1F4072]/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#1F4072] text-sm resize-none font-normal leading-relaxed"
                required
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Timely Time Slot Section with Shadcn DatePicker */}
        {jobType === 'Timely' && (
          <div className="space-y-4 bg-white border border-gray-200 rounded-3xl p-5 shadow-sm animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <label className="block text-sm font-normal text-gray-900 tracking-wide uppercase">
                Service Appointment Slot
              </label>
              <span className="text-xs text-[#1F4072] font-normal bg-[#FFF6F0] px-2.5 py-1 rounded-full border border-[#1F4072]/15">
                Roster Confirmed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Shadcn Date Picker with color theme */}
              <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start md:col-span-6 space-y-1.5">
                <span className="text-xs text-gray-600 font-normal block">Select Date</span>
                <DatePicker
                  date={selectedDate}
                  setDate={setSelectedDate}
                  minDate={new Date()}
                />
              </div>

              {/* Working Hours Dropdown */}
              <div className="md:col-span-6 space-y-1.5">
                <span className="text-xs text-gray-600 font-normal block">Working Hours Window</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select value={startHour} onValueChange={setStartHour}>
                      <SelectTrigger className="py-3.5 px-3 sm:px-4 text-sm">
                        <SelectValue placeholder="Start time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7 am">7 am</SelectItem>
                        <SelectItem value="8 am">8 am</SelectItem>
                        <SelectItem value="9 am">9 am</SelectItem>
                        <SelectItem value="10 am">10 am</SelectItem>
                        <SelectItem value="11 am">11 am</SelectItem>
                        <SelectItem value="12 pm">12 pm</SelectItem>
                        <SelectItem value="1 pm">1 pm</SelectItem>
                        <SelectItem value="2 pm">2 pm</SelectItem>
                        <SelectItem value="3 pm">3 pm</SelectItem>
                        <SelectItem value="4 pm">4 pm</SelectItem>
                        <SelectItem value="5 pm">5 pm</SelectItem>
                        <SelectItem value="6 pm">6 pm</SelectItem>
                        <SelectItem value="7 pm">7 pm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <span className="text-sm font-normal text-gray-400">to</span>

                  <div className="flex-1">
                    <Select value={endHour} onValueChange={setEndHour}>
                      <SelectTrigger className="py-3.5 px-3 sm:px-4 text-sm">
                        <SelectValue placeholder="End time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8 am">8 am</SelectItem>
                        <SelectItem value="9 am">9 am</SelectItem>
                        <SelectItem value="10 am">10 am</SelectItem>
                        <SelectItem value="11 am">11 am</SelectItem>
                        <SelectItem value="12 pm">12 pm</SelectItem>
                        <SelectItem value="1 pm">1 pm</SelectItem>
                        <SelectItem value="2 pm">2 pm</SelectItem>
                        <SelectItem value="3 pm">3 pm</SelectItem>
                        <SelectItem value="4 pm">4 pm</SelectItem>
                        <SelectItem value="5 pm">5 pm</SelectItem>
                        <SelectItem value="6 pm">6 pm</SelectItem>
                        <SelectItem value="7 pm">7 pm</SelectItem>
                        <SelectItem value="8 pm">8 pm</SelectItem>
                        <SelectItem value="9 pm">9 pm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instant Emergency GPS Map Section (OpenStreetMap) */}
        {jobType === 'Instant' && (
          <EmergencyRadarMap 
            nearbyArtisans={nearbyArtisans} 
            userCoords={userCoords} 
            selectedTrade={selectedTrade}
            areaName={userLocation}
          />
        )}

        {bookingNotice && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl text-center font-normal">
            {bookingNotice}
          </div>
        )}

        {/* Large "Search for Expert" CTA Button */}
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={onSearchForExpert}
          className="w-full h-14 rounded-2xl text-base shadow-lg cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Matching Best Karigar...</span>
            </>
          ) : (
            <span>Search for Expert</span>
          )}
        </Button>

      </div>
    </div>
  );
}

export default CreateJobView;
