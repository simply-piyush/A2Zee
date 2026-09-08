'use client';

import React, { useState } from 'react';
import { 
  Search, Calendar, Filter, ArrowUpRight, Wrench, 
  MapPin, Phone, User, Clock, CheckCircle2, AlertCircle, Eye 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export function BookingsTab({
  bookings = [],
  onSelectBooking,
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const statusOptions = ['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];

  const filteredBookings = bookings.filter((b) => {
    // Status filter
    if (statusFilter !== 'ALL' && b.status !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const code = (b.bookingCode || b.id || '').toLowerCase();
      const cust = (b.customerName || '').toLowerCase();
      const worker = (b.workerName || '').toLowerCase();
      const service = (b.service || '').toLowerCase();
      return code.includes(q) || cust.includes(q) || worker.includes(q) || service.includes(q);
    }
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-6 font-secondary">
      
      {/* Top Header & Search / Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-display">
              Live Platform Bookings & Dispatches
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              {filteredBookings.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Monitor real-time gig dispatches, emergency fast-tracks, and 85-10-5 split records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
            <Input
              type="text"
              placeholder="Search code, customer, artisan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-2xl border-slate-200"
            />
          </div>

          {/* Status Filter Segmented Pills */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl text-[11px] font-bold overflow-x-auto">
            {statusOptions.map((st) => (
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

      {/* Bookings Table matching Image 1 "Payment History" aesthetic */}
      <div className="overflow-x-auto">
        <Table className="w-full text-left border-collapse">
          <TableHeader>
            <TableRow className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:bg-transparent">
              <TableHead className="py-3 px-3">Service & Code</TableHead>
              <TableHead className="py-3 px-3">Customer & Location</TableHead>
              <TableHead className="py-3 px-3">Assigned Artisan</TableHead>
              <TableHead className="py-3 px-3">Status</TableHead>
              <TableHead className="py-3 px-3 text-right">Amount</TableHead>
              <TableHead className="py-3 px-3 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs">
            {filteredBookings.map((b) => {
              const price = Number(b.finalPrice || b.basePrice || 250);
              const dateStr = b.date ? new Date(b.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Today';
              const timeStr = b.date ? new Date(b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:30 AM';

              // Status dot indicator matching Image 1
              let statusDotColor = 'bg-slate-400';
              let statusTextColor = 'text-slate-600';
              let statusLabel = b.status;

              if (b.status === 'COMPLETED') {
                statusDotColor = 'bg-[#1F4072]';
                statusTextColor = 'text-[#1F4072]';
                statusLabel = 'Completed';
              } else if (b.status === 'IN_PROGRESS') {
                statusDotColor = 'bg-blue-500 animate-pulse';
                statusTextColor = 'text-blue-700';
                statusLabel = 'In Progress';
              } else if (b.status === 'PENDING') {
                statusDotColor = 'bg-amber-500 animate-ping';
                statusTextColor = 'text-amber-800';
                statusLabel = 'Pending Dispatch';
              } else if (b.status === 'ACCEPTED') {
                statusDotColor = 'bg-blue-600';
                statusTextColor = 'text-[#1F4072]';
                statusLabel = 'Assigned';
              }

              return (
                <TableRow 
                  key={b.id} 
                  className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  onClick={() => onSelectBooking(b)}
                >
                  {/* Service & Code */}
                  <TableCell className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1F4072] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block group-hover:text-[#1F4072] transition-colors">
                          {b.service || 'Cooperative Artisan Gig'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-[#1F4072] font-semibold">
                            {b.bookingCode || `#${b.id.slice(0, 8)}`}
                          </span>
                          {b.isEmergency && (
                            <span className="text-[9px] bg-rose-100 text-rose-700 font-extrabold px-1.5 rounded">
                              EMERGENCY
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Customer & Location */}
                  <TableCell className="py-4 px-3">
                    <span className="font-bold text-slate-800 block">
                      {b.customerName || 'Customer'}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">
                      {b.address || 'Madhyamgram, Kolkata'}
                    </span>
                  </TableCell>

                  {/* Assigned Artisan & Cooperative */}
                  <TableCell className="py-4 px-3">
                    <span className="font-bold text-slate-900 block">
                      {b.workerName || 'Awaiting Worker'}
                    </span>
                    <span className="text-[11px] text-[#1F4072] font-medium block">
                      {b.cooperative || 'Pragati Labour Coop'}
                    </span>
                  </TableCell>

                  {/* Status dot pill matching Image 1 */}
                  <TableCell className="py-4 px-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/60 font-semibold text-[11px]">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
                      <span className={statusTextColor}>{statusLabel}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 pl-3">
                      {dateStr} • {timeStr}
                    </span>
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="py-4 px-3 text-right">
                    <span className="font-extrabold text-sm text-slate-900 block">
                      ₹{price.toFixed(2)}
                    </span>
                    <span className={`text-[10px] font-bold ${
                      b.paymentStatus === 'PAID' || b.paymentStatus === 'SUCCESS' 
                        ? 'text-[#1F4072]' 
                        : 'text-amber-600'
                    }`}>
                      {b.paymentStatus === 'PAID' || b.paymentStatus === 'SUCCESS' ? '● Paid' : '○ Pending'}
                    </span>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="py-4 px-3 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBooking(b);
                      }}
                      className="h-8 px-2.5 rounded-xl text-xs font-bold text-[#1F4072] hover:bg-blue-50 hover:text-[#152e53] gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Timeline</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredBookings.length === 0 && (
          <div className="p-12 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl">
            <Wrench className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">No Bookings Found</h3>
            <p className="text-xs text-slate-400">
              No gig bookings match the selected status filter or search query.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

export default BookingsTab;
