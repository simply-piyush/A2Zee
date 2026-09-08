import { PRE_SPECIFIED_CATALOG, SERVICE_CATEGORIES, COOP_WORKERS, INITIAL_BOOKING } from './data';
import { prisma } from './prisma';
import { getCanonicalSkillName } from './dispatchAlgorithm';

// Persistent in-memory fallback store matching prisma/schema.prisma models
let bookingsStore = [
  {
    ...INITIAL_BOOKING,
    extraAmount: 15.00,
    extraChargeReason: 'EXTRA_TIME_TAKEN',
    extraChargeNotes: 'Conduit pipe rusted shut; required manual chiseling (+30 mins)',
    extraTimeMinutes: 30,
    billGeneratedAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'gig_em_1',
    bookingCode: 'BK-2026-0922',
    serviceTitle: 'Main Breaker Sparking & Smoking',
    description: 'Sudden electrical sparks behind switchboard; immediate disconnect and fuse replacement required.',
    isEmergency: true,
    customerName: 'Ananya Sen',
    customerPhone: '+91 98301 23456',
    customerAddress: 'Flat 4B, Greenfield Residency, Jessore Road, Madhyamgram, Kolkata 700129',
    address: 'Flat 4B, Greenfield Residency, Jessore Road, Madhyamgram, Kolkata 700129',
    distanceKm: 0.9,
    etaMins: 8,
    basePrice: 350,
    extraAmount: 0,
    finalPrice: 350,
    workerPayout: 297.50,
    scheduledTime: 'Immediate Emergency • 15 mins ETA',
    scheduledStartTime: new Date().toISOString(),
    status: 'CONFIRMED',
    worker: COOP_WORKERS[1],
  },
  {
    id: 'gig_std_2',
    bookingCode: 'BK-2026-0935',
    serviceTitle: 'Ceiling Fan Rewiring & Capacitor',
    description: 'Slow rotation on high regulator speed; replace 2.5mfd capacitor and check bearing lubrication.',
    isEmergency: false,
    customerName: 'Siddharth Roy',
    customerPhone: '+91 98740 54321',
    customerAddress: 'Block C-12, Green Park Avenue, New Town Action Area 1, Kolkata 700156',
    address: 'Block C-12, Green Park Avenue, New Town Action Area 1, Kolkata 700156',
    distanceKm: 3.2,
    etaMins: 20,
    basePrice: 220,
    extraAmount: 0,
    finalPrice: 220,
    workerPayout: 187.00,
    scheduledTime: 'Today • 3:30 PM Slot',
    scheduledStartTime: new Date().toISOString(),
    status: 'CONFIRMED',
    worker: COOP_WORKERS[1],
  },
  {
    id: 'gig_std_3',
    bookingCode: 'BK-2026-0941',
    serviceTitle: 'Inverter Battery Terminal Cleaning & Water Top-up',
    description: 'Lead-acid backup inverter showing high temperature warning; inspect distilled water levels.',
    isEmergency: false,
    customerName: 'Pooja Mukherjee',
    customerPhone: '+91 94330 98765',
    customerAddress: 'House 18, Rabindra Pally, Barasat Road, Madhyamgram 700130',
    address: 'House 18, Rabindra Pally, Barasat Road, Madhyamgram 700130',
    distanceKm: 1.8,
    etaMins: 15,
    basePrice: 280,
    extraAmount: 0,
    finalPrice: 280,
    workerPayout: 238.00,
    scheduledTime: 'Tomorrow • 11:00 AM Slot',
    scheduledStartTime: new Date(Date.now() + 86400000).toISOString(),
    status: 'PENDING',
    worker: COOP_WORKERS[1],
  },
];

export const dbStore = {
  getServices: async () => {
    try {
      const skillsWithServices = await prisma.skill.findMany({
        include: {
          services: {
            orderBy: { basePrice: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      });

      if (skillsWithServices && skillsWithServices.length > 0) {
        const catalog = skillsWithServices.flatMap((skill) =>
          skill.services.map((service) => ({
            id: service.id,
            skillId: skill.id,
            trade: skill.name.toLowerCase().replace(/\s+/g, '-'),
            code: service.id.substring(0, 8).toUpperCase(),
            title: service.name,
            basePrice: Number(service.basePrice),
            duration: '45 mins',
            description: service.description,
          }))
        );

        return {
          source: 'NEON_SERVERLESS_POSTGRESQL',
          categories: skillsWithServices.map((s) => ({
            id: s.id,
            title: s.name,
            icon: s.name === 'Electrician' ? 'Zap' : s.name === 'Plumber' ? 'Droplets' : 'Wrench',
            description: `${s.services.length} cooperative services available`,
          })),
          catalog,
          skills: skillsWithServices,
        };
      }
    } catch (e) {
      console.warn('Prisma Neon DB query fallback:', e.message);
    }

    return {
      source: 'LOCAL_FALLBACK',
      categories: SERVICE_CATEGORIES,
      catalog: PRE_SPECIFIED_CATALOG,
    };
  },

  getAllBookings: () => {
    return bookingsStore;
  },

  getBookingById: (id) => {
    if (!id) return bookingsStore[0];
    const normalized = String(id).trim().toLowerCase();
    const found = bookingsStore.find((b) => 
      b.id?.toLowerCase() === normalized || 
      b.bookingCode?.toLowerCase() === normalized ||
      (b.bookingCode && normalized.includes(b.bookingCode.toLowerCase()))
    );
    return found || null;
  },

  updateBookingStatus: (id, updateData = {}) => {
    if (!id) return null;
    const normalized = String(id).trim().toLowerCase();
    let booking = bookingsStore.find((b) => 
      b.id?.toLowerCase() === normalized || 
      b.bookingCode?.toLowerCase() === normalized
    );

    if (!booking) {
      // If not in store, create placeholder so updates are remembered
      booking = {
        id,
        bookingCode: id.startsWith('A2Z') ? id : `A2Z-${id.slice(0, 8).toUpperCase()}`,
        status: 'PENDING',
        customerName: 'Customer',
        address: 'Madhyamgram, Kolkata',
        basePrice: 250,
        finalPrice: 250,
        createdAt: new Date().toISOString(),
      };
      bookingsStore.push(booking);
    }

    if (updateData.status) booking.status = updateData.status;
    if (updateData.finalPrice !== undefined) {
      booking.finalPrice = Number(updateData.finalPrice);
      booking.total = Number(updateData.finalPrice);
    }
    if (updateData.workerPayout !== undefined) booking.workerPayout = Number(updateData.workerPayout);
    if (updateData.scheduledEndTime) booking.scheduledEndTime = updateData.scheduledEndTime;
    if (updateData.status === 'COMPLETED') {
      booking.completedAt = new Date().toISOString();
      booking.scheduledEndTime = booking.scheduledEndTime || new Date().toISOString();
    }
    return booking;
  },

  createBooking: (payload) => {
    const isCustom = payload.isCustomIssue || false;
    const baseLabor = isCustom ? 150.00 : (payload.basePrice || 199.00);
    const gst = Math.round(baseLabor * 0.05 * 100) / 100;
    const total = baseLabor + gst;

    const canonicalTrade = getCanonicalSkillName(payload.trade || payload.category || '');
    const assignedWorker = COOP_WORKERS.find((w) => getCanonicalSkillName(w.trade) === canonicalTrade) || COOP_WORKERS.find(w => w.trade === payload.trade) || COOP_WORKERS[0];

    const newBooking = {
      id: `bk_${Date.now()}`,
      bookingCode: `A2Z-KOL-${Math.floor(100 + Math.random() * 900)}`,
      customerName: payload.customerName || 'Priya Soni',
      customerAddress: payload.customerAddress || 'Flat 402, Green Meadows, Madhyamgram, Kolkata',
      customerPhone: payload.customerPhone || '+91 98990 11223',
      trade: payload.trade || 'electrician',
      serviceTitle: isCustom ? (payload.customTitle || 'Custom Household Repair') : (payload.serviceTitle || 'Ceiling fan not working / humming'),
      jobType: payload.jobType || 'Instant',
      scheduledTime: payload.jobType === 'Instant' ? 'Immediate (Arriving in 15 mins)' : (payload.scheduledTime || 'Tomorrow, 10:00 AM'),
      isCustomIssue: isCustom,
      customDesc: isCustom ? payload.customDesc : null,
      worker: assignedWorker,
      status: 'IN_PROGRESS',
      paymentStatus: 'PENDING',
      serviceFee: baseLabor,
      extraTimeFee: 0.00,
      gst,
      tipGratitude: 0.00,
      total,
      workerPayout: Math.round(total * 0.85 * 100) / 100,
      societyFund: Math.round(total * 0.10 * 100) / 100,
      welfareDeposit: Math.round(total * 0.05 * 100) / 100,
      extraCharges: [],
      createdAt: new Date().toISOString(),
    };

    bookingsStore.unshift(newBooking);
    return newBooking;
  },

  addExtraCharge: async (bookingId, payload = {}) => {
    const booking = bookingsStore.find((b) => b.id === bookingId || b.bookingCode === bookingId) || bookingsStore[0];
    if (!booking) return null;

    if (booking.paymentStatus === 'PAID' || booking.status === 'COMPLETED') {
      throw new Error('Cannot add extra charges: This job has already been completed and paid.');
    }

    const parsedAmount = parseFloat(payload.extraAmount ?? payload.additionalPrice ?? payload.amount) || 0.00;
    const minutes = parseInt(payload.extraTimeMinutes ?? payload.extraMinutes, 10) || 30;
    const reasonText = payload.reason || payload.extraChargeReason || 'EXTRA_TIME_TAKEN';
    const notes = payload.notes ?? payload.extraChargeNotes ?? payload.description ?? payload.additionalDescription ?? 'Extra on-site labor and time overrun';

    const currentCharges = Array.isArray(booking.extraCharges)
      ? [...booking.extraCharges]
      : ((booking.extraAmount || 0) > 0
          ? [{
              id: 'chg_init',
              reason: booking.extraChargeReason || 'On-site adjustments',
              amount: Number(booking.extraAmount),
              createdAt: new Date().toISOString()
            }]
          : []);

    const updatedCharges = Array.isArray(payload.extraCharges) && payload.extraCharges.length > 0
      ? payload.extraCharges
      : [
          ...currentCharges,
          {
            id: `chg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            reason: reasonText,
            amount: parsedAmount,
            createdAt: new Date().toISOString(),
          }
        ];

    booking.extraCharges = updatedCharges;
    booking.extraAmount = updatedCharges.reduce((s, c) => s + Number(c.amount || 0), 0);
    booking.extraTimeFee = booking.extraAmount;
    booking.additionalPrice = booking.extraAmount;
    booking.extraChargeReason = reasonText;
    booking.extraChargeNotes = notes;
    booking.extraTimeMinutes = (booking.extraTimeMinutes || 0) + minutes;
    booking.billGeneratedAt = new Date().toISOString();

    const emergencyFee = booking.isEmergency ? 100 : 0;
    const totalLabor = (booking.serviceFee || booking.basePrice || booking.baseCharge || 0) + emergencyFee + booking.extraAmount;
    booking.gst = Math.round(totalLabor * 0.05 * 100) / 100;
    booking.total = totalLabor + booking.gst + (booking.tipGratitude || 0);
    booking.finalPrice = booking.total;
    booking.workerPayout = Math.round((totalLabor * 0.85 + (booking.tipGratitude || 0)) * 100) / 100;
    booking.societyFund = Math.round(totalLabor * 0.10 * 100) / 100;
    booking.welfareDeposit = Math.round(totalLabor * 0.05 * 100) / 100;

    // Try updating live Neon database record if ID matches DB UUID
    try {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          additionalWork: true,
          additionalDescription: JSON.stringify({ summary: notes, charges: updatedCharges }),
          additionalPrice: booking.extraAmount,
          additionalStatus: 'ACCEPTED',
          finalPrice: booking.total,
        },
      });
    } catch {
      // Memory fallback for mock IDs
    }

    return { 
      booking, 
      extraCharge: {
        bookingId: booking.id,
        extraAmount: booking.extraAmount,
        extraCharges: updatedCharges,
        reason: reasonText,
        notes,
        extraTimeMinutes: booking.extraTimeMinutes,
        billGeneratedAt: booking.billGeneratedAt,
        totalPayable: booking.total,
      },
    };
  },

  processMockPayment: (bookingId, { tipGratitude = 0 } = {}) => {
    const booking = bookingsStore.find((b) => b.id === bookingId || b.bookingCode === bookingId) || bookingsStore[0];
    if (!booking) return null;

    const tip = parseFloat(tipGratitude) || 0.00;
    booking.tipGratitude = tip;
    const emergencyFee = booking.isEmergency ? 100 : 0;
    const baseLabor = (booking.serviceFee || booking.basePrice || 199.00) + emergencyFee;
    const extraLabor = (booking.extraTimeFee || booking.extraAmount || booking.additionalPrice || 0);
    const totalLabor = baseLabor + extraLabor;
    booking.gst = Math.round(totalLabor * 0.05 * 100) / 100;
    booking.total = totalLabor + (booking.gst || 0) + tip;
    booking.finalPrice = booking.total; // Updated booking total with gratitude tip
    booking.workerPayout = Math.round((totalLabor * 0.85 + tip) * 100) / 100;
    booking.societyFund = Math.round(totalLabor * 0.10 * 100) / 100;
    booking.welfareDeposit = Math.round(totalLabor * 0.05 * 100) / 100;

    booking.paymentStatus = 'PAID';
    booking.status = 'COMPLETED';
    booking.transactionId = `TXN_MOCK_${Math.floor(10000000 + Math.random() * 90000000)}`;
    booking.paidAt = new Date().toISOString();

    return {
      success: true,
      bookingId: booking.id,
      paymentStatus: 'PAID',
      transactionId: booking.transactionId,
      paidAt: booking.paidAt,
      billBreakdown: {
        serviceFee: booking.serviceFee,
        extraTimeFee: booking.extraTimeFee,
        gst: booking.gst,
        tipGratitude: booking.tipGratitude,
        total: booking.total,
      },
      cooperativeSplit85_10_5: {
        workerWallet85: booking.workerPayout,
        societyOperations10: booking.societyFund,
        welfareInsurancePool5: booking.welfareDeposit,
      },
    };
  },

  // Addresses Store
  getAddresses: (filter = {}) => {
    if (!globalThis.__a2zee_addresses) {
      globalThis.__a2zee_addresses = [
        {
          id: 'addr_default_1',
          label: 'Home',
          addressLine: 'Flat 402, Green Meadows, Madhyamgram, Kolkata',
          city: 'Madhyamgram',
          state: 'West Bengal',
          postalCode: '700129',
          latitude: 22.6950,
          longitude: 88.4550,
          isDefault: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'addr_default_2',
          label: 'Work',
          addressLine: 'Module 102, Webel IT Park, Salt Lake Sector V, Kolkata',
          city: 'Salt Lake',
          state: 'West Bengal',
          postalCode: '700091',
          latitude: 22.5800,
          longitude: 88.4350,
          isDefault: false,
          createdAt: new Date().toISOString(),
        },
      ];
    }
    let list = globalThis.__a2zee_addresses;
    if (filter.userId) list = list.filter(a => !a.userId || a.userId === filter.userId);
    if (filter.workerId) list = list.filter(a => a.workerId === filter.workerId);
    return list;
  },

  addAddress: (addr) => {
    if (!globalThis.__a2zee_addresses) dbStore.getAddresses();
    if (globalThis.__a2zee_addresses.length >= 5) {
      throw new Error('Maximum of 5 saved addresses reached.');
    }
    if (addr.isDefault) {
      globalThis.__a2zee_addresses.forEach(a => { a.isDefault = false; });
    }
    const newAddr = {
      id: `addr_${Date.now()}`,
      ...addr,
      createdAt: new Date().toISOString(),
    };
    globalThis.__a2zee_addresses.unshift(newAddr);
    return newAddr;
  },

  deleteAddress: (id) => {
    if (!globalThis.__a2zee_addresses) dbStore.getAddresses();
    globalThis.__a2zee_addresses = globalThis.__a2zee_addresses.filter(a => a.id !== id);
    return true;
  },
};

