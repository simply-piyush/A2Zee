'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, MapPin, Navigation, Loader2, Home, Building2, Briefcase, Store, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const PRESET_LABELS = [
  { id: 'Home', label: 'Home', icon: Home },
  { id: 'Work', label: 'Work', icon: Briefcase },
  { id: 'Shop', label: 'Shop', icon: Store },
  { id: 'Apartment', label: 'Apartment', icon: Building2 },
  { id: 'Other', label: 'Other', icon: Tag },
];

export function AddressAddModal({
  isOpen,
  onClose,
  onAddAddress,
  initialCoords = { lat: 22.6950, lng: 88.4550 },
  currentCount = 0,
}) {
  // Schema-aligned form state (from schema.prisma Address model)
  const [label, setLabel] = useState('Home');
  const [addressLine, setAddressLine] = useState('Madhyamgram, Kolkata');
  const [city, setCity] = useState('Kolkata');
  const [state, setState] = useState('West Bengal');
  const [postalCode, setPostalCode] = useState('700129');
  const [latitude, setLatitude] = useState(initialCoords.lat.toFixed(6));
  const [longitude, setLongitude] = useState(initialCoords.lng.toFixed(6));
  const [isDefault, setIsDefault] = useState(false);

  // Map & loading state
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Reverse geocoding helper - updates addressLine, city, state, postalCode automatically
  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      if (res.ok) {
        const data = await res.json();
        const road = data.localityInfo?.administrative?.[4]?.name || data.localityInfo?.administrative?.[3]?.name || '';
        const locality = data.locality || data.city || '';
        const cCity = data.city || data.principalSubdivision || 'Kolkata';
        const cState = data.principalSubdivision || 'West Bengal';
        const cPostal = data.postcode || '700129';

        let fullStr = [road, locality, cCity].filter(Boolean).join(', ');
        if (!fullStr || fullStr.length < 5) {
          fullStr = `${lat.toFixed(4)}, ${lng.toFixed(4)}, ${cCity}`;
        }

        setAddressLine(fullStr);
        setCity(cCity);
        setState(cState);
        setPostalCode(cPostal);
        setIsGeocoding(false);
        return;
      }
    } catch (e) {
      console.warn('BigDataCloud geocode fallback:', e);
    }

    try {
      const res2 = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2?.display_name) {
          setAddressLine(data2.display_name.split(',').slice(0, 4).join(','));
          if (data2.address?.city || data2.address?.town) {
            setCity(data2.address.city || data2.address.town);
          }
          if (data2.address?.state) {
            setState(data2.address.state);
          }
          if (data2.address?.postcode) {
            setPostalCode(data2.address.postcode);
          }
        }
      }
    } catch (e2) {
      console.warn('Nominatim geocode fallback:', e2);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Sync coords to map & marker
  const syncMapLocation = (lat, lng, doGeocode = true) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([lat, lng]);
    }
    if (doGeocode) {
      reverseGeocode(lat, lng);
    }
  };

  // Initialize interactive Leaflet map when modal opens
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = await import('leaflet');

        if (!isMounted || !mapContainerRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const initialLat = parseFloat(latitude) || initialCoords.lat;
        const initialLng = parseFloat(longitude) || initialCoords.lng;

        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: 16,
          zoomControl: false,
        });
        mapInstanceRef.current = map;

        // OpenStreetMap Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        // App Colors Pin Marker: #1F4072 Primary Navy with crisp white ring and center dot
        const customPinIcon = L.divIcon({
          className: 'custom-map-pin-container',
          html: `
            <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: grab;">
              <div style="width: 24px; height: 24px; background: #1F4072; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(31,64,114,0.45); display: flex; align-items: center; justify-content: center;">
                <div style="width: 6px; height: 6px; background: #ffffff; border-radius: 50%;"></div>
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        // Add Draggable Marker
        const marker = L.marker([initialLat, initialLng], {
          icon: customPinIcon,
          draggable: true,
        }).addTo(map);
        markerRef.current = marker;

        // When pin is dragged
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          syncMapLocation(pos.lat, pos.lng, true);
        });

        // When map is clicked
        map.on('click', (e) => {
          syncMapLocation(e.latlng.lat, e.latlng.lng, true);
        });

        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 250);
      } catch (err) {
        console.error('Leaflet initialization error:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Use browser GPS
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        syncMapLocation(pos.coords.latitude, pos.coords.longitude, true);
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS location error:', err);
        setErrorMsg('Unable to retrieve your current location. Please drag the pin manually on the map.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Handle manual latitude change
  const handleLatitudeChange = (val) => {
    setLatitude(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= -90 && num <= 90) {
      const curLng = parseFloat(longitude) || initialCoords.lng;
      if (markerRef.current) markerRef.current.setLatLng([num, curLng]);
      if (mapInstanceRef.current) mapInstanceRef.current.panTo([num, curLng]);
    }
  };

  // Handle manual longitude change
  const handleLongitudeChange = (val) => {
    setLongitude(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= -180 && num <= 180) {
      const curLat = parseFloat(latitude) || initialCoords.lat;
      if (markerRef.current) markerRef.current.setLatLng([curLat, num]);
      if (mapInstanceRef.current) mapInstanceRef.current.panTo([curLat, num]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!addressLine.trim()) {
      setErrorMsg('Address line is required.');
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setErrorMsg('Valid latitude and longitude coordinates are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        label: label.trim() || 'Home',
        addressLine: addressLine.trim(),
        city: city.trim() || 'Kolkata',
        state: state.trim() || 'West Bengal',
        postalCode: postalCode.trim() || '700129',
        latitude: latNum,
        longitude: lngNum,
        isDefault,
        replaceOldest: true,
      };

      if (onAddAddress) {
        await onAddAddress(payload);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200"
      >
        {/* Top Header with Back Arrow Button Component and Title */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white sticky top-0 z-20">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 text-[#1F4072] cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </Button>
          
          <h2 className="text-base sm:text-lg font-bold text-[#1F4072] font-outfit">
            Address Details
          </h2>
          
          <div className="w-9" />
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-4 flex-1 scrollbar-none">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium font-secondary">
              {errorMsg}
            </div>
          )}

          {/* Interactive Real Map Box with Centered Pin & "Edit pin" pill */}
          <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden border border-slate-200/90 shadow-inner bg-slate-100">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Overlaid Pill: "Drag pin or tap map" */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-7 z-[400] pointer-events-none">
              <span className="bg-white/95 text-[#1F4072] font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md border border-[#1F4072]/20 flex items-center gap-1 font-outfit">
                <MapPin className="w-3.5 h-3.5 text-[#1F4072]" />
                Select on map
              </span>
            </div>

            {/* GPS Snap Button using Button Component */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="absolute bottom-2.5 right-2.5 z-[400] bg-white text-[#1F4072] border-slate-200 shadow-md rounded-full text-xs font-semibold hover:bg-slate-50 gap-1.5 h-8 px-3"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1F4072]" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-[#1F4072]" />
              )}
              <span>{isLocating ? 'Locating...' : 'Current GPS'}</span>
            </Button>

            {/* Micro Coordinates Pill */}
            <div className="absolute top-2.5 left-2.5 z-[400] bg-[#1F4072]/90 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full font-mono font-medium shadow-xs">
              GPS: {parseFloat(latitude || '0').toFixed(4)}°, {parseFloat(longitude || '0').toFixed(4)}°
            </div>
          </div>

          {/* 1. Label Tag (schema: label String @default("Home") @db.VarChar(50)) */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-outfit">
              Address Label / Type
            </label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {PRESET_LABELS.map((item) => {
                const Icon = item.icon;
                const isSelected = label.toLowerCase() === item.id.toLowerCase();
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLabel(item.id)}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer font-outfit ${
                      isSelected
                        ? 'bg-[#1F4072] text-white border-[#1F4072] shadow-sm'
                        : 'bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-[#1F4072]/5 hover:border-[#1F4072]/30'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[11px] truncate w-full text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Or enter custom label (e.g. Grandma's House)"
              className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4072] transition-colors mt-1 font-secondary"
            />
          </div>

          {/* 2. Address Line (schema: addressLine String @db.Text) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-outfit">
                Street Address Details
              </label>
              {isGeocoding && (
                <span className="text-[10px] text-[#1F4072] font-medium flex items-center gap-1 font-secondary">
                  <Loader2 className="w-3 h-3 animate-spin" /> Geocoding...
                </span>
              )}
            </div>
            <textarea
              required
              rows={2}
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g. Flat 302, Block B, Jessore Road, Madhyamgram"
              className="w-full bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4072] transition-colors font-secondary resize-none leading-relaxed"
            />
          </div>

          {/* 3. City & State (schema: city String, state String) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-outfit">
                City
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kolkata"
                className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4072] font-secondary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-outfit">
                State
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. West Bengal"
                className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4072] font-secondary"
              />
            </div>
          </div>

          {/* 4. Postal Code (schema: postalCode String? @db.VarChar(20)) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-outfit">
              Postal Code / PIN
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="e.g. 700129"
              className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4072] font-secondary"
            />
          </div>

          {/* 5. Latitude & Longitude (schema: latitude Float?, longitude Float? - automatically filled in from map)
          <div className="space-y-1 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-outfit">
                Map Coordinates (Auto-filled)
              </label>
              <span className="text-[10px] text-[#1F4072] font-medium font-secondary bg-[#1F4072]/10 px-2 py-0.5 rounded-full">
                Synced with map
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 font-medium block pb-0.5 font-secondary">Latitude</span>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => handleLatitudeChange(e.target.value)}
                  placeholder="22.6950"
                  className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1F4072]"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block pb-0.5 font-secondary">Longitude</span>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => handleLongitudeChange(e.target.value)}
                  placeholder="88.4550"
                  className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1F4072]"
                />
              </div>
            </div>
          </div> */}

          {/* 6. Default Address Checkbox (schema: isDefault Boolean @default(false)) */}
          <div className="pt-2 pb-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-[#1F4072] focus:ring-[#1F4072] border-slate-300 cursor-pointer"
              />
              <span className="text-xs text-slate-700 font-medium font-secondary">
                Set as my default service address
              </span>
            </label>
          </div>

          {/* Bottom Submit Action with Button Component in App Colors */}
          <div className="pt-3 border-t border-slate-100 sticky bottom-0 bg-white pb-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-full bg-[#1F4072] text-white hover:bg-[#163056] font-bold text-sm sm:text-base shadow-lg transition-all cursor-pointer font-outfit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white mr-2" />
                  <span>Saving Address...</span>
                </>
              ) : (
                <span>Save and Continue</span>
              )}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default AddressAddModal;
