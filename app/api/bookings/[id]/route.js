import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dbStore } from '@/lib/dbStore';
import { getCached, setCached, invalidateTags } from '@/lib/apiCache';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUUID = (str) => typeof str === 'string' && UUID_REGEX.test(str);

const includeRelations = {
  customer: {
    select: { id: true, fullName: true, phone: true, email: true },
  },
  worker: {
    include: {
      user: {
        select: { id: true, fullName: true, phone: true },
      },
      cooperative: true,
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
};

function formatPrismaBooking(b) {
  const basePriceNum = Number(b.basePrice || 0);
  const emergencyNum = b.isEmergency ? 100 : 0;
  const addPriceNum = Number(b.additionalPrice || 0);
  const finalPriceNum = Number(b.finalPrice || (basePriceNum + emergencyNum + addPriceNum));

  let extraChargesList = [];
  let extraChargeReason = 'Mid-Work Adjustments / Materials';
  if (b.additionalDescription) {
    try {
      const parsed = typeof b.additionalDescription === 'string' ? JSON.parse(b.additionalDescription) : b.additionalDescription;
      if (Array.isArray(parsed)) {
        extraChargesList = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.charges)) extraChargesList = parsed.charges;
        if (parsed.summary) extraChargeReason = parsed.summary;
      }
    } catch {
      extraChargeReason = b.additionalDescription;
    }
  }

  if (extraChargesList.length === 0 && addPriceNum > 0) {
    extraChargesList = [{
      id: 'chg_default',
      reason: extraChargeReason,
      amount: addPriceNum,
    }];
  }

  const paidAmount = Number(b.payment?.amount || finalPriceNum);
  const subtotalBeforeTip = basePriceNum + emergencyNum + addPriceNum;
  const tipGratitude = Math.max(0, Math.round((paidAmount - subtotalBeforeTip) * 100) / 100);

  return {
    id: b.id,
    bookingCode: `A2Z-${b.id.substring(0, 8).toUpperCase()}`,
    customerId: b.customerId,
    customerName: b.customer?.fullName,
    customerPhone: b.customer?.phone,
    customerAddress: b.address,
    address: b.address,
    workerId: b.workerId,
    worker: {
      id: b.worker?.id,
      name: b.worker?.user?.fullName || 'Assigned Worker',
      phone: b.worker?.user?.phone,
      cooperative: b.worker?.cooperative?.name,
      rating: Number(b.worker?.averageRating || 5.0),
      totalJobs: b.worker?.totalJobs || 0,
      skills: b.worker?.skills?.map((s) => s.skill?.name || s.name || s) || [],
    },
    serviceId: b.serviceId,
    serviceTitle: b.service?.name,
    trade: b.service?.skill?.name?.toLowerCase() || 'service',
    bookingDate: b.bookingDate,
    bookingTime: b.bookingTime,
    scheduledStartTime: b.scheduledStartTime,
    scheduledEndTime: b.scheduledEndTime,
    status: b.status,
    isEmergency: b.isEmergency,
    basePrice: basePriceNum,
    additionalWork: b.additionalWork,
    additionalDescription: b.additionalDescription,
    additionalPrice: addPriceNum,
    extraAmount: addPriceNum,
    extraCharges: extraChargesList,
    extraChargeReason,
    additionalStatus: b.additionalStatus,
    finalPrice: finalPriceNum,
    tipGratitude,
    paidAmount,
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
    workerPayout: Math.round((finalPriceNum * 0.85 + tipGratitude) * 100) / 100,
    societyFund: Math.round(finalPriceNum * 0.10 * 100) / 100,
    welfareDeposit: Math.round(finalPriceNum * 0.05 * 100) / 100,
    createdAt: b.createdAt,
  };
}

/**
 * GET /api/bookings/[id]
 * Fetch single booking with customer, worker, service, payment, and review details
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Booking ID required' }, { status: 400 });
    }

    const cacheKey = `booking_${id}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    // 1. Try finding in Prisma PostgreSQL via high-performance single query
    try {
      const isUUID = isValidUUID(id);
      const cleanPrefix = !isUUID ? id.replace(/^A2Z-/i, '').toLowerCase().trim() : null;
      const isPrefix = cleanPrefix && /^[0-9a-f]{8}$/i.test(cleanPrefix);

      if (isUUID || isPrefix) {
        const targetId = isUUID ? id : null;
        const prefixLike = isPrefix ? `${cleanPrefix}%` : null;

        const rawBookings = await prisma.$queryRaw`
          SELECT 
            b.id,
            b."customerId",
            b."workerId",
            b."serviceId",
            b."bookingDate",
            b."bookingTime",
            b."scheduledStartTime",
            b."scheduledEndTime",
            b.address,
            b.latitude,
            b.longitude,
            b.status,
            b."isEmergency",
            b."basePrice",
            b."additionalWork",
            b."additionalDescription",
            b."additionalPrice",
            b."additionalStatus",
            b."finalPrice",
            b."rejectedWorkerIds",
            b."createdAt",
            -- Customer
            json_build_object(
              'id', cu.id,
              'fullName', cu."fullName",
              'phone', cu.phone,
              'email', cu.email
            ) as customer,
            -- Worker
            json_build_object(
              'id', w.id,
              'averageRating', w."averageRating",
              'totalJobs', w."totalJobs",
              'user', json_build_object('id', wu.id, 'fullName', wu."fullName", 'phone', wu.phone),
              'cooperative', json_build_object('name', co.name),
              'skills', COALESCE((
                SELECT json_agg(json_build_object('skill', json_build_object('name', sk.name)))
                FROM "WorkerSkill" wsk
                JOIN "Skill" sk ON wsk."skillId" = sk.id
                WHERE wsk."workerId" = w.id
              ), '[]'::json)
            ) as worker,
            -- Service
            json_build_object(
              'id', s.id,
              'name', s.name,
              'skill', json_build_object('name', ssk.name)
            ) as service,
            -- Payment
            CASE WHEN p.id IS NOT NULL THEN json_build_object(
              'id', p.id,
              'amount', p.amount,
              'paymentStatus', p."paymentStatus",
              'razorpayPaymentId', p."razorpayPaymentId"
            ) ELSE NULL END as payment,
            -- Review
            CASE WHEN r.id IS NOT NULL THEN json_build_object(
              'id', r.id,
              'rating', r.rating,
              'comment', r.comment
            ) ELSE NULL END as review
          FROM "Booking" b
          LEFT JOIN "User" cu ON b."customerId" = cu.id
          LEFT JOIN "Worker" w ON b."workerId" = w.id
          LEFT JOIN "User" wu ON w."userId" = wu.id
          LEFT JOIN "Cooperative" co ON w."cooperativeId" = co.id
          LEFT JOIN "Service" s ON b."serviceId" = s.id
          LEFT JOIN "Skill" ssk ON s."skillId" = ssk.id
          LEFT JOIN "Payment" p ON b.id = p."bookingId"
          LEFT JOIN "Review" r ON b.id = r."bookingId"
          WHERE (${targetId}::text IS NOT NULL AND b.id::text = ${targetId})
             OR (${prefixLike}::text IS NOT NULL AND b.id::text LIKE ${prefixLike})
          LIMIT 1
        `;

        if (rawBookings && rawBookings.length > 0) {
          const formatted = formatPrismaBooking(rawBookings[0]);
          const responsePayload = {
            success: true,
            data: formatted,
          };
          setCached(cacheKey, responsePayload, 3, ['bookings']);
          return NextResponse.json(responsePayload, { status: 200 });
        }
      }
    } catch (dbErr) {
      console.warn('Prisma getBookingById note:', dbErr.message);
    }

    // 2. In-memory fallback
    const fallbackBooking = dbStore.getBookingById(id);
    if (fallbackBooking) {
      return NextResponse.json({
        success: true,
        data: fallbackBooking,
      }, { status: 200 });
    }

    return NextResponse.json({
      success: false,
      error: 'Booking not found',
    }, { status: 404 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * PATCH /api/bookings/[id]
 * Update booking status or details
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, address, finalPrice, workerPayout, scheduledEndTime } = body;

    const validStatuses = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      }, { status: 400 });
    }

    let targetUuid = isValidUUID(id) ? id : null;

    // If not a full UUID, check if booking code maps to a Prisma booking
    if (!targetUuid) {
      const cleanPrefix = id.replace(/^A2Z-/i, '').toLowerCase().trim();
      if (/^[0-9a-f]{8}$/i.test(cleanPrefix)) {
        try {
          const matching = await prisma.$queryRaw`
            SELECT id FROM "Booking" WHERE id::text LIKE ${cleanPrefix + '%'} LIMIT 1
          `;
          if (matching && matching.length > 0) {
            targetUuid = matching[0].id;
          }
        } catch (matchErr) {
          console.warn('Prefix match note:', matchErr.message);
        }
      }
    }

    // 1. Update in Prisma if UUID is identified
    if (targetUuid) {
      try {
        const updateData = {};
        if (status) updateData.status = status;
        if (address) updateData.address = address;
        if (finalPrice !== undefined) updateData.finalPrice = Number(finalPrice);
        if (scheduledEndTime) {
          updateData.scheduledEndTime = new Date(scheduledEndTime);
        } else if (status === 'COMPLETED') {
          updateData.scheduledEndTime = new Date();
        }

        const updated = await prisma.booking.update({
          where: { id: targetUuid },
          data: updateData,
          include: includeRelations,
        });

        // If completed, increment worker jobs
        if (status === 'COMPLETED' && updated.workerId) {
          await prisma.worker.update({
            where: { id: updated.workerId },
            data: { totalJobs: { increment: 1 } },
          }).catch(() => {});
        }

        const formatted = formatPrismaBooking(updated);

        // Also sync in-memory dbStore so both databases reflect this
        dbStore.updateBookingStatus(targetUuid, {
          status,
          finalPrice,
          workerPayout,
          scheduledEndTime: formatted.scheduledEndTime,
        });
        if (formatted.bookingCode) {
          dbStore.updateBookingStatus(formatted.bookingCode, {
            status,
            finalPrice,
            workerPayout,
            scheduledEndTime: formatted.scheduledEndTime,
          });
        }

        invalidateTags('bookings', 'stats');

        return NextResponse.json({
          success: true,
          message: `Booking updated to ${status || 'new details'}`,
          data: formatted,
        }, { status: 200 });
      } catch (dbErr) {
        console.warn('Prisma PATCH note:', dbErr.message);
      }
    }

    // 2. In-memory update for mock/demo IDs (e.g. gig_em_1, gig_std_3, bk_2026_01)
    const updatedFallback = dbStore.updateBookingStatus(id, {
      status,
      address,
      finalPrice,
      workerPayout,
      scheduledEndTime: scheduledEndTime || (status === 'COMPLETED' ? new Date().toISOString() : undefined),
    });

    invalidateTags('bookings', 'stats');

    return NextResponse.json({
      success: true,
      message: `Booking updated to ${status || 'new details'}`,
      data: updatedFallback || { id, status: status || 'UPDATED' },
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
