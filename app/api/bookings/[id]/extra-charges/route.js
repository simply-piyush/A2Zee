import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dbStore } from '@/lib/dbStore';

/**
 * POST /api/bookings/[id]/extra-charges
 * Mapped to schema.prisma:
 * Booking.additionalWork, Booking.additionalDescription, Booking.additionalPrice, Booking.additionalStatus, Booking.finalPrice
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      extraAmount,
      additionalPrice,
      reason,
      notes,
      additionalDescription,
      action, // 'ACCEPT' | 'REJECT' | 'REQUEST'
    } = body;

    try {
      const existingBooking = await prisma.booking.findUnique({
        where: { id },
        include: { payment: true },
      });

      if (existingBooking) {
        if (existingBooking.status === 'COMPLETED' || existingBooking.payment?.paymentStatus === 'SUCCESS') {
          return NextResponse.json({
            success: false,
            error: 'Cannot modify additional work: Job is already completed and paid.',
          }, { status: 400 });
        }

        const basePriceNum = Number(existingBooking.basePrice);

        // Case 1: Customer accepts or rejects
        if (action === 'ACCEPT' || action === 'ACCEPTED') {
          const addPrice = Number(existingBooking.additionalPrice);
          const newFinalPrice = basePriceNum + addPrice + (existingBooking.isEmergency ? 100 : 0);

          const updated = await prisma.booking.update({
            where: { id },
            data: {
              additionalStatus: 'ACCEPTED',
              finalPrice: newFinalPrice,
            },
            include: { payment: true },
          });

          if (existingBooking.payment) {
            await prisma.payment.update({
              where: { id: existingBooking.payment.id },
              data: { amount: newFinalPrice },
            });
          }

          return NextResponse.json({
            success: true,
            message: 'Additional work accepted by customer. Final price updated.',
            data: updated,
          }, { status: 200 });
        } else if (action === 'REJECT' || action === 'REJECTED') {
          const updated = await prisma.booking.update({
            where: { id },
            data: {
              additionalStatus: 'REJECTED',
              finalPrice: basePriceNum + (existingBooking.isEmergency ? 100 : 0),
            },
          });

          return NextResponse.json({
            success: true,
            message: 'Additional work rejected. Reverted to base price.',
            data: updated,
          }, { status: 200 });
        }

        // Case 2: Worker requests additional work (Default)
        const priceRequested = parseFloat(additionalPrice ?? extraAmount ?? 0);
        const descriptionText = notes || additionalDescription || reason || 'Extra on-site labor and materials';

        const updatedBooking = await prisma.booking.update({
          where: { id },
          data: {
            additionalWork: true,
            additionalDescription: descriptionText,
            additionalPrice: priceRequested,
            additionalStatus: 'PENDING',
          },
          include: {
            worker: true,
            payment: true,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Additional work quote submitted for customer approval.',
          data: {
            bookingId: updatedBooking.id,
            additionalWork: updatedBooking.additionalWork,
            additionalDescription: updatedBooking.additionalDescription,
            additionalPrice: Number(updatedBooking.additionalPrice),
            additionalStatus: updatedBooking.additionalStatus,
            basePrice: Number(updatedBooking.basePrice),
            finalPrice: Number(updatedBooking.finalPrice),
          },
        }, { status: 201 });
      }
    } catch (dbErr) {
      console.warn('Prisma extra-charges DB note:', dbErr.message);
    }

    // In-memory fallback
    const result = await dbStore.addExtraCharge(id, body);
    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Extra charge logged and submitted for customer approval.',
      data: result,
    }, { status: 201 });
  } catch (error) {
    console.error('Error logging extra charge:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
