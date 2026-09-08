'use client';

import React, { useState } from 'react';
import { 
  Search, Users, Star, Phone, Mail, 
  ShieldCheck, CheckCircle2, Building2, Briefcase, Filter 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';

export function WorkersTab({
  workers = [],
  cooperativeName = null,
  isCooperativeScoped = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Enforce cooperative isolation on client side as defensive guarantee
  const sourceWorkers = isCooperativeScoped && cooperativeName
    ? workers.filter((w) => !w.cooperative || w.cooperative === cooperativeName)
    : workers;

  const filteredWorkers = sourceWorkers.filter((w) => {
    // Status Filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'AVAILABLE' && w.availabilityStatus !== 'AVAILABLE') return false;
      if (statusFilter === 'VERIFIED' && w.verificationStatus !== 'VERIFIED') return false;
      if (statusFilter === 'OFFLINE' && w.availabilityStatus !== 'OFFLINE') return false;
    }
    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (w.name || '').toLowerCase();
      const coop = (w.cooperative || '').toLowerCase();
      const skills = (w.skills || []).join(' ').toLowerCase();
      return name.includes(q) || coop.includes(q) || skills.includes(q);
    }
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-7 space-y-6 font-secondary">
      
      {/* Top Header & Search Controls */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-display">
              {isCooperativeScoped && cooperativeName ? `${cooperativeName} Artisans` : 'Cooperative Artisans Directory'}
            </h2>
            <span className="text-xs bg-blue-50 text-[#1F4072] border border-blue-100 font-bold px-2 py-0.5 rounded-full">
              {filteredWorkers.length} {isCooperativeScoped ? 'Society Artisans' : 'Active'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
            <Input
              type="text"
              placeholder="Search artisan, trade, coop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-2xl border-slate-200"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl text-[11px] font-bold overflow-x-auto">
            {['ALL', 'AVAILABLE', 'VERIFIED', 'OFFLINE'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Workers Table Component */}
      <div className="overflow-x-auto w-full -mx-1 sm:mx-0">
        <Table className="w-full min-w-[640px] text-left border-collapse">
          <TableHeader>
            <TableRow className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:bg-transparent">
              <TableHead className="py-3 px-3">Artisan</TableHead>
              <TableHead className="py-3 px-3">Cooperative Society</TableHead>
              <TableHead className="py-3 px-3">Trade Skills</TableHead>
              <TableHead className="py-3 px-3">Rating & Jobs</TableHead>
              <TableHead className="py-3 px-3">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs">
            {filteredWorkers.map((w) => {
              const isOnline = w.availabilityStatus === 'AVAILABLE';
              const isVerified = w.verificationStatus === 'VERIFIED';

              return (
                <TableRow 
                  key={w.id} 
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Artisan Name & Avatar */}
                  <TableCell className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#1F4072] flex items-center justify-center text-white font-extrabold text-xs shadow-xs shrink-0">
                        {w.name ? w.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {w.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          {w.phone || 'No phone'}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Cooperative Society */}
                  <TableCell className="py-4 px-3">
                    <span className="font-semibold text-slate-800 block">
                      {w.cooperative}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Primary Labour Guild
                    </span>
                  </TableCell>

                  {/* Skills */}
                  <TableCell className="py-4 px-3">
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {(w.skills || ['Artisan']).map((sk, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-lg"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </TableCell>

                  {/* Rating & Jobs */}
                  <TableCell className="py-4 px-3">
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{w.rating || 4.9}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {w.totalJobs || 12} fulfilled gigs
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                        isOnline 
                          ? 'bg-blue-50 text-[#1F4072] border border-blue-200' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#1F4072] animate-pulse' : 'bg-slate-400'}`} />
                        {isOnline ? 'Online' : 'Offline'}
                      </span>

                      <Badge variant={isVerified ? 'default' : 'warning'} className="text-[9px] font-bold">
                        {isVerified ? 'VERIFIED' : 'PENDING'}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredWorkers.length === 0 && (
          <div className="p-12 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">No Artisans Found</h3>
            <p className="text-xs text-slate-400">
              Try adjusting your search query or status filter.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

export default WorkersTab;
