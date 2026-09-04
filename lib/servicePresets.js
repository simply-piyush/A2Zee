/**
 * Comprehensive Trade Categories & Preset Job Descriptions
 * Configured for A2Zee Cooperative Gig Services Platform
 */

export const TRADE_CATEGORIES = [
  { id: 'electrician', label: 'Electrician (Wiring & Power)', trade: 'Electrician' },
  { id: 'plumbing', label: 'Plumbing (Pipes, Taps & Leaks)', trade: 'Plumbers' },
  { id: 'carpenter', label: 'Carpentry (Doors, Locks & Woodwork)', trade: 'Carpenters' },
  { id: 'cleaning', label: 'Cleaning (Deep Scrub & Sanitization)', trade: 'Cleaners' },
  { id: 'househelp', label: 'Househelp (Cooking & Daily Chores)', trade: 'Househelp' },
  { id: 'painters', label: 'Painting (Walls, Polish & Damp Proofing)', trade: 'Painters' },
  { id: 'technicians', label: 'Technician (AC, Fridge & Appliances)', trade: 'Technicians' },
  { id: 'caregivers', label: 'Caregivers (Elderly & Patient Care)', trade: 'Caregivers' },
  { id: 'drivers', label: 'Drivers (City & Outstation Transit)', trade: 'Drivers' },
  { id: 'gardeners', label: 'Gardeners (Lawn & Plant Care)', trade: 'Gardeners' },
];

export const PRESET_JOB_DESCRIPTIONS = {
  Electrician: [
    'Switchboard sparking / burning smell / socket repair',
    'Ceiling fan not working / humming noise / regulator repair',
    'MCB tripping repeatedly / Main fuse blowout check',
    'Full house electrical wiring & earthing inspection',
    'Inverter & home battery setup / replacement',
    'High power appliance point (AC / Geyser) wiring',
    'Tubelight, Chandelier or LED false ceiling panel installation',
    'Other',
  ],
  Plumbers: [
    'Tap / Faucet continuous leaking or dripping repair',
    'Bathroom drain / sink / washbasin blockage clearing',
    'Toilet flush tank / siphon / commode leakage fix',
    'Overhead water tank pipeline or ball valve repair',
    'Geyser water inlet & outlet connection fitting',
    'New shower head / diverter / mixer tap installation',
    'Underground or concealed pipe seepage detection',
    'Other',
  ],
  Carpenters: [
    'Main door lock, latch or hinge jammed / repair',
    'Wardrobe / kitchen cabinet drawer slider realignment',
    'Wooden bed / dining table / furniture assembly or fix',
    'Window wooden frame, mesh or glass shutter repair',
    'Custom wall shelf / TV bracket / curtain rod mounting',
    'Sofa wooden frame strengthening or repair',
    'Other',
  ],
  Cleaners: [
    'Full home deep cleaning & festive scrubbing',
    'Kitchen degreasing, sink, tiles & chimney deep clean',
    'Bathroom descaling, disinfection & floor tile scrubbing',
    'Sofa, mattress & curtain vacuum shampooing',
    'Balcony & large window glass streak-free cleaning',
    'Other',
  ],
  Househelp: [
    'Daily home cooking & kitchen assistance (Breakfast/Dinner)',
    'Floor sweeping, mopping & dishwashing chores',
    'Full-day dedicated household support / helper',
    'Clothes washing, drying & ironing',
    'Other',
  ],
  Painters: [
    'Single room wall repainting & damp moisture seal',
    'Full apartment interior fresh painting',
    'Ceiling water leakage patch plaster & whitewash',
    'Window safety grill & wooden door polish/enamel',
    'Exterior weather-resistant waterproof coating',
    'Other',
  ],
  Technicians: [
    'Split / Window AC filter cleaning & gas recharge cooling fix',
    'Washing machine motor noise / water drain error repair',
    'Refrigerator not cooling / excessive ice buildup repair',
    'Water Purifier (RO/UV) filter candle & membrane change',
    'Microwave oven heating element / turntable repair',
    'Other',
  ],
  Caregivers: [
    'Elderly assistance, mobility support & companionship',
    'Post-surgery recovery & medication schedule assistance',
    'Babysitting & infant day care assistance',
    'Other',
  ],
  Drivers: [
    'City daily commute / emergency driver on-demand',
    'Outstation weekend roundtrip chauffeur',
    'Airport / Railway station luggage pickup & drop',
    'Other',
  ],
  Gardeners: [
    'Lawn mowing, edge trimming & dry grass clearing',
    'Plant potting, repotting, pruning & soil fertilizer care',
    'Organic pest control spray & balcony garden setup',
    'Other',
  ],
};

/**
 * Returns preset job descriptions for a given trade.
 * If trade is not recognized, returns standard presets.
 */
export function getPresetDescriptions(trade) {
  if (!trade) return PRESET_JOB_DESCRIPTIONS.Electrician;

  // Match exact or case-insensitive
  const key = Object.keys(PRESET_JOB_DESCRIPTIONS).find(
    k => k.toLowerCase() === trade.toLowerCase() || 
         trade.toLowerCase().includes(k.toLowerCase()) || 
         k.toLowerCase().includes(trade.toLowerCase())
  );

  return PRESET_JOB_DESCRIPTIONS[key] || [
    'Standard repair & diagnosis',
    'Emergency troubleshooting & immediate fix',
    'Inspection & quotation request',
    'Comprehensive maintenance service',
    'Other',
  ];
}
