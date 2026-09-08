import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dbStore } from '@/lib/dbStore';
import { invalidateTags } from '@/lib/apiCache';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUUID = (str) => typeof str === 'string' && UUID_REGEX.test(str);

/**
 * POST /api/bookings/[id]/mock-pay
 * Process payment settlement, mapped to schema.prisma Payment & Booking models
 * Marks Payment.paymentStatus = 'SUCCESS' and Booking.status = 'COMPLETED',
 * and updates Booking.finalPrice with the gratitude tip.
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is acceptable
    }

    const { tipGratitude = 0, razorpayPaymentId } = body;
    const generatedPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const tipNum = parseFloat(tipGratitude) || 0;

    try {
      let booking = null;
      if (isValidUUID(id)) {
        booking = await prisma.booking.findUnique({
          where: { id },
          include: { payment: true, worker: true },
        });
      } else {
        const cleanPrefix = id.replace(/^A2Z-/i, '').toLowerCase().trim();
        if (/^[0-9a-f]{8}$/i.test(cleanPrefix)) {
          const matching = await prisma.$queryRaw`
            SELECT id FROM "Booking" WHERE id::text LIKE ${cleanPrefix + '%'} LIMIT 1
          `;
          if (matching && matching.length > 0) {
            booking = await prisma.booking.findUnique({
              where: { id: matching[0].id },
              include: { payment: true, worker: true },
            });
          }
        }
      }

      if (booking) {
        const baseNum = Number(booking.basePrice || 0);
        const emergencyNum = booking.isEmergency ? 100 : 0;
        const addNum = Number(booking.additionalPrice || 0);
        const subtotal = baseNum + emergencyNum + addNum;
        const totalCharged = subtotal + tipNum;

        // 1. Update or create Payment record
        let paymentRecord = booking.payment;
        if (paymentRecord) {
          paymentRecord = await prisma.payment.update({
            where: { id: paymentRecord.id },
            data: {
              amount: totalCharged,
              paymentStatus: 'SUCCESS',
              razorpayPaymentId: generatedPaymentId,
            },
          });
        } else {
          paymentRecord = await prisma.payment.create({
            data: {
              bookingId: booking.id,
              amount: totalCharged,
              paymentStatus: 'SUCCESS',
              razorpayPaymentId: generatedPaymentId,
            },
          });
        }

        // 2. Mark Booking as COMPLETED and update finalPrice with gratitude tip
        const updatedBooking = await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: 'COMPLETED',
            finalPrice: totalCharged,
          },
        });

        // 3. Increment Worker totalJobs
        if (booking.workerId) {
          await prisma.worker.update({
            where: { id: booking.workerId },
            data: { totalJobs: { increment: 1 } },
          }).catch(() => {});
        }

        // 4. Calculate 85-10-5 split with 100% of tip to worker
        const workerWallet85 = Math.round((subtotal * 0.85 + tipNum) * 100) / 100;
        const societyOps10 = Math.round(subtotal * 0.10 * 100) / 100;
        const welfarePool5 = Math.round(subtotal * 0.05 * 100) / 100;

        // Sync in-memory store
        try {
          dbStore.processMockPayment(id, { tipGratitude: tipNum });
          if (booking.id !== id) {
            dbStore.processMockPayment(booking.id, { tipGratitude: tipNum });
          }
        } catch {}

        invalidateTags('bookings', 'stats', 'workers');

        return NextResponse.json({
          success: true,
          message: 'Payment settled successfully. Booking updated with tip and marked COMPLETED.',
          data: {
            bookingId: updatedBooking.id,
            finalPrice: totalCharged,
            paymentId: paymentRecord.id,
            razorpayPaymentId: paymentRecord.razorpayPaymentId,
            paymentStatus: paymentRecord.paymentStatus,
            amount: totalCharged,
            tipGratitude: tipNum,
            cooperativeSplit: {
              workerWallet85,
              societyOperations10: societyOps10,
              welfareTrust5: welfarePool5,
            },
          },
        }, { status: 200 });
      }
    } catch (dbErr) {
      console.warn('Prisma mock-pay DB note:', dbErr.message);
    }

    // In-memory fallback
    const settlement = dbStore.processMockPayment(id, body);
    if (!settlement) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found',
      }, { status: 404 });
    }

    invalidateTags('bookings', 'stats', 'workers');

    return NextResponse.json({
      success: true,
      message: 'Payment settled successfully in mock mode. Booking marked PAID.',
      data: settlement,
    }, { status: 200 });
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
