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
            <Link 
              href="/user"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white"
              aria-label="Go back to user portal"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="font-display text-2xl tracking-wider uppercase text-white">
                CREATE JOB
              </h1>
              <p className="text-xs text-[#A8C7FA] font-normal">
                Multiple bookings supported • Verified cooperative karigars
              </p>
            </div>
          </div>
        </div>

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

                    <span className="text-sm font-bold text-gray-400">to</span>

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
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Emergency Radar Active</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">{nearbyArtisans.length} nearby artisans</span>
              </div>

              <div className="relative w-full h-36 bg-[#E9F0FA] rounded-xl overflow-hidden border border-[#D0E0F5] flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(#1F4072_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
                <div className="absolute w-28 h-28 rounded-full border border-[#1F4072]/20 animate-ping pointer-events-none" />
                <div className="absolute w-44 h-44 rounded-full border border-[#1F4072]/15 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#1F4072] text-white flex items-center justify-center shadow-lg border-2 border-white">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold bg-white/90 px-2 py-0.5 rounded shadow text-gray-700 mt-1">You</span>
                </div>

                {nearbyArtisans.slice(0, 4).map((artisan, idx) => {
                  const offsets = [
                    { top: '20%', left: '25%' },
                    { top: '30%', right: '22%' },
                    { bottom: '25%', left: '35%' },
                    { bottom: '20%', right: '30%' },
                  ];
                  return (
                    <div
                      key={artisan.id || artisan.workerId || idx}
                      style={offsets[idx % offsets.length]}
                      className="absolute z-10 flex flex-col items-center group cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#1F4072]/20 text-[#1F4072] flex items-center justify-center font-bold text-xs shadow border border-[#1F4072]/40 backdrop-blur-sm">
                        ★
                      </div>
                      <span className="text-[9px] font-semibold bg-black/75 text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {artisan.name?.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {bookingNotice && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl text-center font-medium">
              {bookingNotice}
            </div>
          )}



          {/* Large "Search for Expert" CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
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
