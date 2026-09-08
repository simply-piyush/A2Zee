'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, XCircle, Phone, Mail, 
  MapPin, Building2, Calendar, FileText, Sparkles, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function WorkerApprovalsTab({
  pendingVerifications = [],
  onVerifyArtisan,
  cooperativeName = null,
  isCooperativeScoped = false,
}) {
  const [processingId, setProcessingId] = useState(null);

  // Client-side safeguard to ensure cooperative boundary
  const displayedVerifications = isCooperativeScoped && cooperativeName
    ? pendingVerifications.filter((w) => !w.cooperative || w.cooperative === cooperativeName)
    : pendingVerifications;

  const handleAction = async (workerId, status) => {
    setProcessingId(workerId);
    try {
      await onVerifyArtisan(workerId, status);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-6 font-secondary">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-display">
              {isCooperativeScoped && cooperativeName ? `${cooperativeName} Approvals Queue` : 'Worker Approvals & Accreditation Queue'}
            </h2>
            <Badge variant="warning" className="text-xs px-2.5 py-0.5">
              {displayedVerifications.length} Pending Approval
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {isCooperativeScoped && cooperativeName
              ? `Review artisan applicant credentials for ${cooperativeName} before onboarding to the emergency dispatch radar`
              : 'Review applicant credentials and cooperative affiliation before onboarding them to the emergency dispatch radar'}
          </p>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {pendingVerifications.map((w) => {
          const isBusy = processingId === w.id;
          const regDate = w.registeredAt 
            ? new Date(w.registeredAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Recent Application';

          return (
            <div
              key={w.id}
              className="bg-white rounded-2xl border border-amber-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                
                {/* Left: Applicant Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-sm shrink-0">
                      {w.name ? w.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {w.name}
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        Applied: {regDate}
                      </span>
                    </div>
                    <Badge variant="warning" className="text-[10px] ml-auto sm:ml-2">
                      UNVERIFIED APPLICANT
                    </Badge>
                  </div>

                  {/* Cooperative Affiliation */}
                  <p className="text-xs text-slate-600">
                    Sponsoring Society: <strong className="text-[#1F4072] font-bold">{w.cooperative}</strong>
                  </p>

                  {/* Trade / Skills */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[11px] font-bold text-slate-500">Requested Trades:</span>
                    {(w.skills || ['General Artisan']).map((sk, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-blue-50 text-[#1F4072] font-bold px-2.5 py-0.5 rounded-lg border border-blue-100"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {w.phone}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {w.email}
                    </span>
                    {w.latitude && w.longitude && (
                      <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {Number(w.latitude).toFixed(4)}° N, {Number(w.longitude).toFixed(4)}° E
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Approval & Rejection Action Buttons */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0 pt-2 sm:pt-0">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => handleAction(w.id, 'VERIFIED')}
                    className="bg-[#1F4072] hover:bg-[#152e53] text-white h-10 px-4 text-xs font-bold gap-1.5 rounded-xl shadow-xs cursor-pointer w-full sm:w-auto"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isBusy ? 'Processing...' : 'Approve & Verify'}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => handleAction(w.id, 'REJECTED')}
                    className="text-rose-600 hover:bg-rose-50 border-rose-200 h-10 px-4 text-xs font-bold gap-1.5 rounded-xl cursor-pointer w-full sm:w-auto"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Application</span>
                  </Button>
                </div>

              </div>

              {/* Bio & Credentials Box */}
              {w.bio && (
                <div className="p-3.5 bg-slate-50/90 rounded-xl text-xs text-slate-700 border border-slate-200/70 space-y-1">
                  <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#1F4072]" />
                    Applicant Bio & Certified Trade Experience
                  </span>
                  <p className="leading-relaxed">{w.bio}</p>
                </div>
              )}
            </div>
          );
        })}

        {pendingVerifications.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1F4072] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              All Artisan Applications Are Up to Date
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently zero unverified artisan applications awaiting federation review. Newly registered workers from cooperative onboarding portals will appear here automatically.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

export default WorkerApprovalsTab;
