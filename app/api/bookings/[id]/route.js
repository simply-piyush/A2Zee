import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dbStore } from '@/lib/dbStore';

/**
 * GET /api/bookings/[id]
 * Fetch single booking with customer, worker, service, payment, and review details
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    try {
      const b = await prisma.booking.findUnique({
        where: { id },
        include: {
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
        },
      });

      if (b) {
        const basePriceNum = Number(b.basePrice);
        const addPriceNum = Number(b.additionalPrice);
        const finalPriceNum = Number(b.finalPrice);

        const data = {
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
            skills: b.worker?.skills?.map((s) => s.skill.name) || [],
          },
          serviceId: b.serviceId,
          serviceTitle: b.service?.name,
          trade: b.service?.skill?.name?.toLowerCase() || 'service',
          bookingDate: b.bookingDate,
          bookingTime: b.bookingTime,
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
          // 85-10-5 Cooperative Split breakdown
          workerPayout: Math.round(finalPriceNum * 0.85 * 100) / 100,
          societyFund: Math.round(finalPriceNum * 0.10 * 100) / 100,
          welfareDeposit: Math.round(finalPriceNum * 0.05 * 100) / 100,
          createdAt: b.createdAt,
        };

        return NextResponse.json({
          success: true,
          data,
        }, { status: 200 });
      }
    } catch (dbErr) {
      console.warn('Prisma getBookingById note:', dbErr.message);
    }

    // In-memory fallback
    const fallbackBooking = dbStore.getBookingById(id);
    if (!fallbackBooking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: fallbackBooking,
    }, { status: 200 });
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
    const { status, address } = body;

    const validStatuses = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      }, { status: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(address && { address }),
      },
      include: {
        worker: true,
        payment: true,
      },
    });

    // If completed, increment worker jobs
    if (status === 'COMPLETED' && updated.workerId) {
      await prisma.worker.update({
        where: { id: updated.workerId },
        data: { totalJobs: { increment: 1 } },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Booking updated to ${status || 'new details'}`,
      data: updated,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
