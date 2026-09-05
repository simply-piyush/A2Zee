'use client';

import React, { useState } from 'react';
import { X, MapPin, Building, Home, Briefcase, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AddressAddDialog({
  isOpen,
  onClose,
  onAddAddress,
  currentCount = 0,
}) {
  const [label, setLabel] = useState('Home');
  const [addressLine, setAddressLine] = useState('');
  const [cityArea, setCityArea] = useState('Madhyamgram, Kolkata');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isMaxReached = currentCount >= 5;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isMaxReached) {
      setErrorMsg('Maximum limit of 5 saved addresses reached. Please delete an address first.');
      return;
    }

    if (!addressLine.trim()) {
      setErrorMsg('Please enter a valid street address.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Geocode approximate coords based on area
      let coords = { lat: 22.6950, lng: 88.4550 };
      if (cityArea.includes('Salt Lake')) coords = { lat: 22.5800, lng: 88.4350 };
      else if (cityArea.includes('New Town')) coords = { lat: 22.5900, lng: 88.4700 };
      else if (cityArea.includes('Rajarhat')) coords = { lat: 22.6200, lng: 88.4500 };
      else if (cityArea.includes('Barasat')) coords = { lat: 22.7200, lng: 88.4800 };

      const payload = {
        label,
        addressLine: `${addressLine.trim()}, ${cityArea}`,
        city: cityArea.split(',')[0].trim(),
        state: 'West Bengal',
        latitude: coords.lat,
        longitude: coords.lng,
        isDefault,
      };

      if (onAddAddress) {
        await onAddAddress(payload);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1F4072]/10 text-[#1F4072] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Add Service Address</h3>
              <p className="text-[11px] text-slate-400">
                {currentCount}/5 addresses saved
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {isMaxReached ? (
          <div className="text-center py-6 space-y-2 text-slate-600">
            <p className="font-bold text-sm text-slate-800">Address Limit Reached</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              You already have the maximum allowed 5 saved addresses. Go to your profile to remove an unused address.
            </p>
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            
            {/* Address Type / Label */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Address Tag</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'Home', icon: Home },
                  { id: 'Work', icon: Briefcase },
                  { id: 'Shop', icon: Building },
                  { id: 'Other', icon: MapPin },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = label === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLabel(item.id)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSel
                          ? 'bg-[#1F4072] text-white border-[#1F4072] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Street / Flat Details */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">House / Flat / Street Details</label>
              <input
                type="text"
                required
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="e.g. Flat 302, Block B, Green Valley Apartments"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1F4072]"
              />
            </div>

            {/* City / Area Selector */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Area / Locality</label>
              <select
                value={cityArea}
                onChange={(e) => setCityArea(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1F4072] cursor-pointer"
              >
                <option value="Madhyamgram, Kolkata">Madhyamgram, Kolkata (Ward 14)</option>
                <option value="Salt Lake Sector V, Kolkata">Salt Lake Sector V, Kolkata</option>
                <option value="New Town Action Area I, Kolkata">New Town Action Area I, Kolkata</option>
                <option value="Rajarhat Main Road, Kolkata">Rajarhat Main Road, Kolkata</option>
                <option value="Barasat Municipality, Kolkata">Barasat Municipality, Kolkata</option>
              </select>
            </div>

            {/* Default Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-[#1F4072] rounded border-slate-300 focus:ring-[#1F4072]"
              />
              <span className="text-xs text-slate-600 font-medium">
                Set as my default service address
              </span>
            </label>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={isSubmitting}
                className="rounded-xl cursor-pointer"
              >
                {isSubmitting ? 'Saving Address...' : 'Save Address'}
              </Button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

export default AddressAddDialog;
