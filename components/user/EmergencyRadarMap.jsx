'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Navigation, Radio, Loader2, Users } from 'lucide-react';

export function EmergencyRadarMap({
  nearbyArtisans = [],
  userCoords = { lat: 22.6950, lng: 88.4550 },
  areaName = 'Madhyamgram, Kolkata',
  selectedTrade = '',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerLayerRef = useRef(null);
  const leafletRef = useRef(null);

  const [isMapReady, setIsMapReady] = useState(false);
  const [liveArtisans, setLiveArtisans] = useState(nearbyArtisans);
  const [isLoadingArtisans, setIsLoadingArtisans] = useState(false);

  // 1. Fetch all online emergency artisans for this skill category within 20km radius
  useEffect(() => {
    let isCancelled = false;

    async function fetchOnlineWorkers() {
      setIsLoadingArtisans(true);
      try {
        const queryParams = new URLSearchParams({
          lat: userCoords.lat.toString(),
          lng: userCoords.lng.toString(),
          emergency: 'true',
          ...(selectedTrade ? { skill: selectedTrade } : {}),
        });

        const res = await fetch(`/api/workers/nearby?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          const list = json.rankedCandidates || json.data || [];
          if (!isCancelled && Array.isArray(list) && list.length > 0) {
            setLiveArtisans(list);
          }
        }
      } catch (err) {
        console.warn('Could not fetch online emergency workers:', err);
      } finally {
        if (!isCancelled) setIsLoadingArtisans(false);
      }
    }

    fetchOnlineWorkers();
    return () => {
      isCancelled = true;
    };
  }, [selectedTrade, userCoords.lat, userCoords.lng]);

  // Sync if parent updates nearbyArtisans
  useEffect(() => {
    if (Array.isArray(nearbyArtisans) && nearbyArtisans.length > 0) {
      setLiveArtisans(nearbyArtisans);
    }
  }, [nearbyArtisans]);

  // 2. Initialize OpenStreetMap (Leaflet) ONCE on mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        leafletRef.current = L;

        if (!isMounted || !mapContainerRef.current) return;

        // Create map instance ONLY once
        if (!mapInstanceRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [userCoords.lat, userCoords.lng],
            zoom: 13,
            zoomControl: false,
            attributionControl: false,
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          }).addTo(map);

          // Dedicated layer group for pins so we can update them without recreating the map
          const markerLayer = L.layerGroup().addTo(map);
          markerLayerRef.current = markerLayer;
          mapInstanceRef.current = map;

          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          }, 150);

          setIsMapReady(true);
        }
      } catch (e) {
        console.warn('Leaflet emergency radar map init note:', e);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerLayerRef.current = null;
      }
    };
  }, []);

  // 3. Update Markers & Single Fit Bounds (strictly once per data update, no duplicate zoom out)
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !markerLayerRef.current || !leafletRef.current) {
      return;
    }

    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const markerLayer = markerLayerRef.current;

    // Clear existing markers cleanly in memory without destroying the map
    markerLayer.clearLayers();

    const bounds = L.latLngBounds([[userCoords.lat, userCoords.lng]]);

    // User Radar Anchor Icon
    const userRadarIcon = L.divIcon({
      className: 'custom-user-radar-pin',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; background: rgba(31,64,114,0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 22px; height: 22px; background: #1F4072; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(31,64,114,0.4); display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; background: #ffffff; border-radius: 50%;"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const userMarker = L.marker([userCoords.lat, userCoords.lng], {
      icon: userRadarIcon,
      zIndexOffset: 1000,
    });

    userMarker.bindTooltip(
      `<div style="font-weight: 700; color: #1F4072; font-size: 11px;">You (Emergency Location)</div><div style="font-size: 10px; color: #64748b;">${areaName}</div>`,
      { permanent: false, direction: 'top', className: 'rounded-xl shadow-md border-0 p-1.5' }
    );
    markerLayer.addLayer(userMarker);

    // Plot all online skill workers within 20km radius
    let validWorkersCount = 0;
    liveArtisans.forEach((worker) => {
      const lat = parseFloat(worker.latitude);
      const lng = parseFloat(worker.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        bounds.extend([lat, lng]);
        validWorkersCount++;

        const workerIcon = L.divIcon({
          className: 'custom-artisan-radar-pin',
          html: `
            <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div style="position: absolute; -top: 2px; -right: 2px; width: 8px; height: 8px; background: #10B981; border-radius: 50%; border: 1.5px solid #ffffff; z-index: 10;"></div>
              <div style="width: 26px; height: 26px; background: #ffffff; border-radius: 50%; border: 2.5px solid #1F4072; box-shadow: 0 3px 8px rgba(0,0,0,0.18); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #1F4072;">
                ${worker.name ? worker.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const workerMarker = L.marker([lat, lng], {
          icon: workerIcon,
        });

        const trade = worker.skills?.[0] || selectedTrade || 'Artisan';
        const dist = worker.distanceKm ? `${worker.distanceKm} km away` : 'Within 20 km';
        const eta = worker.etaMinutes ? ` • ETA ~${worker.etaMinutes}m` : '';

        workerMarker.bindTooltip(
          `<div style="font-weight: 700; color: #0f172a; font-size: 11px;">${worker.name}</div>` +
          `<div style="font-size: 10px; color: #10B981; font-weight: 600;">● Online • ${trade}</div>` +
          `<div style="font-size: 10px; color: #1F4072; font-weight: 700;">${dist}${eta}</div>`,
          { direction: 'top', className: 'rounded-xl shadow-md border-0 p-2' }
        );

        markerLayer.addLayer(workerMarker);
      }
    });

    // Auto zoom out / fit bounds ONCE with padding so all workers and user fit inside frame
    if (validWorkersCount > 0) {
      map.fitBounds(bounds, {
        padding: [38, 38],
        maxZoom: 14,
        animate: true,
      });
    } else {
      map.setView([userCoords.lat, userCoords.lng], 13);
    }
  }, [isMapReady, liveArtisans, userCoords.lat, userCoords.lng, areaName, selectedTrade]);

  const onlineCount = liveArtisans.length;
  const closestEta = liveArtisans[0]?.etaMinutes || 8;

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs animate-in fade-in duration-150 space-y-2.5 sm:space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">

            <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight block">
              Emergency Radar Active
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block truncate">
            {selectedTrade ? `Showing all ${selectedTrade} artisans within 20km radius` : 'All nearby verified online artisans in view'}
          </span>
        </div>
        
      </div>

      {/* Interactive OpenStreetMap Container */}
      <div className="relative w-full h-48 sm:h-56 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-100 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Minimal Location Anchor Pill */}
        <div className="absolute top-2.5 left-2.5 z-[500] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 max-w-[80%] truncate">
          <Navigation className="w-3 h-3 text-[#1F4072] flex-shrink-0" />
          <span className="truncate">Framed: {areaName}</span>
        </div>

        {/* Floating Live Artisan ETA pill */}
        <div className="absolute bottom-2.5 right-2.5 z-[500] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-slate-200/80 shadow-xs text-[11px] font-bold text-[#1F4072] flex items-center gap-1">
          <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
          <span>Closest ETA: ~{closestEta} mins</span>
        </div>

        {isLoadingArtisans && (
          <div className="absolute top-2.5 right-2.5 z-[500] bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200">
            <Loader2 className="w-3.5 h-3.5 text-[#1F4072] animate-spin" />
          </div>
        )}
      </div>

      {/* Micro-footer */}
      <p className="text-[10px] sm:text-[11px] text-slate-500 text-center font-normal">
        GPS Center: {userCoords.lat.toFixed(4)}° N, {userCoords.lng.toFixed(4)}° E • Auto-framed for all {selectedTrade || 'service'} artisans within 20km
      </p>
    </div>
  );
}

export default EmergencyRadarMap;
