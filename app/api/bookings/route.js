import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { dbStore } from '@/lib/dbStore';
import { rankArtisans } from '@/lib/dispatchAlgorithm';

/**
 * GET /api/bookings
 * List bookings with relations
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const workerId = searchParams.get('workerId');
    const status = searchParams.get('status');

    try {
      const where = {};
      if (customerId) where.customerId = customerId;
      if (workerId) where.workerId = workerId;
      if (status) where.status = status;

      const dbBookings = await prisma.booking.findMany({
        where,
        include: {
          customer: {
            select: { id: true, fullName: true, phone: true, email: true, latitude: true, longitude: true },
          },
          worker: {
            include: {
              user: {
                select: { id: true, fullName: true, phone: true },
              },
              cooperative: {
                select: { id: true, name: true, registrationNumber: true },
              },
              skills: {
                include: { skill: true },
              },
            },
          },
          service: {
            include: { skill: true },
          },
          payment: true,
          review: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (dbBookings && dbBookings.length > 0) {
        const formatted = dbBookings.map((b) => {
          const basePriceNum = Number(b.basePrice);
          const addPriceNum = Number(b.additionalPrice);
          const finalPriceNum = Number(b.finalPrice);

          return {
            id: b.id,
            bookingCode: `A2Z-${b.id.substring(0, 8).toUpperCase()}`,
            customerId: b.customerId,
            customerName: b.customer?.fullName,
            customerPhone: b.customer?.phone,
            customerAddress: b.address,
            latitude: b.latitude,
            longitude: b.longitude,
            scheduledStartTime: b.scheduledStartTime,
            scheduledEndTime: b.scheduledEndTime,
            rejectedWorkerIds: b.rejectedWorkerIds,
            workerId: b.workerId,
            worker: {
              id: b.worker?.id,
              name: b.worker?.user?.fullName || 'Assigned Artisan',
              phone: b.worker?.user?.phone,
              cooperative: b.worker?.cooperative?.name,
              rating: Number(b.worker?.averageRating || 5.0),
              totalJobs: b.worker?.totalJobs || 0,
              latitude: b.worker?.latitude,
              longitude: b.worker?.longitude,
              skills: b.worker?.skills?.map((s) => s.skill.name) || [],
            },
            serviceId: b.serviceId,
            serviceTitle: b.service?.name,
            trade: b.service?.skill?.name?.toLowerCase() || 'service',
            bookingDate: b.bookingDate,
            bookingTime: b.bookingTime,
            address: b.address,
            status: b.status,
            isEmergency: b.isEmergency,
            basePrice: basePriceNum,
            additionalWork: b.additionalWork,
            additionalDescription: b.additionalDescription,
            additionalPrice: addPriceNum,
            additionalStatus: b.additionalStatus,
            finalPrice: finalPriceNum,
            paymentStatus: b.payment?.paymentStatus || 'PENDING',
            payment: b.payment ? {
              id: b.payment.id,
              amount: Number(b.payment.amount),
              paymentStatus: b.payment.paymentStatus,
              razorpayPaymentId: b.payment.razorpayPaymentId,
            } : null,
            review: b.review ? {
              id: b.review.id,
              rating: b.review.rating,
              comment: b.review.comment,
            } : null,
            workerPayout: Math.round(finalPriceNum * 0.85 * 100) / 100,
            societyFund: Math.round(finalPriceNum * 0.10 * 100) / 100,
            welfareDeposit: Math.round(finalPriceNum * 0.05 * 100) / 100,
            createdAt: b.createdAt,
          };
        });

        return NextResponse.json({
          success: true,
          data: formatted,
          bookings: formatted,
        }, { status: 200 });
      }
    } catch (dbErr) {
      console.warn('Prisma bookings lookup note:', dbErr.message);
    }

    const bookings = dbStore.getAllBookings();
    return NextResponse.json({
      success: true,
      data: bookings,
      bookings: bookings,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * POST /api/bookings
 * Dual-Mode Schedule-Aware Intelligent Dispatch Booking Creation
 */
export async function POST(request) {
  try {
    const session = await getAuthSession(request);
    const body = await request.json();

    const {
      customerId: inputCustomerId,
      customerName,
      customerPhone,
      customerAddress,
      address,
      latitude: inputLat,
      longitude: inputLng,
      serviceId: inputServiceId,
      serviceTitle,
      trade,
      isEmergency = false,
      basePrice: inputBasePrice,
      scheduledStartTime: inputStartTime,
      scheduledEndTime: inputEndTime,
      scheduledDate,
      additionalWork = false,
      additionalDescription,
      additionalPrice = 0,
    } = body;

    const bookingAddress = address || customerAddress || 'Madhyamgram, Kolkata';

    try {
      // Helper to validate standard UUID v4 format
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const isValidUUID = (str) => typeof str === 'string' && UUID_REGEX.test(str);

      // 1. Resolve Customer & Coordinates to a guaranteed real DB User UUID
      let rawCustomerId = inputCustomerId || session?.sub;
      let validCustomer = null;

      if (rawCustomerId && isValidUUID(rawCustomerId)) {
        try {
          validCustomer = await prisma.user.findUnique({ where: { id: rawCustomerId } });
        } catch (findErr) {
          console.warn('Customer lookup by UUID note:', findErr.message);
        }
      }

      let userLat = inputLat ? parseFloat(inputLat) : null;
      let userLng = inputLng ? parseFloat(inputLng) : null;

      if (!validCustomer) {
        // Find or upsert real User in PostgreSQL by phone to get genuine UUID
        const phone = customerPhone || session?.phone || '+919899011223';
        const name = customerName || session?.name || 'Priya Soni';
        const email = session?.email || `${phone.replace(/[^0-9]/g, '')}@a2zee.local`;

        validCustomer = await prisma.user.upsert({
          where: { phone },
          update: {
            fullName: name,
            ...(userLat && { latitude: userLat }),
            ...(userLng && { longitude: userLng }),
          },
          create: {
            fullName: name,
            phone,
            email,
            passwordHash: '$2b$10$dummyhashforguestcustomeraccount1234567890',
            role: 'CUSTOMER',
            latitude: userLat || 22.6950,
            longitude: userLng || 88.4550,
          },
        });
      }

      const customerId = validCustomer.id; // 100% Guaranteed valid PostgreSQL UUID
      userLat = userLat || validCustomer.latitude || 22.6950;
      userLng = userLng || validCustomer.longitude || 88.4550;

      // 2. Resolve Service (ensure inputServiceId is validated for UUID before findUnique)
      let service = null;
      if (inputServiceId && isValidUUID(inputServiceId)) {
        try {
          service = await prisma.service.findUnique({
            where: { id: inputServiceId },
            include: { skill: true },
          });
        } catch (svcErr) {
          console.warn('Service lookup by UUID note:', svcErr.message);
        }
      }

      if (!service && serviceTitle) {
        service = await prisma.service.findFirst({
          where: { name: { contains: serviceTitle, mode: 'insensitive' } },
          include: { skill: true },
        });
      }

      if (!service && trade) {
        service = await prisma.service.findFirst({
          where: {
            skill: {
              name: { contains: trade, mode: 'insensitive' },
            },
          },
          include: { skill: true },
        });
      }

      if (!service) {
        service = await prisma.service.findFirst({
          include: { skill: true },
        });
      }

      if (!service) {
        return NextResponse.json({
          success: false,
          error: 'No active service found. Please seed services first.',
        }, { status: 400 });
      }

      // 3. Resolve Schedule Timestamps
      const now = new Date();
      let startTime = inputStartTime ? new Date(inputStartTime) : (scheduledDate ? new Date(scheduledDate) : now);
      let endTime = inputEndTime ? new Date(inputEndTime) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2h slot

      // 4. Query All Candidate Workers with Matching Skill & Verified Status
      const candidateWorkers = await prisma.worker.findMany({
        where: {
          verificationStatus: 'VERIFIED',
          skills: {
            some: { skillId: service.skillId },
          },
        },
        include: {
          user: {
            select: { id: true, fullName: true, phone: true, email: true },
          },
          cooperative: {
            select: { id: true, name: true, registrationNumber: true },
          },
          skills: {
            include: { skill: true },
          },
          bookings: {
            where: {
              status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] },
            },
            select: {
              id: true,
              status: true,
              bookingDate: true,
              scheduledStartTime: true,
              scheduledEndTime: true,
            },
          },
        },
      });

      // 5. Run Intelligent Dual-Mode Dispatch Engine
      const dispatchResult = rankArtisans({
        userLat,
        userLng,
        workers: candidateWorkers,
        isEmergency: Boolean(isEmergency),
        startTime,
        endTime,
        excludedWorkerIds: [],
      });

      let assignedWorker = dispatchResult.topCandidate;

      // If emergency and no online worker found, return informative 404
      if (!assignedWorker) {
        return NextResponse.json({
          success: false,
          error: isEmergency
            ? 'No online & available artisans found within 15 km for emergency dispatch. Please check standard scheduled booking.'
            : 'No artisans currently available without schedule conflict for this time slot.',
          candidatesCount: candidateWorkers.length,
        }, { status: 404 });
      }

      // 6. Pricing Calculation
      const basePrice = inputBasePrice ? parseFloat(inputBasePrice) : Number(service.basePrice);
      const emergencySurcharge = isEmergency ? 100.00 : 0.00;
      const addPrice = parseFloat(additionalPrice) || 0.00;
      const finalPrice = basePrice + emergencySurcharge + addPrice;

      // 7. Create Booking in PostgreSQL
      const newBooking = await prisma.booking.create({
        data: {
          customerId,
          workerId: assignedWorker.workerId,
          serviceId: service.id,
          bookingDate: startTime,
          bookingTime: startTime,
          scheduledStartTime: startTime,
          scheduledEndTime: endTime,
          address: bookingAddress,
          latitude: userLat,
          longitude: userLng,
          status: 'PENDING',
          isEmergency: Boolean(isEmergency),
          rejectedWorkerIds: [],
          basePrice,
          additionalWork: Boolean(additionalWork),
          additionalDescription: additionalDescription || null,
          additionalPrice: addPrice,
          additionalStatus: additionalWork ? 'PENDING' : 'NONE',
          finalPrice,
        },
        include: {
          customer: true,
          worker: {
            include: {
              user: true,
              cooperative: true,
            },
          },
          service: true,
        },
      });

      // 8. Create Payment Record
      const payment = await prisma.payment.create({
        data: {
          bookingId: newBooking.id,
          amount: finalPrice,
          paymentStatus: 'PENDING',
        },
      });

      const bookingData = {
        id: newBooking.id,
        bookingCode: `A2Z-${newBooking.id.substring(0, 8).toUpperCase()}`,
        customerName: newBooking.customer.fullName,
        customerAddress: newBooking.address,
        latitude: newBooking.latitude,
        longitude: newBooking.longitude,
        serviceTitle: newBooking.service.name,
        status: newBooking.status,
        isEmergency: newBooking.isEmergency,
        basePrice: Number(newBooking.basePrice),
        finalPrice: Number(newBooking.finalPrice),
        scheduledStartTime: newBooking.scheduledStartTime,
        scheduledEndTime: newBooking.scheduledEndTime,
        worker: {
          id: newBooking.worker.id,
          name: newBooking.worker.user.fullName,
          phone: newBooking.worker.user.phone,
          cooperative: newBooking.worker.cooperative.name,
          rating: Number(newBooking.worker.averageRating),
          distanceKm: assignedWorker.distanceKm,
          etaMinutes: assignedWorker.etaMinutes,
        },
        payment: {
          id: payment.id,
          amount: Number(payment.amount),
          paymentStatus: payment.paymentStatus,
        },
        dispatchDetails: {
          mode: isEmergency ? 'EMERGENCY_PROXIMITY_RATING' : 'COOPERATIVE_FAIR_SHARE',
          matchScore: assignedWorker.compositeScore,
          scoreBreakdown: assignedWorker.scoreBreakdown,
          totalCandidatesRanked: dispatchResult.totalCandidatesEvaluated,
        },
        createdAt: newBooking.createdAt,
      };

      return NextResponse.json({
        success: true,
        message: isEmergency
          ? `Emergency Artisan Dispatched: ${assignedWorker.workerName} (ETA ~${assignedWorker.etaMinutes} mins, ${assignedWorker.distanceKm} km away)`
          : `Artisan Assigned via Cooperative Fair-Share: ${assignedWorker.workerName}`,
        data: bookingData,
        booking: bookingData,
      }, { status: 201 });
    } catch (dbErr) {
      console.warn('Prisma booking creation note:', dbErr.message);
      const fallback = dbStore.createBooking(body);
      return NextResponse.json({
        success: true,
        message: 'Booking created in fallback store',
        data: fallback,
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
