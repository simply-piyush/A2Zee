'use client';

import React from 'react';
import { MapPin, Trash2, Check, Plus, Home, Briefcase, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function SavedAddressesCard({
  addresses = [],
  onSetDefault,
  onDeleteAddress,
  onOpenAddModal,
}) {
  const isMaxReached = addresses.length >= 5;

  const getIcon = (label) => {
    const l = (label || '').toLowerCase();
    if (l === 'work' || l === 'office') return Briefcase;
    if (l === 'shop') return Building;
    return Home;
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#1F4072]" />
          <h3 className="font-bold text-sm sm:text-base text-slate-900">
            Saved Service Addresses
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {addresses.length}/5 Saved
          </span>
          {!isMaxReached && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenAddModal}
              className="h-7 text-[11px] px-2.5 rounded-lg border-[#1F4072]/30 text-[#1F4072] hover:bg-[#1F4072] hover:text-white cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add</span>
            </Button>
          )}
        </div>
      </div>

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="text-center py-6 text-slate-400 space-y-2">
          <MapPin className="w-8 h-8 mx-auto opacity-40 text-[#1F4072]" />
          <p className="text-xs font-medium text-slate-600">No saved addresses yet</p>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onOpenAddModal}
            className="rounded-xl text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add Your First Address</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {addresses.map((addr) => {
            const Icon = getIcon(addr.label);
            return (
              <div
                key={addr.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  addr.isDefault
                    ? 'bg-[#F4F8FE] border-[#1F4072]/30 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    addr.isDefault ? 'bg-[#1F4072] text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {addr.label || 'Home'}
                      </span>
                      {addr.isDefault && (
                        <Badge variant="success" className="text-[9px] px-1.5 py-0">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {addr.addressLine}
                    </p>
                    {addr.latitude && (
                      <p className="text-[10px] text-slate-400">
                        {Number(addr.latitude).toFixed(4)}° N, {Number(addr.longitude).toFixed(4)}° E
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!addr.isDefault && onSetDefault && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onSetDefault(addr.id)}
                      className="h-7 text-[10px] px-2 text-slate-500 hover:text-[#1F4072] cursor-pointer"
                    >
                      Make Default
                    </Button>
                  )}
                  {onDeleteAddress && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteAddress(addr.id)}
                      className="w-7 h-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Delete address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Max limit warning footer */}
      {isMaxReached && (
        <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 text-center font-medium">
          Maximum address capacity reached (5 of 5). Delete an address to add a new one.
        </p>
      )}

    </div>
  );
}

export default SavedAddressesCard;
