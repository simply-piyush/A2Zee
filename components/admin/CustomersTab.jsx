'use client';

import React, { useState } from 'react';
import { 
  Search, User, Phone, Mail, MapPin, 
  ShoppingBag, Calendar, ArrowUpRight 
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

export function CustomersTab({
  customers = [],
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (c.name || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const address = (c.address || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || email.includes(q) || address.includes(q);
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
              Registered Customers Roster
            </h2>
            <span className="text-xs bg-blue-50 text-[#1F4072] border border-blue-100 font-bold px-2 py-0.5 rounded-full">
              {filteredCustomers.length} Citizens
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Directory of registered households booking services through the state cooperative gig platform
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
            <Input
              type="text"
              placeholder="Search customer, phone, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-2xl border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Customers Table Component */}
      <div className="overflow-x-auto w-full -mx-1 sm:mx-0">
        <Table className="w-full min-w-[640px] text-left border-collapse">
          <TableHeader>
            <TableRow className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:bg-transparent">
              <TableHead className="py-3 px-3">Customer</TableHead>
              <TableHead className="py-3 px-3">Contact & Email</TableHead>
              <TableHead className="py-3 px-3">Primary Location</TableHead>
              <TableHead className="py-3 px-3 text-center">Gigs Booked</TableHead>
              <TableHead className="py-3 px-3 text-right">Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs">
            {filteredCustomers.map((c) => {
              const spent = Number(c.totalSpent || 0);

              return (
                <TableRow 
                  key={c.id} 
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Customer Name & Initials Avatar */}
                  <TableCell className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#1F4072] flex items-center justify-center text-white font-extrabold text-xs shadow-xs shrink-0">
                        {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {c.name || 'Citizen Customer'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          ID: {c.id ? c.id.substring(0, 8).toUpperCase() : 'USER'}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact Phone & Email */}
                  <TableCell className="py-4 px-3">
                    <span className="font-semibold text-slate-800 block">
                      {c.phone || 'Phone not set'}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                      {c.email || 'Email not set'}
                    </span>
                  </TableCell>

                  {/* Address & City */}
                  <TableCell className="py-4 px-3">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[180px] font-medium">
                        {c.address || 'Kolkata Metropolitan Area'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#1F4072] font-semibold block pl-5">
                      {c.city || 'West Bengal'}
                    </span>
                  </TableCell>

                  {/* Gigs Booked Count */}
                  <TableCell className="py-4 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#1F4072] border border-blue-100 font-bold text-xs">
                      <ShoppingBag className="w-3 h-3" />
                      {c.totalBookings || 0}
                    </span>
                  </TableCell>

                  {/* Total Spent */}
                  <TableCell className="py-4 px-3 text-right">
                    <span className="font-extrabold text-sm text-slate-900 block font-display">
                      ₹{spent.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Cooperative Gross
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredCustomers.length === 0 && (
          <div className="p-12 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl">
            <User className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">No Customers Found</h3>
            <p className="text-xs text-slate-400">
              Try adjusting your search query.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

export default CustomersTab;
