'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Calendar as CalendarIcon, FilterX } from 'lucide-react';
import { 
  WorkerHomeHeader,
  WorkerJobMinimalCard,
  WorkerJobDetailView,
  WorkerCoopPromoBanner,
  WorkerWalletView, 
  WorkerScheduleView, 
  WorkerProfileView, 
  WorkerRejectModal 
} from '@/components/worker';
import { TopHeaderBanner } from '@/components/ui/top-header-banner';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { INITIAL_BOOKING, WORKERS } from '@/lib/data';
import { calculateMonthlyEarningsBreakdown, getCurrentMonthEarnings } from '@/lib/earnings';

const INITIAL_ASSIGNED_JOBS = [
  {
    id: 'gig_em_1',
    bookingCode: 'BK-2026-0922',
    serviceTitle: 'Main Breaker Sparking & Smoking',
    description: 'Sudden electrical sparks behind switchboard; immediate disconnect and fuse replacement required.',
    isEmergency: true,
    customerName: 'Ananya Sen',
    customerPhone: '+91 98301 23456',
    customerAddress: 'Flat 4B, Greenfield Residency, Jessore Road, Madhyamgram, Kolkata 700129',
    address: 'Flat 4B, Greenfield Residency, Jessore Road, Madhyamgram, Kolkata 700129',
    distanceKm: 0.9,
    etaMins: 8,
    basePrice: 350,
    extraAmount: 0,
    scheduledTime: 'Immediate Emergency • 15 mins ETA',
    scheduledDate: new Date(),
    scheduledStartTime: new Date().toISOString(),
    scheduledEndTime: new Date(Date.now() + 3600000).toISOString(),
    status: 'CONFIRMED',
    latitude: 22.6980,
    longitude: 88.4590,
  },
  {
    id: 'gig_std_2',
    bookingCode: 'BK-2026-0935',
    serviceTitle: 'Ceiling Fan Rewiring & Capacitor',
    description: 'Slow rotation on high regulator speed; replace 2.5mfd capacitor and check bearing lubrication.',
    isEmergency: false,
    customerName: 'Siddharth Roy',
    customerPhone: '+91 98740 54321',
    customerAddress: 'Block C-12, Green Park Avenue, New Town Action Area 1, Kolkata 700156',
    address: 'Block C-12, Green Park Avenue, New Town Action Area 1, Kolkata 700156',
    distanceKm: 3.2,
    etaMins: 20,
    basePrice: 220,
    extraAmount: 0,
    scheduledTime: 'Today • 3:30 PM Slot',
    scheduledDate: new Date(),
    scheduledStartTime: new Date().toISOString(),
    scheduledEndTime: new Date(Date.now() + 7200000).toISOString(),
    status: 'CONFIRMED',
    latitude: 22.5850,
    longitude: 88.4620,
  },
  {
    id: 'gig_std_3',
    bookingCode: 'BK-2026-0941',
    serviceTitle: 'Inverter Battery Terminal Cleaning & Water Top-up',
    description: 'Lead-acid backup inverter showing high temperature warning; inspect distilled water levels.',
    isEmergency: false,
    customerName: 'Pooja Mukherjee',
    customerPhone: '+91 94330 98765',
    customerAddress: 'House 18, Rabindra Pally, Barasat Road, Madhyamgram 700130',
    address: 'House 18, Rabindra Pally, Barasat Road, Madhyamgram 700130',
    distanceKm: 1.8,
    etaMins: 15,
    basePrice: 280,
    extraAmount: 0,
    scheduledTime: 'Tomorrow • 11:00 AM Slot',
    scheduledDate: new Date(Date.now() + 86400000),
    scheduledStartTime: new Date(Date.now() + 86400000).toISOString(),
    scheduledEndTime: new Date(Date.now() + 90000000).toISOString(),
    status: 'PENDING',
    latitude: 22.7010,
    longitude: 88.4520,
  },
  // Completed jobs for September 2026 (Current Month)
  {
    id: 'gig_comp_1',
    bookingCode: 'BK-2026-0891',
    serviceTitle: 'Main Switchboard MCB Trip Fix',
    description: '32A double pole MCB replaced due to heating; internal load balance verified.',
    isEmergency: false,
    customerName: 'Kunal Ghosh',
    customerPhone: '+91 98311 98765',
    customerAddress: 'Flat 3A, Sukanta Pally, Madhyamgram, Kolkata 700129',
    address: 'Flat 3A, Sukanta Pally, Madhyamgram, Kolkata 700129',
    distanceKm: 1.2,
    etaMins: 0,
    basePrice: 350,
    extraAmount: 150,
    finalPrice: 500,
    workerPayout: 425.00,
    scheduledTime: 'Completed • 04 Sep 2026, 3:30 PM',
    scheduledDate: new Date('2026-09-04T13:30:00.000Z'),
    scheduledStartTime: '2026-09-04T13:30:00.000Z',
    scheduledEndTime: '2026-09-04T15:30:00.000Z',
    status: 'COMPLETED',
    latitude: 22.6950,
    longitude: 88.4550,
  },
  {
    id: 'gig_comp_2',
    bookingCode: 'BK-2026-0842',
    serviceTitle: 'Emergency Short Circuit Diagnosis',
    description: 'Neutral wire melted inside meter box junction; repaired with heavy gauge copper conduit.',
    isEmergency: true,
    customerName: 'Meenakshi Banerjee',
    customerPhone: '+91 98745 12340',
    customerAddress: 'Plot 42, Ward 12, Barasat Road, Kolkata 700126',
    address: 'Plot 42, Ward 12, Barasat Road, Kolkata 700126',
    distanceKm: 2.1,
    etaMins: 0,
    basePrice: 450,
    extraAmount: 0,
    finalPrice: 450,
    workerPayout: 382.50,
    scheduledTime: 'Completed • 05 Sep 2026, 11:00 AM',
    scheduledDate: new Date('2026-09-05T09:30:00.000Z'),
    scheduledStartTime: '2026-09-05T09:30:00.000Z',
    scheduledEndTime: '2026-09-05T11:00:00.000Z',
    status: 'COMPLETED',
    latitude: 22.7050,
    longitude: 88.4600,
  },
  {
    id: 'gig_comp_3',
    bookingCode: 'BK-2026-0795',
    serviceTitle: 'Ceiling Fan Fixing & Regulator',
    description: 'Replaced rotary electronic step regulator and balanced blades to eliminate wobbling sound.',
    isEmergency: false,
    customerName: 'Debabrata Das',
    customerPhone: '+91 94320 65432',
    customerAddress: 'Block 2, Lake Town, South Dum Dum, Kolkata 700089',
    address: 'Block 2, Lake Town, South Dum Dum, Kolkata 700089',
    distanceKm: 4.5,
    etaMins: 0,
    basePrice: 250,
    extraAmount: 100,
    finalPrice: 350,
    workerPayout: 297.50,
    scheduledTime: 'Completed • 06 Sep 2026, 2:15 PM',
    scheduledDate: new Date('2026-09-06T12:30:00.000Z'),
    scheduledStartTime: '2026-09-06T12:30:00.000Z',
    scheduledEndTime: '2026-09-06T14:15:00.000Z',
    status: 'COMPLETED',
    latitude: 22.6020,
    longitude: 88.4010,
  },
  {
    id: 'gig_comp_4',
    bookingCode: 'BK-2026-0710',
    serviceTitle: 'Heavy Appliance 16A Power Point Installation',
    description: 'New 16A modular socket with individual 20A MCB for 1.5 ton inverter air conditioner.',
    isEmergency: false,
    customerName: 'Ritwik Bose',
    customerPhone: '+91 98305 77665',
    customerAddress: 'Tower 3, Rajarhat Expressway, Action Area 2, Kolkata 700135',
    address: 'Tower 3, Rajarhat Expressway, Action Area 2, Kolkata 700135',
    distanceKm: 3.8,
    etaMins: 0,
    basePrice: 400,
    extraAmount: 50,
    finalPrice: 450,
    workerPayout: 382.50,
    scheduledTime: 'Completed • 07 Sep 2026, 5:00 PM',
    scheduledDate: new Date('2026-09-07T15:30:00.000Z'),
    scheduledStartTime: '2026-09-07T15:30:00.000Z',
    scheduledEndTime: '2026-09-07T17:00:00.000Z',
    status: 'COMPLETED',
    latitude: 22.6150,
    longitude: 88.4680,
  },
  // Completed jobs for August 2026 (Previous Month)
  {
    id: 'gig_comp_aug_1',
    bookingCode: 'BK-2026-0612',
    serviceTitle: 'Submersible Pump Starter Box Wiring',
    description: 'Contactor coil burned due to low voltage; replaced with L&T 16A starter coil.',
    isEmergency: false,
    customerName: 'Samir Mukherjee',
    customerPhone: '+91 98319 88776',
    customerAddress: 'Old Calcutta Road, Barrackpore, Kolkata 700120',
    address: 'Old Calcutta Road, Barrackpore, Kolkata 700120',
    distanceKm: 5.2,
    etaMins: 0,
    basePrice: 550,
    extraAmount: 150,
    finalPrice: 700,
    workerPayout: 595.00,
    scheduledTime: 'Completed • 25 Aug 2026, 4:00 PM',
    scheduledDate: new Date('2026-08-25T14:00:00.000Z'),
    scheduledStartTime: '2026-08-25T14:00:00.000Z',
    scheduledEndTime: '2026-08-25T16:00:00.000Z',
    status: 'COMPLETED',
    latitude: 22.7600,
    longitude: 88.3700,
  },
  {
    id: 'gig_comp_aug_2',
    bookingCode: 'BK-2026-0590',
    serviceTitle: 'Whole Flat LED Downlight Replacement',
    description: 'Replaced 8 recessed 12W warm white LED ceiling panels in living hall.',
    isEmergency: false,
    customerName: 'Mousumi Paul',
    customerPhone: '+91 98741 22334',
    customerAddress: 'Rajarhat Main Road, Chinar Park, Kolkata 700136',
    address: 'Rajarhat Main Road, Chinar Park, Kolkata 700136',
    distanceKm: 2.8,
    etaMins: 0,
    basePrice: 480,
    extraAmount: 0,
    finalPrice: 480,
    workerPayout: 408.00,
    scheduledTime: 'Completed • 18 Aug 2026, 1:30 PM',
    scheduledDate: new Date('2026-08-18T12:00:00.000Z'),
    scheduledStartTime: '2026-08-18T12:00:00.000Z',
    scheduledEndTime: '2026-08-18T13:30:00.000Z',
    status: 'COMPLETED',
    latitude: 22.6280,
    longitude: 88.4410,
  },
];

export default function WorkerPage() {
  const defaultWorker = WORKERS[0]; // Ramesh Kumar fallback
  const [workerData, setWorkerData] = useState(defaultWorker);

  // Navigation views: 'home' | 'jobs' | 'job-detail' | 'wallet' | 'schedule' | 'profile'
  const [currentView, setCurrentView] = useState('home');

  // Assigned Jobs State
  const [assignedJobs, setAssignedJobs] = useState(INITIAL_ASSIGNED_JOBS);
  const [selectedJob, setSelectedJob] = useState(INITIAL_ASSIGNED_JOBS[0]);
  const [filterDate, setFilterDate] = useState(null);

  // Availability & GPS State
  const [availability, setAvailability] = useState('AVAILABLE'); // 'AVAILABLE' | 'OFFLINE'
  const [isLocating, setIsLocating] = useState(false);
  const [workerCoords, setWorkerCoords] = useState({ lat: 22.6950, lng: 88.4550 });
  const [workerLocation, setWorkerLocation] = useState('Madhyamgram, Kolkata');
  const [clusterRadius, setClusterRadius] = useState('15 km');

  // Dynamic monthly earnings calculation based on completed jobs and scheduledEndTime
  const monthlyBreakdown = useMemo(() => {
    return calculateMonthlyEarningsBreakdown(assignedJobs);
  }, [assignedJobs]);

  const currentMonthEarningsNum = useMemo(() => {
    return getCurrentMonthEarnings(assignedJobs, new Date());
  }, [assignedJobs]);

  const monthlyEarnings = useMemo(() => {
    return currentMonthEarningsNum.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [currentMonthEarningsNum]);

  const currentMonthWelfare = useMemo(() => {
    const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const welfare = monthlyBreakdown[currentMonthKey]?.totalWelfare || (currentMonthEarningsNum * (0.05 / 0.85));
    return welfare.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [monthlyBreakdown, currentMonthEarningsNum]);

  // Reverse Geocoding Helper
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      if (res.ok) {
        const data = await res.json();
        const locality = data.locality || data.city || data.principalSubdivision || '';
        const city = data.city && data.city !== locality ? data.city : (data.principalSubdivision || '');
        if (locality && city) {
          const formatted = `${locality}, ${city}`;
          setWorkerLocation(formatted);
          return formatted;
        } else if (locality || city) {
          const formatted = locality || city;
          setWorkerLocation(formatted);
          return formatted;
        }
      }
    } catch (e) {
      console.warn('Reverse geocode error:', e);
    }
    return 'Madhyamgram, Kolkata';
  };

  // Fetch initial location from browser GPS on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setWorkerCoords({ lat: latitude, lng: longitude });
          reverseGeocode(latitude, longitude);
        },
        () => {
          reverseGeocode(22.6950, 88.4550);
        },
        { timeout: 6000 }
      );
    }
  }, []);

  // Modals & Async States
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [jobToReject, setJobToReject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flash Notifications
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('success');

  // 1. Fetch live authenticated worker details
  useEffect(() => {
    async function loadWorkerProfile() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (data.success && data.user) {
          const user = data.user;
          setWorkerData(prev => ({
            ...prev,
            id: user.worker?.id || prev.id,
            name: user.name || prev.name,
            initials: user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : prev.initials,
            trade: user.worker?.skills?.[0] || prev.trade,
            society: user.worker?.cooperativeName || prev.society,
            ncctTier: prev.ncctTier,
            skills: user.worker?.skills?.length ? user.worker.skills : prev.skills,
            averageRating: user.worker?.averageRating || prev.averageRating,
          }));

          if (user.worker?.availabilityStatus) {
            setAvailability(user.worker.availabilityStatus);
          }
          if (user.worker?.latitude && user.worker?.longitude) {
            setWorkerCoords({ lat: user.worker.latitude, lng: user.worker.longitude });
            reverseGeocode(user.worker.latitude, user.worker.longitude);
          }
        }
      } catch (e) {
        console.warn('Could not fetch authenticated worker profile:', e);
      }
    }
    loadWorkerProfile();
  }, []);

  // 1b. Fetch bookings from API and merge into assignedJobs with continuous live synchronization
  const loadBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      const list = data.data || data.bookings;
      if (data.success && Array.isArray(list) && list.length > 0) {
        setAssignedJobs(prev => {
          const incomingMap = new Map(list.map(b => [b.id, b]));
          const updatedExisting = prev.map(job => {
            const incoming = incomingMap.get(job.id) || (job.bookingCode && list.find(b => b.bookingCode === job.bookingCode));
            if (incoming) {
              incomingMap.delete(incoming.id);
              return { 
                ...job, 
                ...incoming, 
                status: incoming.status || job.status,
                finalPrice: Number(incoming.finalPrice || job.finalPrice || 250),
              };
            }
            return job;
          });
          const newOnes = Array.from(incomingMap.values());
          return [...newOnes, ...updatedExisting];
        });
      }
    } catch (e) {
      console.warn('Could not load live bookings:', e);
    }
  }, []);

  useEffect(() => {
    loadBookings();
    const interval = setInterval(loadBookings, 4000);

    let channel;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('a2zee_booking_channel');
        channel.onmessage = (msg) => {
          if (msg.data?.type === 'STATUS_CHANGE' || msg.data?.type === 'NEW_BOOKING') {
            loadBookings();
          }
        };
      } catch (e) {}
    }

    const handleSync = () => loadBookings();
    window.addEventListener('storage', handleSync);
    window.addEventListener('a2zee-booking-status-change', handleSync);

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('a2zee-booking-status-change', handleSync);
    };
  }, [loadBookings]);

  // 2. Synchronize navigation with floating navbar custom events
  useEffect(() => {
    const handleNavEvent = (e) => {
      const tab = e.detail;
      if (tab && ['home', 'jobs', 'active', 'wallet', 'schedule', 'profile'].includes(tab)) {
        if (tab === 'active') setCurrentView('jobs');
        else setCurrentView(tab);
      }
    };

    window.addEventListener('a2zee-worker-tab', handleNavEvent);
    return () => {
      window.removeEventListener('a2zee-worker-tab', handleNavEvent);
    };
  }, []);

  const handleViewChange = (tabId) => {
    setCurrentView(tabId);
    window.dispatchEvent(new CustomEvent('a2zee-worker-tab-change', { detail: tabId }));
  };

  // 3. Online/Offline Availability Toggle with live Device GPS Geolocation
  const handleToggleAvailability = () => {
    const nextStatus = availability === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';

    if (nextStatus === 'AVAILABLE') {
      setIsLocating(true);
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setWorkerCoords({ lat, lng });
            setAvailability('AVAILABLE');
            setIsLocating(false);

            const locName = (await reverseGeocode(lat, lng)) || 'Madhyamgram, Kolkata';

            try {
              await fetch('/api/workers/location', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  workerId: workerData.id,
                  availabilityStatus: 'AVAILABLE',
                  latitude: lat,
                  longitude: lng,
                }),
              });
              setNoticeType('success');
              setNotice(`Live GPS Synced: ${locName}. You are now ONLINE & ready for emergency dispatch!`);
            } catch {
              setNoticeType('success');
              setNotice(`You are now ONLINE at ${locName}.`);
            }
          },
          async (err) => {
            console.warn('GPS error fallback:', err);
            setIsLocating(false);
            setAvailability('AVAILABLE');
            const locName = (await reverseGeocode(workerCoords.lat, workerCoords.lng)) || 'Madhyamgram, Kolkata';
            try {
              await fetch('/api/workers/location', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  workerId: workerData.id,
                  availabilityStatus: 'AVAILABLE',
                  latitude: workerCoords.lat,
                  longitude: workerCoords.lng,
                }),
              });
            } catch {}
            setNoticeType('success');
            setNotice(`Online status enabled (${locName}).`);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        setIsLocating(false);
        setAvailability('AVAILABLE');
        fetch('/api/workers/location', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workerId: workerData.id,
            availabilityStatus: 'AVAILABLE',
          }),
        }).catch(() => {});
        setNoticeType('success');
        setNotice('You are now ONLINE & ready for emergency dispatch.');
      }
    } else {
      // Switching OFFLINE
      setIsLocating(false);
      setAvailability('OFFLINE');
      fetch('/api/workers/location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: workerData.id,
          availabilityStatus: 'OFFLINE',
        }),
      }).catch(() => {});
      setNoticeType('warning');
      setNotice('You are now OFFLINE. Emergency and instant dispatches paused.');
    }
  };

  // 4. Open Detailed View for any assigned job
  const handleOpenJobDetails = (job) => {
    setSelectedJob(job);
    setCurrentView('job-detail');
  };

  // 5. Open Rejection Modal for specific job
  const handleInitiateReject = (job) => {
    setJobToReject(job);
    setIsRejectModalOpen(true);
  };

  // 6. Confirm Rejection & Execute Cascading Reassignment in Backend
  const handleConfirmReject = async (reason) => {
    if (!jobToReject) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${jobToReject.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: workerData.id,
          reason,
        }),
      });
      const data = await res.json();

      setIsRejectModalOpen(false);
      setNoticeType('warning');

      if (data.data?.newAssignedArtisan) {
        setNotice(`Job rejected. Cascading reassignment complete: allocated to candidate ${data.data.newAssignedArtisan.name} (${data.data.newAssignedArtisan.distanceKm} km away).`);
      } else {
        setNotice('Job rejected. Automatic reassignment cascade initiated.');
      }

      const rejectedId = jobToReject.id;
      setAssignedJobs(prev => prev.filter(j => j.id !== rejectedId));
      if (selectedJob?.id === rejectedId) {
        setSelectedJob(null);
        setCurrentView('home');
      }
    } catch (err) {
      console.error('Rejection error:', err);
      setIsRejectModalOpen(false);
      setNoticeType('warning');
      setNotice('Job rejected. Cascaded to next candidate.');
      const rejectedId = jobToReject.id;
      setAssignedJobs(prev => prev.filter(j => j.id !== rejectedId));
      if (selectedJob?.id === rejectedId) {
        setSelectedJob(null);
        setCurrentView('home');
      }
    } finally {
      setIsSubmitting(false);
      setJobToReject(null);
    }
  };

  // 7. Add Mid-Work Extra Charges from Detail View
  const handleAddExtraCharges = async (chargeData) => {
    if (!selectedJob) return;
    setIsSubmitting(true);
    try {
      // Maintain full list of individual extra charges
      const currentCharges = Array.isArray(selectedJob.extraCharges) 
        ? [...selectedJob.extraCharges] 
        : ((selectedJob.extraAmount || 0) > 0 
            ? [{ 
                id: 'chg_init', 
                reason: selectedJob.extraChargeReason || 'On-site adjustments', 
                amount: Number(selectedJob.extraAmount), 
                createdAt: new Date().toISOString() 
              }] 
            : []);

      const newChargeItem = {
        id: `chg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        reason: chargeData.reason || 'On-site adjustments',
        amount: Number(chargeData.extraAmount) || 0,
        createdAt: new Date().toISOString(),
      };

      const updatedCharges = [...currentCharges, newChargeItem];
      const updatedExtra = updatedCharges.reduce((sum, c) => sum + Number(c.amount || 0), 0);
      const baseNum = Number(selectedJob.basePrice || 0);
      const emergencySurcharge = selectedJob.isEmergency ? 100 : 0;
      const newFinalPrice = baseNum + updatedExtra + emergencySurcharge;
      
      const updatedJob = {
        ...selectedJob,
        extraAmount: updatedExtra,
        additionalPrice: updatedExtra,
        finalPrice: newFinalPrice,
        extraChargeReason: chargeData.reason,
        extraCharges: updatedCharges,
      };

      setSelectedJob(updatedJob);
      setAssignedJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));

      await fetch(`/api/bookings/${selectedJob.id}/extra-charges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...chargeData,
          totalExtra: updatedExtra,
          extraCharges: updatedCharges,
        }),
      }).catch(() => {});

      // Sync extra charges with user localStorage bookings
      if (typeof window !== 'undefined') {
        try {
          const saved = JSON.parse(localStorage.getItem('a2zee_user_bookings') || '[]');
          const updatedList = saved.map(b => 
            (b.id === selectedJob.id || b.bookingCode === selectedJob.id || b.bookingCode === selectedJob.bookingCode)
              ? { 
                  ...b, 
                  extraAmount: updatedExtra, 
                  additionalPrice: updatedExtra, 
                  finalPrice: newFinalPrice,
                  extraChargeReason: chargeData.reason,
                  extraCharges: updatedCharges,
                }
              : b
          );
          localStorage.setItem('a2zee_user_bookings', JSON.stringify(updatedList));
          window.dispatchEvent(new CustomEvent('a2zee-booking-status-change', {
            detail: { 
              bookingId: selectedJob.id, 
              bookingCode: selectedJob.bookingCode,
              extraAmount: updatedExtra, 
              additionalPrice: updatedExtra,
              finalPrice: newFinalPrice,
              extraCharges: updatedCharges,
            }
          }));
        } catch (e) {}
      }

      setNoticeType('success');
      setNotice(`Extra charge #${updatedCharges.length} (₹${chargeData.extraAmount}) logged directly to customer bill.`);
    } catch (err) {
      console.error('Error adding extra charges:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 8. Update Job Status Pipeline (IN_PROGRESS, COMPLETED)
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedJob) return;
    const nowIso = new Date().toISOString();
    const baseNum = Number(selectedJob.basePrice || 0);
    const extraNum = Number(selectedJob.extraAmount || 0);
    const finalPrice = Number(selectedJob.finalPrice) || (baseNum + extraNum);
    const workerPayout = selectedJob.workerPayout !== undefined ? Number(selectedJob.workerPayout) : (finalPrice * 0.85);

    const updatedJob = { 
      ...selectedJob, 
      status: newStatus,
      finalPrice,
      workerPayout,
      ...(newStatus === 'COMPLETED' && {
        scheduledEndTime: selectedJob.scheduledEndTime || nowIso,
      }),
    };
    setSelectedJob(updatedJob);
    setAssignedJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));

    // 1. Sync PATCH with backend API
    try {
      await fetch(`/api/bookings/${selectedJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          finalPrice,
          workerPayout,
          scheduledEndTime: updatedJob.scheduledEndTime,
        }),
      });
    } catch (apiErr) {
      console.warn('API status patch note:', apiErr);
    }

    // 2. Sync with localStorage so user tracking screen immediately catches update
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('a2zee_user_bookings') || '[]');
        const targetId = selectedJob.id;
        const targetCode = selectedJob.bookingCode;
        const foundIndex = saved.findIndex(b => 
          b.id === targetId || 
          b.bookingCode === targetId || 
          (targetCode && (b.id === targetCode || b.bookingCode === targetCode))
        );

        let updatedList;
        if (foundIndex >= 0) {
          updatedList = saved.map((b, idx) => 
            idx === foundIndex 
              ? { 
                  ...b, 
                  ...updatedJob, 
                  status: newStatus, 
                  finalPrice, 
                  workerPayout, 
                  extraAmount: extraNum, 
                  scheduledEndTime: updatedJob.scheduledEndTime 
                }
              : b
          );
        } else {
          updatedList = [
            {
              ...updatedJob,
              status: newStatus,
              finalPrice,
              workerPayout,
              extraAmount: extraNum,
              scheduledEndTime: updatedJob.scheduledEndTime,
            },
            ...saved,
          ];
        }
        localStorage.setItem('a2zee_user_bookings', JSON.stringify(updatedList));

        // Dispatch storage and custom cross-tab events
        window.dispatchEvent(new CustomEvent('a2zee-booking-status-change', {
          detail: { bookingId: selectedJob.id, bookingCode: selectedJob.bookingCode, status: newStatus, finalPrice }
        }));

        // Broadcast cross-tab to User and Admin portals
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('a2zee_booking_channel');
          bc.postMessage({
            type: 'STATUS_CHANGE',
            bookingId: selectedJob.id,
            bookingCode: selectedJob.bookingCode,
            status: newStatus,
            finalPrice,
          });
          bc.close();
        }
      } catch (storageErr) {
        console.warn('Storage sync error:', storageErr);
      }
    }

    setNoticeType('success');
    if (newStatus === 'IN_PROGRESS') {
      setNotice('Work marked IN PROGRESS on customer bill. Mid-work adjustments enabled.');
    } else if (newStatus === 'COMPLETED') {
      setNotice('Job marked COMPLETED. Final bill generated and 85% payout settled directly to wallet!');
    }
  };

  // Filter jobs by date if a calendar filter is active; otherwise show active non-completed work orders
  const displayedJobs = useMemo(() => {
    return assignedJobs.filter((job) => {
      if (!filterDate) return job.status !== 'COMPLETED';
      const dateVal = job.scheduledDate || job.scheduledStartTime;
      if (!dateVal) return true;
      const jobD = new Date(dateVal);
      const selD = new Date(filterDate);
      return (
        jobD.getFullYear() === selD.getFullYear() &&
        jobD.getMonth() === selD.getMonth() &&
        jobD.getDate() === selD.getDate()
      );
    });
  }, [assignedJobs, filterDate]);

  return (
    <div className="flex-1 flex flex-col w-full pb-28 animate-in fade-in duration-200">
      
      {/* 1. ARTISAN HOMEPAGE */}
      {currentView === 'home' && (
        <div className="flex-1 flex flex-col w-full pb-16 animate-in fade-in duration-200">
          
          {/* Header Component with Select, GPS Toggle, and Monthly Earnings Card */}
          <WorkerHomeHeader
            worker={workerData}
            workerLocation={workerLocation}
            availability={availability}
            isLocating={isLocating}
            onToggleAvailability={handleToggleAvailability}
            clusterRadius={clusterRadius}
            onSelectClusterRadius={setClusterRadius}
            monthlyEarnings={monthlyEarnings}
            onOpenWallet={() => handleViewChange('wallet')}
            onOpenProfile={() => handleViewChange('profile')}
          />

          {/* Main Content Sections */}
          <main className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto w-full px-5 sm:px-6 pt-6 space-y-6">
            
            {/* Notice Flash Banner */}
            {notice && (
              <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-xs animate-in fade-in-50 duration-200 ${
                noticeType === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  {noticeType === 'warning' ? (
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  )}
                  <span className="font-medium">{notice}</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setNotice('')}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Active Work Assignments Section Header with Calendar Option */}
            <div className="flex flex-row sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display uppercase tracking-wide">
                  Active Jobs
                </h2>
               
              </div>

              {/* Calendar DatePicker Option without white container */}
              <div className="flex items-center gap-2">
                <DatePicker
                  date={filterDate}
                  setDate={setFilterDate}
                  placeholder="Schedule Calendar"
                />
                {filterDate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFilterDate(null)}
                    className="h-9 w-9 text-slate-500 hover:text-slate-900 cursor-pointer"
                    title="Clear filter"
                  >
                    <FilterX className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Active Pill Indicator if active */}
            {filterDate && (
              <div className="flex items-center justify-between bg-[#E5EEFF]/70 text-[#1F4072] px-3.5 py-2 rounded-xl text-xs font-medium border border-[#1F4072]/20">
                <span className="flex items-center gap-2">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Filtered by scheduled date: <strong>{new Date(filterDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={() => setFilterDate(null)}
                  className="text-xs font-bold underline cursor-pointer hover:opacity-80"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Minimal Job Cards Feed (No extra box design, emergency/standard pin, truncated location) */}
            <div className="space-y-3">
              {displayedJobs.length > 0 ? (
                displayedJobs.map((job) => (
                  <WorkerJobMinimalCard
                    key={job.id}
                    booking={job}
                    onOpenDetails={handleOpenJobDetails}
                    onOpenRejectModal={handleInitiateReject}
                    isSubmitting={isSubmitting}
                  />
                ))
              ) : (
                <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl space-y-2">
                  <p className="text-sm font-semibold text-slate-600">No scheduled assignments on this date.</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFilterDate(null)}
                    className="rounded-xl text-xs"
                  >
                    View All Active Assignments
                  </Button>
                </div>
              )}
            </div>

            {/* Cooperative Welfare & Payout Promo Banner */}
            <WorkerCoopPromoBanner
              onOpenWallet={() => handleViewChange('wallet')}
            />

          </main>
        </div>
      )}

      {/* 2. DETAILED JOB VIEW (Opened when user clicks on a minimal job card) */}
      {currentView === 'job-detail' && (
        <div className="flex-1 flex flex-col w-full pb-16 animate-in fade-in duration-200">
          <TopHeaderBanner
            title="ASSIGNED WORK ORDER"
            // subtitle={`Job Code: ${selectedJob?.bookingCode || 'BK-2026'} • Detailed View`}
            onBack={() => setCurrentView('home')}
          />

          <main className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto w-full px-5 sm:px-6 pt-6">
            <WorkerJobDetailView
              booking={selectedJob}
              onBack={() => setCurrentView('home')}
              onOpenRejectModal={handleInitiateReject}
              onAddExtraCharges={handleAddExtraCharges}
              onUpdateStatus={handleUpdateStatus}
              isSubmitting={isSubmitting}
            />
          </main>
        </div>
      )}

      {/* 3. JOBS / ACTIVE FEED VIEW (Accessible from Navbar 'JOBS' tab) */}
      {currentView === 'jobs' && (
        <div className="flex-1 flex flex-col w-full pb-16 animate-in fade-in duration-200">
          <TopHeaderBanner
            title="ASSIGNED WORK ORDERS"
            subtitle="Queue of scheduled assignments and on-site dispatches"
            onBack={() => handleViewChange('home')}
          />

          <main className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto w-full px-5 sm:px-6 pt-6 space-y-5">
            
            {/* Calendar Filter Option without white card container */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Schedule Filter
                </p>
                <p className="text-[11px] text-slate-500">
                  Select a date to view future scheduled work orders
                </p>
              </div>
              <DatePicker
                date={filterDate}
                setDate={setFilterDate}
                placeholder="Pick Date"
              />
            </div>

            {/* List of Minimal Cards */}
            <div className="space-y-3">
              {displayedJobs.map((job) => (
                <WorkerJobMinimalCard
                  key={job.id}
                  booking={job}
                  onOpenDetails={handleOpenJobDetails}
                  onOpenRejectModal={handleInitiateReject}
                  isSubmitting={isSubmitting}
                />
              ))}
            </div>
          </main>
        </div>
      )}

      {/* 4. COOPERATIVE WALLET VIEW (Navbar 'WALLET' tab) */}
      {currentView === 'wallet' && (
        <div className="flex-1 flex flex-col w-full pb-16 animate-in fade-in duration-200">
          <TopHeaderBanner
            title="COOPERATIVE WALLET"
            //subtitle="85% direct payouts, 5% welfare trust fund & settlements"
            onBack={() => handleViewChange('home')}
          />

          <main className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto w-full px-5 sm:px-6 pt-6 space-y-6">
            <WorkerWalletView
              walletBalance={monthlyEarnings}
              welfareBalance={currentMonthWelfare}
              cooperativeName={workerData.society}
              assignedJobs={assignedJobs}
              monthlyBreakdown={monthlyBreakdown}
            />
          </main>
        </div>
      )}

      {/* 5. ARTISAN PROFILE VIEW (From Avatar in Header) */}
      {currentView === 'profile' && (
        <WorkerProfileView
          worker={workerData}
          onBack={() => handleViewChange('home')}
          onOpenWallet={() => handleViewChange('wallet')}
          onUpdateWorker={(updated) => {
            setWorkerData(updated);
            setNoticeType('success');
            setNotice('Profile details updated successfully.');
          }}
        />
      )}

      {/* Cascading Rejection Modal */}
      <WorkerRejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        bookingCode={jobToReject?.bookingCode}
        onConfirmReject={handleConfirmReject}
        isSubmitting={isSubmitting}
      />

    </div>
  );
}
