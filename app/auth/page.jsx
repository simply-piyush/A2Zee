'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, AlertCircle, ArrowRight, ArrowLeft, UserCheck, 
  Building2, Wrench, LocateFixed, CheckCircle2, Lock, Mail, Phone, User 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HeaderBackground } from '@/components/ui/header-background';

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') || 'login';
  const redirectPath = searchParams.get('redirect') || '/user';

  const [activeTab, setActiveTab] = useState(initialMode);
  const [identifier, setIdentifier] = useState(''); // phone, email, or coop reg number
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState('CUSTOMER');
  const [selectedTrade, setSelectedTrade] = useState('Electrician');
  const [selectedCoopId, setSelectedCoopId] = useState('');
  const [cooperativesList, setCooperativesList] = useState([]);
  const [bio, setBio] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 22.6950, lng: 88.4550 });
  const [isLocating, setIsLocating] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const targetSkills = [
    'Electrician',
    'Plumbers',
    'Househelp',
    'Carpenters',
    'Painters',
    'Caregivers',
    'Drivers',
    'Gardeners',
    'Cleaners',
    'Technicians',
  ];

  useEffect(() => {
    // Load cooperatives for worker registration dropdown
    async function loadCoops() {
      try {
        const res = await fetch('/api/cooperatives');
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          setCooperativesList(data.data);
          setSelectedCoopId(data.data[0].id);
        }
      } catch (err) {
        console.warn('Could not fetch cooperatives:', err);
      }
    }
    loadCoops();
  }, []);

  const handleDetectLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationDetected(true);
          setIsLocating(false);
        },
        () => {
          setLocationDetected(true);
          setIsLocating(false);
        },
        { timeout: 6000 }
      );
    }
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role: selectedRole }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Login failed. Please verify credentials.');
      }

      // Determine redirect based on authenticated role
      const destination =
        data.user.role === 'ADMIN'
          ? '/admin'
          : data.user.role === 'WORKER'
          ? '/worker'
          : '/user';

      router.push(destination);
      router.refresh();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          role: selectedRole,
          trade: selectedTrade,
          cooperativeId: selectedCoopId,
          bio,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Registration failed.');
      }

      setSuccessMsg(data.message);

      setTimeout(() => {
        const destination = selectedRole === 'WORKER' ? '/worker' : '/user';
        router.push(destination);
        router.refresh();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      
      {/* Back to Home Button */}
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-full flex items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            aria-label="Back to Home"
            className="text-white hover:text-white/80 transition-all duration-200 hover:-translate-x-1 active:scale-90 cursor-pointer p-1 bg-transparent border-0 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5]" />
          </button>
          <h1 className="text-3xl items-center justify-center sm:text-4xl font-extrabold text-white tracking-tight font-display drop-shadow-xs">
            Welcome to A2Zee
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-white/80 font-medium">
          Ministry of Cooperation • Fair Wages • Verified Local Karigars
        </p>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Authentication Card */}
      <div className="bg-white rounded-3xl border border-white/30 shadow-2xl p-6 sm:p-7 space-y-6">
        
        {/* Sign In / Register Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {activeTab === 'login' ? (
          /* ========================================================================= */
          /* SIGN IN FORM                                                              */
          /* ========================================================================= */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Mobile Number, Email, or Cooperative ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <Input
                  type="text"
                  placeholder="+91 98990 11223 or admin.pragati@a2zee.local"
                  className="pl-9 h-11 text-sm rounded-xl"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 h-11 text-sm rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Quick Demo Logins Helper */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px] text-slate-600">
              <span className="font-bold text-slate-800 block">Quick Demo Credentials (Password: password123):</span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => { setIdentifier('+919899011223'); setPassword('password123'); }}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-slate-300 font-medium cursor-pointer"
                >
                  Customer (Priya)
                </button>
                <button
                  type="button"
                  onClick={() => { setIdentifier('+919876543210'); setPassword('password123'); }}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-slate-300 font-medium cursor-pointer"
                >
                  Artisan (Ramesh)
                </button>
                <button
                  type="button"
                  onClick={() => { setIdentifier('admin.pragati@a2zee.local'); setPassword('password123'); }}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-slate-300 font-medium cursor-pointer"
                >
                  Pragati Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setIdentifier('admin.navchetana@a2zee.local'); setPassword('password123'); }}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-slate-300 font-medium cursor-pointer"
                >
                  Navchetana Admin
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-12 text-sm font-bold" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Sign In Securely'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        ) : (
          /* ========================================================================= */
          /* REGISTRATION FORM (Full Database Account Creation)                        */
          /* ========================================================================= */
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Account Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">I want to register as:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('CUSTOMER')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    selectedRole === 'CUSTOMER'
                      ? 'border-[#1F4072] bg-[#1F4072]/5 text-[#1F4072] ring-1 ring-[#1F4072]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Household Customer</span>
                  <span className="text-[10px] font-normal text-slate-500">Book services</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('WORKER')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    selectedRole === 'WORKER'
                      ? 'border-[#1F4072] bg-[#1F4072]/5 text-[#1F4072] ring-1 ring-[#1F4072]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Cooperative Artisan</span>
                  <span className="text-[10px] font-normal text-slate-500">Earn 85% payout</span>
                </button>
              </div>
            </div>

            {/* Common Fields */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <Input
                  type="text"
                  placeholder="e.g. Priya Soni / Ramesh Kumar"
                  className="pl-9 h-11 text-sm rounded-xl"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="pl-9 h-11 text-sm rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="pl-9 h-11 text-sm rounded-xl"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <Input
                  type="password"
                  placeholder="Minimum 6 characters"
                  className="pl-9 h-11 text-sm rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </div>

            {/* Worker Specific Fields */}
            {selectedRole === 'WORKER' && (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3.5 animate-in fade-in-50">
                <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold">
                  <Building2 className="w-4 h-4 text-amber-700" />
                  <span>Artisan Cooperative Affiliation</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Primary Cooperative Society</label>
                  <select
                    value={selectedCoopId}
                    onChange={(e) => setSelectedCoopId(e.target.value)}
                    className="w-full h-11 px-3 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  >
                    {cooperativesList.map((coop) => (
                      <option key={coop.id} value={coop.id}>
                        {coop.name} ({coop.registrationNumber})
                      </option>
                    ))}
                    {cooperativesList.length === 0 && (
                      <option value="">Pragati Labour Cooperative Society</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Primary Trade / Skill</label>
                  <select
                    value={selectedTrade}
                    onChange={(e) => setSelectedTrade(e.target.value)}
                    className="w-full h-11 px-3 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  >
                    {targetSkills.map((sk) => (
                      <option key={sk} value={sk}>{sk}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Experience & Bio</label>
                  <Textarea
                    placeholder="Describe your trade experience, certifications (e.g. ITI, NCCT), and years in field..."
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="text-xs bg-white"
                  />
                </div>

                {/* Important Notice on Initial Pending Status */}
                <div className="p-3 bg-white rounded-lg border border-amber-300 text-[11px] text-amber-900 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Initial Status: Not Verified (Pending)
                  </span>
                  <p>
                    In accordance with cooperative bylaws, your registration will be submitted to your primary cooperative society administrator for police & NCCT credential verification before you can receive job dispatches.
                  </p>
                </div>
              </div>
            )}

            {/* GPS Location Detection */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-600 font-medium">Service Area Coordinates</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="h-7 text-[11px] gap-1"
              >
                <LocateFixed className="w-3 h-3 text-indigo-600" />
                <span>{isLocating ? 'Detecting...' : locationDetected ? 'GPS Attached ✓' : 'Attach Current GPS'}</span>
              </Button>
            </div>

            <Button type="submit" size="lg" className="w-full h-12 text-sm font-bold" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : selectedRole === 'WORKER' ? 'Submit Artisan Registration' : 'Register Customer Account'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center py-10 px-4 overflow-hidden">
      {/* Header Background as full-page background */}
      <HeaderBackground />

      <div className="relative z-10 w-full max-w-md mx-auto">
        <React.Suspense fallback={<div className="p-12 text-center text-xs text-white/75">Loading authentication portal...</div>}>
          <AuthForm />
        </React.Suspense>
      </div>
    </div>
  );
}
