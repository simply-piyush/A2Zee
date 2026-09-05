import { PRE_SPECIFIED_CATALOG, SERVICE_CATEGORIES, COOP_WORKERS, INITIAL_BOOKING } from './data';
import { prisma } from './prisma';

// Persistent in-memory fallback store matching prisma/schema.prisma models
let bookingsStore = [
  {
    ...INITIAL_BOOKING,
    extraAmount: 15.00,
    extraChargeReason: 'EXTRA_TIME_TAKEN',
    extraChargeNotes: 'Conduit pipe rusted shut; required manual chiseling (+30 mins)',
    extraTimeMinutes: 30,
    billGeneratedAt: new Date(Date.now() - 1800000).toISOString()
  }
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
    return bookingsStore.find((b) => b.id === id) || bookingsStore[0];
  },

  createBooking: (payload) => {
    const isCustom = payload.isCustomIssue || false;
    const baseLabor = isCustom ? 150.00 : (payload.basePrice || 199.00);
    const gst = Math.round(baseLabor * 0.05 * 100) / 100;
    const total = baseLabor + gst;

    const assignedWorker = COOP_WORKERS.find((w) => w.trade === payload.trade) || COOP_WORKERS[1];

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
    const booking = bookingsStore.find((b) => b.id === bookingId) || bookingsStore[0];
    if (!booking) return null;

    if (booking.paymentStatus === 'PAID' || booking.status === 'COMPLETED') {
      throw new Error('Cannot add extra charges: This job has already been completed and paid.');
    }

    const parsedAmount = parseFloat(payload.extraAmount ?? payload.additionalPrice ?? payload.amount) || 0.00;
    const minutes = parseInt(payload.extraTimeMinutes ?? payload.extraMinutes, 10) || 30;
    const reasonText = payload.reason || payload.extraChargeReason || 'EXTRA_TIME_TAKEN';
    const notes = payload.notes ?? payload.extraChargeNotes ?? payload.description ?? payload.additionalDescription ?? 'Extra on-site labor and time overrun';

    booking.extraAmount = (booking.extraAmount || 0) + parsedAmount;
    booking.extraTimeFee = booking.extraAmount;
    booking.extraChargeReason = reasonText;
    booking.extraChargeNotes = notes;
    booking.extraTimeMinutes = (booking.extraTimeMinutes || 0) + minutes;
    booking.billGeneratedAt = new Date().toISOString();

    const totalLabor = (booking.serviceFee || booking.baseCharge || 0) + booking.extraAmount;
    booking.gst = Math.round(totalLabor * 0.05 * 100) / 100;
    booking.total = totalLabor + booking.gst + (booking.tipGratitude || 0);
    booking.workerPayout = Math.round((totalLabor * 0.85 + (booking.tipGratitude || 0)) * 100) / 100;
    booking.societyFund = Math.round(totalLabor * 0.10 * 100) / 100;
    booking.welfareDeposit = Math.round(totalLabor * 0.05 * 100) / 100;

    // Try updating live Neon database record if ID matches DB UUID
    try {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          additionalWork: true,
          additionalDescription: notes,
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
        reason: reasonText,
        notes,
        extraTimeMinutes: booking.extraTimeMinutes,
        billGeneratedAt: booking.billGeneratedAt,
        totalPayable: booking.total,
      },
    };
  },

  processMockPayment: (bookingId, { tipGratitude = 0 }) => {
    const booking = bookingsStore.find((b) => b.id === bookingId) || bookingsStore[0];
    if (!booking) return null;

    const tip = parseFloat(tipGratitude) || 0.00;
    booking.tipGratitude = tip;
    const totalLabor = (booking.serviceFee || 199.00) + (booking.extraTimeFee || 0);
    booking.total = totalLabor + (booking.gst || 0) + tip;
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

