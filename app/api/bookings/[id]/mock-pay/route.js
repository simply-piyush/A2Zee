import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dbStore } from '@/lib/dbStore';

/**
 * POST /api/bookings/[id]/mock-pay
 * Process payment settlement, mapped to schema.prisma Payment & Booking models
 * Marks Payment.paymentStatus = 'SUCCESS' and Booking.status = 'COMPLETED'
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

    try {
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: { payment: true, worker: true },
      });

      if (booking) {
        const finalPriceNum = Number(booking.finalPrice);
        const tipNum = parseFloat(tipGratitude) || 0;
        const totalCharged = finalPriceNum + tipNum;

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

        // 2. Mark Booking as COMPLETED
        await prisma.booking.update({
          where: { id },
          data: {
            status: 'COMPLETED',
          },
        });

        // 3. Increment Worker totalJobs
        if (booking.workerId) {
          await prisma.worker.update({
            where: { id: booking.workerId },
            data: { totalJobs: { increment: 1 } },
          });
        }

        // 4. Calculate 85-10-5 split
        const workerWallet85 = Math.round((finalPriceNum * 0.85 + tipNum) * 100) / 100;
        const societyOps10 = Math.round(finalPriceNum * 0.10 * 100) / 100;
        const welfarePool5 = Math.round(finalPriceNum * 0.05 * 100) / 100;

        return NextResponse.json({
          success: true,
          message: 'Payment settled successfully. Booking marked COMPLETED.',
          data: {
            bookingId: booking.id,
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
