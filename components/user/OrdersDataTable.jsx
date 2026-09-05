'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ArrowLeft, 
  Receipt, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Filter
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function OrdersDataTable({ orders = [], onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter orders by search term and status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const code = (order.bookingCode || order.id || '').toLowerCase();
      const title = (order.serviceTitle || order.title || order.trade || '').toLowerCase();
      const workerName = (order.worker?.name || order.workerName || '').toLowerCase();
      const address = (order.address || order.customerAddress || '').toLowerCase();
      const status = (order.status || '').toUpperCase();
      const paymentStatus = (order.paymentStatus || '').toUpperCase();

      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        code.includes(term) || 
        title.includes(term) || 
        workerName.includes(term) || 
        address.includes(term);

      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'PAID') return paymentStatus === 'PAID' || paymentStatus === 'SUCCESS';
      if (statusFilter === 'PENDING') return status === 'PENDING' || paymentStatus === 'PENDING';
      if (statusFilter === 'COMPLETED') return status === 'COMPLETED' || status === 'DONE';

      return true;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by booking code, service, artisan, address..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4072]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'COMPLETED', 'PAID', 'PENDING'].map((status) => (
            <Button
              key={status}
              type="button"
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className="text-xs h-8 px-3 rounded-xl cursor-pointer whitespace-nowrap"
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-slate-700">Code</TableHead>
              <TableHead className="font-bold text-slate-700">Service</TableHead>
              <TableHead className="font-bold text-slate-700 hidden sm:table-cell">Karigar</TableHead>
              <TableHead className="font-bold text-slate-700">Total</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-sm text-slate-600">No orders found</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {searchTerm ? 'Try adjusting your search query or filters.' : 'Your placed bookings will appear here.'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => {
                const isPaid = order.paymentStatus === 'PAID' || order.paymentStatus === 'SUCCESS';
                const isDone = order.status === 'COMPLETED' || order.status === 'DONE';
                const rawAmount = order.finalPrice || order.basePrice || order.total || order.paidAmount || 250;
                const displayAmount = Number(rawAmount).toFixed(2);

                return (
                  <TableRow key={order.id || order.bookingCode} className="hover:bg-slate-50/70">
                    <TableCell className="font-mono text-xs font-bold text-[#1F4072]">
                      #{order.bookingCode || (order.id ? order.id.slice(0, 8).toUpperCase() : 'A2Z-101')}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-xs text-slate-900 line-clamp-1">
                        {order.serviceTitle || order.title || order.trade || 'Service'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {order.scheduledTime || (order.isEmergency ? 'Emergency' : 'Standard Slot')}
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell">
                      <div className="font-medium text-xs text-slate-800">
                        {order.worker?.name || order.workerName || 'Assigned Artisan'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {typeof order.worker?.society === 'string' 
                          ? order.worker.society.split(' ')[0] + ' Co-op' 
                          : 'TECB Co-op'}
                      </div>
                    </TableCell>

                    <TableCell className="font-bold text-xs text-slate-900">
                      ₹{displayAmount}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant={isDone ? 'success' : isPaid ? 'success' : 'warning'}
                          className="text-[10px] px-2 py-0.5 font-semibold"
                        >
                          {isDone ? 'Completed' : order.status || 'Pending'}
                        </Badge>
                        {isPaid && (
                          <span className="text-[9px] text-emerald-700 font-medium">
                            Paid
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Link href={`/user/track/${encodeURIComponent(order.id || order.bookingCode)}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2.5 rounded-lg border-[#1F4072]/30 text-[#1F4072] hover:bg-[#1F4072] hover:text-white cursor-pointer"
                        >
                          <span>Track / Bill</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 p-0 rounded-lg cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 w-7 p-0 rounded-lg cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default OrdersDataTable;
