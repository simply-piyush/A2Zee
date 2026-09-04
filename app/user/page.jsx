'use client';

import React, { useState, useEffect } from 'react';
import { TRADE_CATEGORIES, getPresetDescriptions } from '@/lib/servicePresets';
import { BookingSuccessModal } from '@/components/ui/booking-success-modal';
import {
  UserHomeHeader,
  SearchJobsView,
  CreateJobView,
  ActiveBookingBanner,
  JustBookedNotice,
  ServiceCategoriesGrid,
  PopularServicesList,
  DesktopPromoBanner,
  CartView,
  UserProfileView,
} from '@/components/user';

// Popular service card presets matching Figma
const POPULAR_SERVICES = [
  { id: 'p1', title: 'CEILING FAN NOT WORKING', trade: 'Electrician', desc: 'Ceiling fan not working or making noise' },
  { id: 'p2', title: 'TAP LEAKAGE REPAIR', trade: 'Plumbers', desc: 'Bathroom or kitchen tap leaking continuously' },
  { id: 'p3', title: 'KITCHEN DEEP CLEANING', trade: 'Househelp', desc: 'Comprehensive kitchen scrubbing, sink & chimney' },
  { id: 'p4', title: 'DOOR LOCK & HINGE FIX', trade: 'Carpenters', desc: 'Main door lock jammed or loose wooden hinge' },
  { id: 'p5', title: 'SWITCHBOARD SPARKING', trade: 'Electrician', desc: 'Emergency switchboard sparking or burnt plug' },
];

// All skills categories with Figma matching labels
const ALL_CATEGORIES = [
  { id: 'househelp', label: 'househelp', trade: 'Househelp' },
  { id: 'carpenter', label: 'carpenter', trade: 'Carpenters' },
  { id: 'cleaning', label: 'cleaning', trade: 'Cleaners' },
  { id: 'plumbing', label: 'plumbing', trade: 'Plumbers' },
  { id: 'electrician', label: 'electrician', trade: 'Electrician' },
  { id: 'painters', label: 'painters', trade: 'Painters' },
  { id: 'caregivers', label: 'caregivers', trade: 'Caregivers' },
  { id: 'drivers', label: 'drivers', trade: 'Drivers' },
  { id: 'gardeners', label: 'gardeners', trade: 'Gardeners' },
  { id: 'technicians', label: 'technicians', trade: 'Technicians' },
];

export default function UserAppPage() {
  // Navigation views: 'home' | 'search' | 'create' | 'cart' | 'profile'
  const [currentView, setCurrentView] = useState('home');
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Search State - real user search history, no dummy presets
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('a2zee_search_history');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Create Job State
  const [jobType, setJobType] = useState('Instant'); // 'Instant' (Emergency) or 'Timely'
  const [selectedTrade, setSelectedTrade] = useState('Electrician');
  const [presetOptions, setPresetOptions] = useState(() => getPresetDescriptions('Electrician'));
  const [selectedPreset, setSelectedPreset] = useState(() => getPresetDescriptions('Electrician')[0] || 'Other');
  const [customJobDescription, setCustomJobDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [startHour, setStartHour] = useState('9 am');
  const [endHour, setEndHour] = useState('5 pm');

  // Done animation modal & multiple booking states
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);
  const [justBookedNotice, setJustBookedNotice] = useState(null);

  // Location & User info
  const [userLocation, setUserLocation] = useState('Madhyamgram, Kolkata');
  const [userCoords, setUserCoords] = useState({ lat: 22.6950, lng: 88.4550 });
  const [userName, setUserName] = useState('Priyush');
  const [userPhone, setUserPhone] = useState('+91 98301 23456');

  // Live Nearby Artisans for Emergency/Instant Map
  const [nearbyArtisans, setNearbyArtisans] = useState([]);
  const [isLoadingArtisans, setIsLoadingArtisans] = useState(false);

  // Submission & Bookings state - persistent cache restored immediately
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedArtisan, setAssignedArtisan] = useState(null);
  const [myBookings, setMyBookings] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('a2zee_user_bookings');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [bookingNotice, setBookingNotice] = useState('');

  // Location selector dropdown
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  // Sync preset options when trade changes
  useEffect(() => {
    const presets = getPresetDescriptions(selectedTrade);
    setPresetOptions(presets);
    setSelectedPreset(presets[0] || 'Other');
    setCustomJobDescription('');
  }, [selectedTrade]);

  // 1. Sync view with Navbar custom events & bfcache handling
  useEffect(() => {
    const handleNavEvent = (e) => {
      const tabId = e.detail;
      if (tabId === 'home') setCurrentView('home');
      else if (tabId === 'search') setCurrentView('search');
      else if (tabId === 'book') setCurrentView('create');
      else if (tabId === 'cart') setCurrentView('cart');
      else if (tabId === 'services') {
        setCurrentView('home');
        setShowAllCategories(true);
      }
    };

    const handlePageShow = (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    window.addEventListener('a2zee-user-tab', handleNavEvent);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('a2zee-user-tab', handleNavEvent);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // 2. Notify Navbar whenever currentView changes to glide the sliding pill
  useEffect(() => {
    const navTabMap = {
      home: 'home',
      search: 'search',
      book: 'book',
      create: 'book',
      cart: 'cart',
      profile: 'home',
      reorder: 'cart',
    };
    const tabToSync = navTabMap[currentView] || 'home';
    window.dispatchEvent(new CustomEvent('a2zee-user-tab-change', { detail: tabToSync }));
    window.dispatchEvent(new CustomEvent('a2zee-user-view', { detail: currentView }));
  }, [currentView]);

  // 3. Notify Navbar of active bookings count for Cart badge
  useEffect(() => {
    const activeCount = myBookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length;
    window.dispatchEvent(new CustomEvent('a2zee-cart-count', { detail: activeCount }));
  }, [myBookings]);

  // Load nearby artisans when trade or coordinates change
  useEffect(() => {
    async function loadNearby() {
      setIsLoadingArtisans(true);
      try {
        const res = await fetch(
          `/api/workers/nearby?lat=${userCoords.lat}&lng=${userCoords.lng}&skill=${encodeURIComponent(selectedTrade)}&emergency=${jobType === 'Instant'}`
        );
        const data = await res.json();
        if (data.success && data.rankedCandidates) {
          setNearbyArtisans(data.rankedCandidates);
        }
      } catch (err) {
        console.warn('Could not fetch nearby artisans:', err);
      } finally {
        setIsLoadingArtisans(false);
      }
    }
    loadNearby();
  }, [selectedTrade, userCoords, jobType]);

  // Load My Bookings on mount (synced with both data.data and data.bookings)
  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await fetch('/api/bookings?limit=10');
        const data = await res.json();
        const list = data.data || data.bookings || [];
        if (data.success && Array.isArray(list) && list.length > 0) {
          setMyBookings(list);
          try {
            localStorage.setItem('a2zee_user_bookings', JSON.stringify(list));
          } catch (e) {}
          
          // Auto-select latest active assigned artisan if available
          const latestActive = list.find(b => b.worker && b.status !== 'COMPLETED');
          if (latestActive && !assignedArtisan) {
            setAssignedArtisan({
              ...latestActive.worker,
              bookingId: latestActive.id,
              bookingCode: latestActive.bookingCode,
              serviceTitle: latestActive.serviceTitle,
              etaMinutes: latestActive.isEmergency ? 12 : null,
              distanceKm: 1.2,
              status: latestActive.status,
              scheduledTime: latestActive.scheduledTime || 'Active Now',
            });
          }
        }
      } catch (err) {
        console.warn('Could not load bookings:', err);
      }
    }
    loadBookings();
  }, []);

  // Handle Remove Search History Item
  const handleRemoveSearch = (e, itemToRemove) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(item => item !== itemToRemove);
      try {
        localStorage.setItem('a2zee_search_history', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  // Helper to apply trade and select appropriate preset or custom description
  const applyServiceSelection = (trade, description = '') => {
    setSelectedTrade(trade);
    const presets = getPresetDescriptions(trade);
    setPresetOptions(presets);

    const foundPreset = presets.find(p => 
      p.toLowerCase().includes(description.toLowerCase()) || 
      description.toLowerCase().includes(p.toLowerCase())
    );

    if (foundPreset && foundPreset !== 'Other') {
      setSelectedPreset(foundPreset);
      setCustomJobDescription('');
    } else {
      setSelectedPreset('Other');
      setCustomJobDescription(description);
    }
  };

  // Handle Select Category
  const handleCategoryClick = (cat) => {
    applyServiceSelection(cat.trade, `Diagnostic inspection & repair for ${cat.label}`);
    setCurrentView('create');
  };

  // Handle Popular Service Click
  const handlePopularServiceClick = (item) => {
    applyServiceSelection(item.trade, item.desc || item.title);
    setCurrentView('create');
  };

  // Handle Search Item Click
  const handleSearchItemClick = (term) => {
    const match = ALL_CATEGORIES.find(c => 
      c.label.toLowerCase().includes(term.toLowerCase()) || 
      c.trade.toLowerCase().includes(term.toLowerCase())
    );
    const trade = match ? match.trade : 'Electrician';
    applyServiceSelection(trade, `Service request for ${term}`);
    setCurrentView('create');
  };

  // Handle Search Submit
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const term = searchQuery.trim();
    if (!term) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('a2zee_search_history', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
    handleSearchItemClick(term);
  };

  // Handle Create Job Submission
  const handleSearchForExpert = async () => {
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
        customerName: userName,
        customerPhone: userPhone,
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
        const assignedData = {
          ...workerObj,
          id: workerObj?.id || 'w_assigned',
          name: workerObj?.name || workerObj?.workerName || 'Assigned Karigar',
          phone: workerObj?.phone || '+91 98765 43210',
          cooperative: typeof workerObj?.cooperative === 'string' ? workerObj.cooperative : workerObj?.cooperative?.name || 'Labour Cooperative Society',
          rating: workerObj?.rating || 4.9,
          distanceKm: workerObj?.distanceKm || 1.2,
          etaMinutes: workerObj?.etaMinutes || (bookingData.isEmergency ? 12 : null),
          bookingId: bookingData.id,
          bookingCode: bookingData.bookingCode || `A2Z-${bookingData.id?.slice(0, 8).toUpperCase()}`,
          serviceTitle: bookingData.serviceTitle || payload.customTitle,
          status: bookingData.status || 'PENDING',
          isEmergency: bookingData.isEmergency,
          scheduledTime: bookingData.scheduledTime || scheduledTimeText,
        };

        setAssignedArtisan(assignedData);

        // Prepend to myBookings right away and save to localStorage
        setMyBookings(prev => {
          const updated = [
            {
              id: bookingData.id,
              bookingCode: assignedData.bookingCode,
              serviceTitle: assignedData.serviceTitle,
              address: userLocation,
              status: assignedData.status,
              isEmergency: bookingData.isEmergency,
              scheduledTime: assignedData.scheduledTime,
              finalPrice: bookingData.finalPrice || 299,
              worker: assignedData,
              createdAt: new Date().toISOString(),
            },
            ...prev.filter(b => b.id !== bookingData.id),
          ];
          try {
            localStorage.setItem('a2zee_user_bookings', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });

        const formattedBooking = {
          ...bookingData,
          trade: selectedTrade,
          customTitle: finalDesc,
          jobType,
          isEmergency,
          scheduledTime: assignedData.scheduledTime,
          worker: assignedData,
        };

        setConfirmedBookingData(formattedBooking);
        setShowDoneModal(true);
        setJustBookedNotice({
          title: finalDesc,
          trade: selectedTrade,
          code: assignedData.bookingCode,
        });

        setBookingNotice(data.message || 'Expert artisan matched and assigned successfully!');
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

  // Displayed categories (4 by default, all when expanded)
  const displayedCategories = showAllCategories ? ALL_CATEGORIES : ALL_CATEGORIES.slice(0, 4);
  const activeBookingsList = myBookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');

  return (
    <div className="min-h-screen bg-[#FFF6F0] text-[#1F4072] font-secondary flex flex-col justify-between selection:bg-[#1F4072]/20 selection:text-[#1F4072] pb-28">
      
      {/* Animated Done Modal with auto-redirect to homepage */}
      <BookingSuccessModal
        isOpen={showDoneModal}
        bookingData={confirmedBookingData}
        onClose={() => {
          setShowDoneModal(false);
          setCurrentView('home');
        }}
        onBookAnother={() => {
          setShowDoneModal(false);
          setCurrentView('create');
          setCustomJobDescription('');
          setSelectedPreset(presetOptions[0] || 'Other');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 1. SEARCH JOBS SCREEN */}
      {currentView === 'search' && (
        <SearchJobsView
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          recentSearches={recentSearches}
          setRecentSearches={setRecentSearches}
          onSearchSubmit={handleSearchSubmit}
          onSearchItemClick={handleSearchItemClick}
          onRemoveSearch={handleRemoveSearch}
          onBack={() => setCurrentView('home')}
        />
      )}

      {/* 2. CREATE JOB SCREEN */}
      {currentView === 'create' && (
        <CreateJobView
          jobType={jobType}
          setJobType={setJobType}
          selectedTrade={selectedTrade}
          setSelectedTrade={setSelectedTrade}
          selectedPreset={selectedPreset}
          setSelectedPreset={setSelectedPreset}
          customJobDescription={customJobDescription}
          setCustomJobDescription={setCustomJobDescription}
          presetOptions={presetOptions}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          startHour={startHour}
          setStartHour={setStartHour}
          endHour={endHour}
          setEndHour={setEndHour}
          nearbyArtisans={nearbyArtisans}
          userCoords={userCoords}
          assignedArtisan={assignedArtisan}
          bookingNotice={bookingNotice}
          isSubmitting={isSubmitting}
          tradeCategories={TRADE_CATEGORIES}
          onBack={() => {
            setCurrentView('home');
            setAssignedArtisan(null);
          }}
          onSearchForExpert={handleSearchForExpert}
          onViewInCart={() => setCurrentView('cart')}
        />
      )}

      {/* 3. USER HOMEPAGE */}
      {currentView === 'home' && (
        <div className="flex-1 flex flex-col w-full pb-16 animate-in fade-in duration-200">
          
          {/* Header Component */}
          <UserHomeHeader
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            setUserCoords={setUserCoords}
            locationDropdownOpen={locationDropdownOpen}
            setLocationDropdownOpen={setLocationDropdownOpen}
            activeBookingsCount={activeBookingsList.length}
            onOpenCart={() => setCurrentView('cart')}
            onOpenProfile={() => setCurrentView('profile')}
            onOpenSearch={() => setCurrentView('search')}
            onExplore={() => {
              applyServiceSelection('Electrician', 'General household service & inspection');
              setCurrentView('create');
            }}
          />

          {/* Main Content Sections */}
          <main className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto w-full px-6 pt-6 space-y-8">
            
            {/* Just Booked Notice Banner */}
            <JustBookedNotice
              notice={justBookedNotice}
              onBookAnother={() => {
                setJustBookedNotice(null);
                setCurrentView('create');
                setCustomJobDescription('');
                setSelectedPreset(presetOptions[0] || 'Other');
              }}
              onDismiss={() => setJustBookedNotice(null)}
            />

            {/* Active Booking Banner */}
            {activeBookingsList.length > 0 && (
              <ActiveBookingBanner
                activeBooking={activeBookingsList[0]}
                onOpenCart={() => setCurrentView('cart')}
              />
            )}

            {/* Service Categories Grid */}
            <ServiceCategoriesGrid
              displayedCategories={displayedCategories}
              showAllCategories={showAllCategories}
              setShowAllCategories={setShowAllCategories}
              onCategoryClick={handleCategoryClick}
            />

            {/* Popular Services Carousel */}
            <PopularServicesList
              popularServices={POPULAR_SERVICES}
              onServiceClick={handlePopularServiceClick}
            />

            {/* Desktop Adaptation Promo Banner */}
            <DesktopPromoBanner
              onBookArtisan={() => {
                applyServiceSelection('Electrician', 'General household inspection');
                setCurrentView('create');
              }}
            />

          </main>
        </div>
      )}

      {/* 4. CART / ACTIVE BOOKINGS VIEW */}
      {currentView === 'cart' && (
        <CartView
          myBookings={myBookings}
          onBack={() => setCurrentView('home')}
          onCreateJob={() => setCurrentView('create')}
        />
      )}

      {/* 5. USER PROFILE VIEW */}
      {currentView === 'profile' && (
        <UserProfileView
          userName={userName}
          userPhone={userPhone}
          userLocation={userLocation}
          userCoords={userCoords}
          onBack={() => setCurrentView('home')}
        />
      )}

    </div>
  );
}
