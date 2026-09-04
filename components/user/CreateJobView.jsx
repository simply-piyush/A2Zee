'use client';

import React from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { EmergencyRadarMap } from './EmergencyRadarMap';
import { AssignedArtisanCard } from './AssignedArtisanCard';

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
      
      {/* Artisan Illustration: 40vh background on rightmost side of container */}
      <div 
        className="pointer-events-none select-none absolute right-0 bottom-4 md:bottom-6 h-[40vh] max-h-[480px] z-0 flex items-end justify-end overflow-hidden"
        aria-hidden="true"
      >
        <img
          src="/images/artisan.png"
          alt=""
          className="h-[40vh] w-auto max-h-[480px] object-contain object-bottom-right drop-shadow-lg opacity-25 sm:opacity-35 md:opacity-90 transition-opacity"
        />
      </div>

      {/* Curved Navy Header with Back Button and Display Title */}
      <div 
        className="rounded-b-[36px] px-6 pt-8 pb-6 shadow-lg text-white relative z-10"
        style={{
          background: 'radial-gradient(circle at top, #275294 0%, #1F4072 100%), repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 8px)'
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
            CREATE JOB
          </h1>
        </div>
      </div>

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
              <div className="md:col-span-6 space-y-1.5">
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
                  <div className="relative flex-1">
                    <select
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
                      className="w-full appearance-none bg-white text-gray-900 border-2 border-gray-300 hover:border-[#1F4072] rounded-2xl py-3 px-3 pr-7 font-normal text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4072] transition-colors cursor-pointer"
                    >
                      <option value="8 am">8 am</option>
                      <option value="9 am">9 am</option>
                      <option value="10 am">10 am</option>
                      <option value="11 am">11 am</option>
                      <option value="12 pm">12 pm</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <span className="text-sm font-normal text-gray-400">to</span>

                  <div className="relative flex-1">
                    <select
                      value={endHour}
                      onChange={(e) => setEndHour(e.target.value)}
                      className="w-full appearance-none bg-white text-gray-900 border-2 border-gray-300 hover:border-[#1F4072] rounded-2xl py-3 px-3 pr-7 font-normal text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4072] transition-colors cursor-pointer"
                    >
                      <option value="2 pm">2 pm</option>
                      <option value="3 pm">3 pm</option>
                      <option value="4 pm">4 pm</option>
                      <option value="5 pm">5 pm</option>
                      <option value="6 pm">6 pm</option>
                      <option value="7 pm">7 pm</option>
                      <option value="8 pm">8 pm</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instant Emergency GPS Map Section */}
        {jobType === 'Instant' && (
          <EmergencyRadarMap nearbyArtisans={nearbyArtisans} userCoords={userCoords} />
        )}

        {/* Assigned Artisan Banner Card */}
        {assignedArtisan && (
          <AssignedArtisanCard assignedArtisan={assignedArtisan} onViewInCart={onViewInCart} />
        )}

        {bookingNotice && !assignedArtisan && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl text-center font-normal">
            {bookingNotice}
          </div>
        )}

        {/* Large "Search for Expert" CTA Button */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSearchForExpert}
          className="w-full bg-[#1F4072] hover:bg-[#17325B] active:scale-[0.99] text-white font-normal py-4 rounded-2xl shadow-lg text-base tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Matching Best Karigar...</span>
            </>
          ) : (
            <span>Search for Expert</span>
          )}
        </button>

      </div>
    </div>
  );
}

export default CreateJobView;
