/**
 * Centralized Cooperative Data conforming to specifications in /docs
 * (docs/SRS.md, docs/DATABASE_SCHEMA.sql, docs/FIGMA_DESIGN.md)
 */

export const SERVICE_CATEGORIES = [
  { id: 'househelp', title: 'Househelp', icon: '🧹', description: 'Daily chores, cooking, and maid support' },
  { id: 'carpenter', title: 'Carpenter', icon: '🪚', description: 'Furniture repair, locks, doors, and fittings' },
  { id: 'cleaning', title: 'Cleaning', icon: '✨', description: 'Deep sanitization, kitchen, and bathroom clean' },
  { id: 'plumbing', title: 'Plumbing', icon: '🚰', description: 'Tap leaks, pipe blockage, flush valve repairs' },
  { id: 'electrician', title: 'Electrician', icon: '⚡', description: 'Fan repair, switches, wiring, and appliances' },
  { id: 'technician', title: 'Technician', icon: '🔧', description: 'AC service, refrigerator, and RO water filter' },
];

export const PRE_SPECIFIED_CATALOG = [
  // Electrician (from docs/SRS.md FR-2.1A)
  {
    id: 'srv_fan',
    trade: 'electrician',
    code: 'ELEC_FAN_01',
    title: 'Ceiling fan not working / humming',
    basePrice: 199,
    duration: '45 mins',
    description: 'Capacitor replacement, blade balancing, and motor check'
  },
  {
    id: 'srv_switch',
    trade: 'electrician',
    code: 'ELEC_SWITCH_02',
    title: 'Switch / Socket repair & replacement',
    basePrice: 99,
    duration: '30 mins',
    description: 'Standard 6A/16A switch or modular socket repair'
  },
  {
    id: 'srv_mcb',
    trade: 'electrician',
    code: 'ELEC_MCB_03',
    title: 'MCB tripping / Fuse blowout diagnosis',
    basePrice: 249,
    duration: '45 mins',
    description: 'Short circuit root cause diagnosis and fuse wire replacement'
  },

  // Plumber (from docs/SRS.md FR-2.1A)
  {
    id: 'srv_tap',
    trade: 'plumbing',
    code: 'PLUMB_TAP_01',
    title: 'Tap / Faucet leaking continuously',
    basePrice: 149,
    duration: '30 mins',
    description: 'Washer replacement, cartridge fix, and thread sealing'
  },
  {
    id: 'srv_drain',
    trade: 'plumbing',
    code: 'PLUMB_DRAIN_02',
    title: 'Drain pipe blockage & water clog',
    basePrice: 299,
    duration: '60 mins',
    description: 'Kitchen sink or bathroom drain unclogging using mechanical coil'
  },
  {
    id: 'srv_flush',
    trade: 'plumbing',
    code: 'PLUMB_FLUSH_03',
    title: 'Toilet flush tank valve fix',
    basePrice: 249,
    duration: '45 mins',
    description: 'Siphon valve, ball cock, and push button mechanism replacement'
  },

  // Carpenter
  {
    id: 'srv_lock',
    trade: 'carpenter',
    code: 'CARP_LOCK_01',
    title: 'Door lock / latch repair & alignment',
    basePrice: 199,
    duration: '45 mins',
    description: 'Mortise lock servicing, cylinder fix, and strike plate alignment'
  },
  {
    id: 'srv_hinge',
    trade: 'carpenter',
    code: 'CARP_HINGE_02',
    title: 'Cabinet hinge replacement',
    basePrice: 149,
    duration: '30 mins',
    description: 'Hydraulic / soft-close kitchen cabinet hinge installation'
  },

  // Househelp (from Figma frame 89:49)
  {
    id: 'srv_dishes',
    trade: 'househelp',
    code: 'HELP_DISH_01',
    title: 'Utensil washing & kitchen sink deep clean',
    basePrice: 149,
    duration: '45 mins',
    description: 'Complete dishwashing and counter sanitization'
  }
];

export const COOP_WORKERS = [
  {
    id: 'wrk_madhuparna',
    name: 'Madhuparna Ghosh', // From Figma Frame 89:49
    trade: 'househelp',
    society: 'TECB Cooperative Organisation (Ward 14)',
    ncctTier: 'Certified Karigar (Level 2)',
    rating: 4.95,
    distance: '0.8 km',
    initials: 'MG',
    avatarColor: 'bg-[#1F4072] text-white',
    phone: '+91 98301 23456',
    walletBalance: 3450.00,
    welfareBalance: 410.00
  },
  {
    id: 'wrk_ramesh',
    name: 'Ramesh Kumar', // From docs/SRS.md Persona
    trade: 'electrician',
    society: 'Pragati Labour Cooperative Society',
    ncctTier: 'Master Craftsman (Level 3)',
    rating: 4.9,
    distance: '1.2 km',
    initials: 'RK',
    avatarColor: 'bg-amber-600 text-white',
    phone: '+91 98765 43210',
    walletBalance: 4200.00,
    welfareBalance: 530.00
  },
  {
    id: 'wrk_suresh',
    name: 'Suresh Patil',
    trade: 'plumber',
    society: 'Shramik Kalyan Sahakari Mandali',
    ncctTier: 'Certified Karigar (Level 2)',
    rating: 4.85,
    distance: '1.9 km',
    initials: 'SP',
    avatarColor: 'bg-emerald-600 text-white',
    phone: '+91 98111 22334',
    walletBalance: 2900.00,
    welfareBalance: 320.00
  }
];

export const WORKERS = COOP_WORKERS;

export const COOPERATIVE_SOCIETIES = [
  {
    id: 'soc_tecb',
    name: 'TECB Cooperative Organisation (Ward 14)',
    ward: 'Ward 14 (Madhyamgram)',
    activeWorkers: 28,
    completedJobs: 842,
    societyShareFund: 84200,
  },
  {
    id: 'soc_pragati',
    name: 'Pragati Labour Cooperative Society',
    ward: 'Barasat Central Ward 8',
    activeWorkers: 34,
    completedJobs: 1120,
    societyShareFund: 112000,
  },
  {
    id: 'soc_shramik',
    name: 'Shramik Kalyan Sahakari Mandali',
    ward: 'Salt Lake Sector V',
    activeWorkers: 26,
    completedJobs: 710,
    societyShareFund: 71000,
  },
];

export const AI_DEMAND_FORECAST = [
  { day: 'Mon', predictedBookings: 142, requiredStaff: 30, primaryTrade: 'Electrician', surgePredicted: true },
  { day: 'Tue', predictedBookings: 98, requiredStaff: 22, primaryTrade: 'Plumbing', surgePredicted: false },
  { day: 'Wed', predictedBookings: 112, requiredStaff: 25, primaryTrade: 'Househelp', surgePredicted: false },
  { day: 'Thu', predictedBookings: 165, requiredStaff: 36, primaryTrade: 'Appliance AC', surgePredicted: true },
  { day: 'Fri', predictedBookings: 130, requiredStaff: 28, primaryTrade: 'Electrician', surgePredicted: false },
  { day: 'Sat', predictedBookings: 190, requiredStaff: 42, primaryTrade: 'Deep Cleaning', surgePredicted: true },
  { day: 'Sun', predictedBookings: 210, requiredStaff: 48, primaryTrade: 'All Trades', surgePredicted: true },
];

export const INITIAL_BOOKING = {
  id: 'bk_2026_01',
  bookingCode: 'A2Z-KOL-891',
  customerName: 'Priya Soni',
  customerAddress: 'Flat 402, Green Meadows, Madhyamgram, Kolkata',
  customerPhone: '+91 98990 11223',
  trade: 'electrician',
  serviceTitle: 'Ceiling fan not working / humming',
  jobType: 'Instant',
  scheduledTime: 'Immediate (Arriving in 15 mins)',
  isCustomIssue: false,
  worker: COOP_WORKERS[1], // Ramesh Kumar
  status: 'IN_PROGRESS',
  paymentStatus: 'PENDING',
  basePrice: 250.00,
  extraAmount: 15.00,
  extraChargeReason: 'EXTRA_TIME_TAKEN',
  extraTimeMinutes: 30,
  serviceFee: 250.00,
  extraTimeFee: 15.00,
  gst: 10.00,
  tipGratitude: 0.00,
  total: 275.00,
  workerPayout: 233.75,
  societyFund: 27.50,
  welfareDeposit: 13.75,
  createdAt: 'Today, 2:30 PM'
};
