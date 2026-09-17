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
    id: 'fc1b8756-a51e-4018-a8dc-eb7069c240a3',
    name: 'Ramesh Kumar',
    trade: 'Electrician',
    society: 'Pragati Labour Cooperative Society',
    ncctTier: 'Master Craftsman (Level 3)',
    rating: 4.9,
    distance: '1.2 km',
    initials: 'RK',
    avatarColor: 'bg-amber-600 text-white',
    phone: '+91 98765 43210',
    walletBalance: 4200.00,
    welfareBalance: 530.00,
    skills: ['Electrician'],
  },
  {
    id: '1956e798-327f-4a68-85df-e3700162dbce',
    name: 'Bikash Roy',
    trade: 'Plumbers',
    society: 'Pragati Labour Cooperative Society',
    ncctTier: 'Certified Karigar (Level 2)',
    rating: 4.8,
    distance: '1.4 km',
    initials: 'BR',
    avatarColor: 'bg-blue-600 text-white',
    phone: '+91 98765 43211',
    walletBalance: 3100.00,
    welfareBalance: 360.00,
    skills: ['Plumbers'],
  },
  {
    id: 'e399065a-dfb1-4627-bf9f-9f8ad5951f53',
    name: 'Sunita Mondal',
    trade: 'Househelp',
    society: 'Pragati Labour Cooperative Society',
    ncctTier: 'Certified Karigar (Level 2)',
    rating: 4.95,
    distance: '0.8 km',
    initials: 'SM',
    avatarColor: 'bg-[#1F4072] text-white',
    phone: '+91 98301 23456',
    walletBalance: 3450.00,
    welfareBalance: 410.00,
    skills: ['Househelp'],
  },
  {
    id: '14201fbf-7d79-4d6a-98b8-b1ae37e95c84',
    name: 'Uttam Karmakar',
    trade: 'Carpenters',
    society: 'Navchetana Labour Cooperative Society',
    ncctTier: 'Master Craftsman (Level 3)',
    rating: 4.75,
    distance: '2.1 km',
    initials: 'UK',
    avatarColor: 'bg-amber-800 text-white',
    phone: '+91 98765 43223',
    walletBalance: 3800.00,
    welfareBalance: 460.00,
    skills: ['Carpenters'],
  },
  {
    id: 'f59b1f8c-b344-46e0-a69b-45f8059d2e62',
    name: 'Tapas Biswas',
    trade: 'Painters',
    society: 'Pragati Labour Cooperative Society',
    ncctTier: 'Certified Karigar (Level 2)',
    rating: 4.8,
    distance: '1.7 km',
    initials: 'TB',
    avatarColor: 'bg-purple-600 text-white',
    phone: '+91 98765 43214',
    walletBalance: 2700.00,
    welfareBalance: 310.00,
    skills: ['Painters'],
  },
  {
    id: '3f4acc35-c8e1-4074-bdd6-0b8d11243801',
    name: 'Maya Sengupta',
    trade: 'Caregivers',
    society: 'Pragati Labour Cooperative Society',
    ncctTier: 'Master Craftsman (Level 3)',
    rating: 4.95,
    distance: '0.9 km',
    initials: 'MS',
    avatarColor: 'bg-rose-600 text-white',
    phone: '+91 98765 43215',
    walletBalance: 4600.00,
    welfareBalance: 580.00,
    skills: ['Caregivers'],
  },
  {
    id: '87a283b1-ae63-4a75-91bf-ef6cde5831f3',
    name: 'Pranab Ghosh',
    trade: 'Drivers',
    society: 'Pragati Labour Cooperative Society',
    ncctTier: 'Certified Karigar (Level 2)',
    rating: 4.85,
    distance: '1.3 km',
    initials: 'PG',
    avatarColor: 'bg-teal-600 text-white',
    phone: '+91 98765 43216',
    walletBalance: 3500.00,
    welfareBalance: 420.00,
    skills: ['Drivers'],
  },
  {
    id: 'f3608b53-b47f-4782-b128-70a1ddc2a278',
    name: 'Subal Das',
    trade: 'Gardeners',
    society: 'Pragati Labour Cooperative Society',
    ncctTier: 'Certified Karigar (Level 2)',
    rating: 4.7,
    distance: '2.4 km',
    initials: 'SD',
    avatarColor: 'bg-lime-700 text-white',
    phone: '+91 98765 43217',
    walletBalance: 2400.00,
    welfareBalance: 290.00,
    skills: ['Gardeners'],
  },
  {
    id: '0eafd0d2-2ed5-44bf-a318-1112a0cba21d',
    name: 'Anita Das',
    trade: 'Cleaners',
    society: 'Pragati Labour Cooperative Society',
    ncctTier: 'Certified Karigar (Level 2)',
    rating: 4.9,
    distance: '1.1 km',
    initials: 'AD',
    avatarColor: 'bg-cyan-600 text-white',
    phone: '+91 98765 43218',
    walletBalance: 3900.00,
    welfareBalance: 470.00,
    skills: ['Cleaners'],
  },
  {
    id: '1c04a918-6a9e-4fbb-977e-49cfb15374f0',
    name: 'Ashok Halder',
    trade: 'Technicians',
    society: 'Navchetana Labour Cooperative Society',
    ncctTier: 'Master Craftsman (Level 3)',
    rating: 4.92,
    distance: '1.5 km',
    initials: 'AH',
    avatarColor: 'bg-indigo-600 text-white',
    phone: '+91 98765 43219',
    walletBalance: 4800.00,
    welfareBalance: 610.00,
    skills: ['Technicians'],
  },
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
  worker: COOP_WORKERS[0], // Ramesh Kumar (Electrician)
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
