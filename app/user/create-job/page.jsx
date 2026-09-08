'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, ChevronDown, MapPin, Star, CheckCircle2, 
  Phone, Clock, ShieldCheck, Sparkles 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TopHeaderBanner } from '@/components/ui/top-header-banner';
import { EmergencyRadarMap } from '@/components/user/EmergencyRadarMap';
import { TRADE_CATEGORIES, getPresetDescriptions } from '@/lib/servicePresets';
import { BookingSuccessModal } from '@/components/ui/booking-success-modal';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select';

function CreateJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTrade = searchParams.get('trade') || 'Electrician';

  const [jobType, setJobType] = useState('Instant'); // 'Instant' vs 'Timely'
  const [selectedTrade, setSelectedTrade] = useState(initialTrade);
  
  // Preset descriptions for selected trade
  const [presetOptions, setPresetOptions] = useState(() => getPresetDescriptions(initialTrade));
  const [selectedPreset, setSelectedPreset] = useState(() => getPresetDescriptions(initialTrade)[0] || 'Other');
  const [customJobDescription, setCustomJobDescription] = useState('');

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [startHour, setStartHour] = useState('9 am');
  const [endHour, setEndHour] = useState('5 pm');

  // Customer location & coords
  const [userLocation, setUserLocation] = useState('Madhyamgram, Kolkata');
  const [userCoords, setUserCoords] = useState({ lat: 22.6950, lng: 88.4550 });
  const [nearbyArtisans, setNearbyArtisans] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedArtisan, setAssignedArtisan] = useState(null);
  const [bookingNotice, setBookingNotice] = useState('');

  // Done animation modal state
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);

  // Update preset list whenever trade changes
  useEffect(() => {
    const presets = getPresetDescriptions(selectedTrade);
    setPresetOptions(presets);
    setSelectedPreset(presets[0] || 'Other');
    setCustomJobDescription('');
  }, [selectedTrade]);

  // Fetch nearby artisans for Instant Map
  useEffect(() => {
    async function loadNearby() {
      try {
        const res = await fetch(
          `/api/workers/nearby?lat=${userCoords.lat}&lng=${userCoords.lng}&skill=${encodeURIComponent(selectedTrade)}&emergency=${jobType === 'Instant'}`
        );
        const data = await res.json();
        if (data.success && (data.rankedCandidates || data.data)) {
          setNearbyArtisans(data.rankedCandidates || data.data);
        }
      } catch (err) {
        console.warn('Could not fetch nearby artisans:', err);
      }
    }
    loadNearby();
  }, [selectedTrade, userCoords, jobType]);

  const handleSearchForExpert = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBookingNotice('');
    setAssignedArtisan(null);

    const isOther = selectedPreset === 'Other' || selectedPreset.startsWith('Other');
    const finalDesc = isOther 
      ? (customJobDescription.trim() || `${selectedTrade} Custom Service Request`) 
      : selectedPreset;

    try {
      const isEmergency = jobType === 'Instant';
      const formattedDateStr = selectedDate instanceof Date
        ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
        : `Day ${selectedDate}`;

      const scheduledTimeText = isEmergency 
        ? 'Immediate (Arriving in ~15 mins)' 
        : `${formattedDateStr}, between ${startHour} - ${endHour}`;

      const baseStartTime = selectedDate instanceof Date ? new Date(selectedDate) : new Date();
      const baseEndTime = new Date(baseStartTime);
      baseStartTime.setHours(parseInt(startHour) || 9, 0, 0, 0);
      baseEndTime.setHours(parseInt(endHour) + 12 || 17, 0, 0, 0);

      const payload = {
        trade: selectedTrade,
        jobType: jobType,
        isEmergency: isEmergency,
        isCustomIssue: true,
        customTitle: finalDesc,
        customDesc: finalDesc,
        customerAddress: userLocation,
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        customerName: 'Priyush',
        customerPhone: '+91 98301 23456',
        scheduledTime: scheduledTimeText,
        scheduledStartTime: isEmergency ? new Date().toISOString() : baseStartTime.toISOString(),
        scheduledEndTime: isEmergency ? new Date(Date.now() + 7200000).toISOString() : baseEndTime.toISOString(),
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      const bookingData = data.data || data.booking;

      if (data.success && bookingData) {
        const workerObj = bookingData.worker || bookingData.assignedWorker;
        const formattedBooking = {
          ...bookingData,
          trade: selectedTrade,
          customTitle: finalDesc,
          jobType,
          isEmergency,
          scheduledTime: bookingData.scheduledTime || scheduledTimeText,
          worker: workerObj ? {
            ...workerObj,
            name: workerObj.name || workerObj.workerName || 'Assigned Karigar',
            rating: workerObj.rating || 4.9,
            cooperative: typeof workerObj.cooperative === 'string' ? workerObj.cooperative : workerObj.cooperative?.name || 'Labour Cooperative Society',
            etaMinutes: workerObj.etaMinutes || (isEmergency ? 14 : null),
          } : null,
        };

        try {
          const existing = JSON.parse(localStorage.getItem('a2zee_user_bookings') || '[]');
          const updated = [formattedBooking, ...existing.filter(b => b.id !== formattedBooking.id)];
          localStorage.setItem('a2zee_user_bookings', JSON.stringify(updated));
        } catch (e) {}

        setConfirmedBookingData(formattedBooking);
        setShowDoneModal(true);
      } else {
        setBookingNotice(data.error || 'No available artisan found at this moment.');
      }
    } catch (err) {
      console.error('Failed to book job:', err);
      setBookingNotice('Network error while booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to let user immediately book another job
  const handleBookAnother = () => {
    setShowDoneModal(false);
    setConfirmedBookingData(null);
    setCustomJobDescription('');
    setSelectedPreset(presetOptions[0] || 'Other');
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate back to user homepage
  const handleBackToHome = () => {
    setShowDoneModal(false);
    router.push('/user?booked=true');
  };

  const isOtherSelected = selectedPreset === 'Other' || selectedPreset.startsWith('Other');

  return (
    <div className="min-h-screen bg-[#FFF6F0] text-[#1F4072] font-secondary flex flex-col justify-between selection:bg-[#1F4072]/20 selection:text-[#1F4072]">
      
      {/* Animated Done Modal with auto-redirect to homepage */}
      <BookingSuccessModal
        isOpen={showDoneModal}
        bookingData={confirmedBookingData}
        onClose={handleBackToHome}
        onBookAnother={handleBookAnother}
      />

      <div className="flex-1 flex flex-col max-w-md md:max-w-3xl mx-auto w-full pb-12 animate-in fade-in duration-200 relative">
        
        {/* Artisan Illustration: fixed to bottom of screen, 30vh */}
        <div 
          className="pointer-events-none select-none fixed right-0 bottom-0 h-[20vh] z-0 flex items-end justify-end overflow-hidden"
          aria-hidden="true"
        >
          <img
            src="/images/artisan.png"
            alt=""
            className="h-[20vh] w-auto object-contain object-bottom-right drop-shadow-lg opacity-25 sm:opacity-35 md:opacity-90 transition-opacity"
          />
        </div>
        
        {/* Curved Navy Header with Back Button and Display Title */}
        <TopHeaderBanner
          title="CREATE JOB"
          subtitle="Multiple bookings supported • Verified cooperative karigars"
          backHref="/user"
        />

        <form onSubmit={handleSearchForExpert} className="px-6 pt-6 space-y-5 flex-1 flex flex-col relative z-10">
          
          {/* Job Type Segmented Toggle matching Figma */}
          <div>
            <label className="block text-sm font-normal text-gray-800 mb-2">
              Job Type
            </label>
            <div className="bg-white rounded-2xl p-1 border border-gray-300 flex shadow-sm">
              <button
                type="button"
                onClick={() => setJobType('Instant')}
                className={`flex-1 py-3 text-center rounded-xl font-normal text-sm transition-all ${
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
                className={`flex-1 py-3 text-center rounded-xl font-normal text-sm transition-all ${
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
                {TRADE_CATEGORIES.map(cat => (
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
            {isOtherSelected && (
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
                  className="w-full bg-white text-gray-900 placeholder-gray-400 rounded-2xl p-4 border-2 border-[#1F4072]/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#1F4072] text-sm resize-none font-medium leading-relaxed"
                  required={isOtherSelected}
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Timely Time Slot Section with Shadcn DatePicker */}
          {jobType === 'Timely' && (
            <div className="space-y-4 bg-white border border-gray-200 rounded-3xl p-5 shadow-sm animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <label className="block text-sm font-medium text-gray-900 tracking-wide uppercase">
                  Service Appointment Slot
                </label>
                <span className="text-xs text-[#1F4072] font-normal bg-[#FFF6F0] px-2.5 py-1 rounded-full border border-[#1F4072]/15">
                  Roster Confirmed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Shadcn-style Date Picker with theme */}
                <div className="md:col-span-6 space-y-1.5">
                  <span className="text-xs text-gray-600 font-normal block">Select Date</span>
                  <DatePicker
                    date={selectedDate}
                    setDate={setSelectedDate}
                    minDate={new Date()}
                  />
                </div>

                {/* Working Hours Range */}
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

                    <span className="text-sm font-bold text-gray-400">to</span>

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
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl text-center font-medium">
              {bookingNotice}
            </div>
          )}



          {/* Large "Search for Expert" CTA Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
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

        </form>
      </div>

    </div>
  );
}

export default function CreateJobPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF6F0] p-6 text-center">Loading job creator...</div>}>
      <CreateJobForm />
    </Suspense>
  );
}
