import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dbStore } from '@/lib/dbStore';
import { invalidateTags } from '@/lib/apiCache';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUUID = (str) => typeof str === 'string' && UUID_REGEX.test(str);

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
      totalExtra,
      extraCharges,
      reason,
      notes,
      additionalDescription,
      action, // 'ACCEPT' | 'REJECT' | 'REQUEST'
    } = body;

    try {
      let existingBooking = null;
      if (isValidUUID(id)) {
        existingBooking = await prisma.booking.findUnique({
          where: { id },
          include: { payment: true },
        });
      } else {
        const cleanPrefix = id.replace(/^A2Z-/i, '').toLowerCase().trim();
        if (/^[0-9a-f]{8}$/i.test(cleanPrefix)) {
          const matching = await prisma.$queryRaw`
            SELECT id FROM "Booking" WHERE id::text LIKE ${cleanPrefix + '%'} LIMIT 1
          `;
          if (matching && matching.length > 0) {
            existingBooking = await prisma.booking.findUnique({
              where: { id: matching[0].id },
              include: { payment: true },
            });
          }
        }
      }

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
            where: { id: existingBooking.id },
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

          invalidateTags('bookings', 'stats');

          return NextResponse.json({
            success: true,
            message: 'Additional work accepted by customer. Final price updated.',
            data: updated,
          }, { status: 200 });
        } else if (action === 'REJECT' || action === 'REJECTED') {
          const updated = await prisma.booking.update({
            where: { id: existingBooking.id },
            data: {
              additionalStatus: 'REJECTED',
              finalPrice: basePriceNum + (existingBooking.isEmergency ? 100 : 0),
            },
          });

          invalidateTags('bookings', 'stats');

          return NextResponse.json({
            success: true,
            message: 'Additional work rejected. Reverted to base price.',
            data: updated,
          }, { status: 200 });
        }

        // Case 2: Worker logs/requests additional charges
        const amountToAdd = parseFloat(extraAmount ?? additionalPrice ?? 0);
        const reasonText = reason || notes || additionalDescription || 'Extra on-site labor and materials';

        // Parse existing itemized charges if already stored
        let currentCharges = [];
        if (existingBooking.additionalDescription) {
          try {
            const parsed = JSON.parse(existingBooking.additionalDescription);
            if (Array.isArray(parsed)) currentCharges = parsed;
            else if (Array.isArray(parsed.charges)) currentCharges = parsed.charges;
          } catch {
            if (Number(existingBooking.additionalPrice) > 0) {
              currentCharges = [{
                id: 'chg_init',
                reason: existingBooking.additionalDescription,
                amount: Number(existingBooking.additionalPrice),
                createdAt: new Date().toISOString(),
              }];
            }
          }
        }

        const updatedCharges = Array.isArray(extraCharges) && extraCharges.length > 0
          ? extraCharges
          : [
              ...currentCharges,
              {
                id: `chg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                reason: reasonText,
                amount: amountToAdd,
                createdAt: new Date().toISOString(),
              },
            ];

        const newTotalExtra = totalExtra !== undefined
          ? parseFloat(totalExtra)
          : updatedCharges.reduce((sum, c) => sum + Number(c.amount || 0), 0);

        const newFinalPrice = basePriceNum + (existingBooking.isEmergency ? 100 : 0) + newTotalExtra;

        const updatedBooking = await prisma.booking.update({
          where: { id: existingBooking.id },
          data: {
            additionalWork: true,
            additionalDescription: JSON.stringify({
              summary: reasonText,
              charges: updatedCharges,
            }),
            additionalPrice: newTotalExtra,
            additionalStatus: 'ACCEPTED',
            finalPrice: newFinalPrice,
          },
          include: {
            worker: true,
            payment: true,
          },
        });

        if (existingBooking.payment) {
          await prisma.payment.update({
            where: { id: existingBooking.payment.id },
            data: { amount: newFinalPrice },
          });
        }

        // Also sync in-memory store
        try {
          await dbStore.addExtraCharge(id, { ...body, extraCharges: updatedCharges, extraAmount: amountToAdd });
        } catch {}

        invalidateTags('bookings', 'stats');

        return NextResponse.json({
          success: true,
          message: 'Additional charges logged and added to customer bill.',
          data: {
            bookingId: updatedBooking.id,
            additionalWork: updatedBooking.additionalWork,
            additionalDescription: updatedBooking.additionalDescription,
            additionalPrice: Number(updatedBooking.additionalPrice),
            extraCharges: updatedCharges,
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

    invalidateTags('bookings', 'stats');

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
