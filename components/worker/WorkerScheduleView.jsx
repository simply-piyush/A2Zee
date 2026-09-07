'use client';

import React, { useState } from 'react';
import { 
  Calendar, Clock, ShieldCheck, AlertCircle, CheckCircle2, 
  MapPin, Check, Plus 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const DEFAULT_SCHEDULE = [
  {
    id: 's_1',
    timeSlot: '10:00 AM - 12:00 PM',
    title: 'Ceiling Fan Repair & Fixing',
    code: 'BK-2026-0891',
    address: 'Flat 402, Green Meadows, Madhyamgram',
    status: 'ACTIVE',
    type: 'EMERGENCY',
  },
  {
    id: 's_2',
    timeSlot: '02:00 PM - 04:00 PM',
    title: 'Main Distribution Box Inspection',
    code: 'BK-2026-0899',
    address: 'Module 102, Salt Lake Sector V',
    status: 'SCHEDULED',
    type: 'TIMELY',
  },
  {
    id: 's_3',
    timeSlot: '05:00 PM - 07:00 PM',
    title: 'Air Conditioner Wiring Diagnostic',
    code: 'BK-2026-0904',
    address: 'Block B, Rajarhat, Kolkata',
    status: 'SCHEDULED',
    type: 'TIMELY',
  },
];

export function WorkerScheduleView({
  schedule = DEFAULT_SCHEDULE,
}) {
  const [activeShift, setActiveShift] = useState('FULL_DAY');
  const [workingDays, setWorkingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

  const toggleDay = (day) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-display">
          Duty Schedule & Collision Prevention
        </h2>
        <p className="text-xs text-slate-500">
          Intelligent schedule collision prevention guarantees you are never double-booked
        </p>
      </div>

      {/* Collision Prevention Engine Callout */}
      <Card className="p-4.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200/80">
        <div className="flex items-start gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-[#1F4072] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-[#1F4072]">
              Automated Schedule Collision Protection Active
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              When customer bookings are submitted, the dispatch engine algorithm runs <code className="font-mono bg-white px-1 py-0.5 rounded text-[#1F4072]">hasScheduleCollision()</code>. Any customer time slot overlapping with your active bookings is automatically filtered out from your queue.
            </p>
          </div>
        </div>
      </Card>

      {/* Working Days & Shift Selector */}
      <Card className="p-5 space-y-4 border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Weekly Duty Roster</h3>
            <p className="text-xs text-slate-500">Select active days you are on-call for cooperative dispatch</p>
          </div>

          {/* Shift selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveShift('FULL_DAY')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeShift === 'FULL_DAY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Full Day (9 AM - 7 PM)
            </button>
            <button
              type="button"
              onClick={() => setActiveShift('MORNING')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeShift === 'MORNING' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Morning (8 AM - 2 PM)
            </button>
            <button
              type="button"
              onClick={() => setActiveShift('EVENING')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeShift === 'EVENING' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Evening (2 PM - 8 PM)
            </button>
          </div>
        </div>

        {/* Days Badges */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {daysList.map((day) => {
            const isSelected = workingDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#1F4072] text-white border-[#1F4072] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{day}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Booked Slots Today & Tomorrow */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base text-slate-900">Today&apos;s Booked Slots</h3>
          <Badge variant="secondary" className="font-semibold text-xs">
            {schedule.length} Bookings
          </Badge>
        </div>

        <div className="space-y-2.5">
          {schedule.map((item) => (
            <Card key={item.id} className="p-4 border-slate-200/80 hover:shadow-xs transition-all">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                    <Clock className="w-5 h-5 text-[#1F4072]" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">{item.timeSlot}</span>
                      <Badge 
                        variant={item.type === 'EMERGENCY' ? 'warning' : 'primary'}
                        className="text-[10px]"
                      >
                        {item.type}
                      </Badge>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-800">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{item.address}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="font-mono text-xs font-bold text-[#1F4072] block">{item.code}</span>
                  <Badge variant={item.status === 'ACTIVE' ? 'success' : 'default'} className="text-[10px]">
                    {item.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
