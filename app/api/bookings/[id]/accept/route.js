import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/bookings/[id]/accept
 * Assigned worker accepts the gig (moves status to ACCEPTED)
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        worker: {
          include: { user: true },
        },
        service: true,
      },
    });

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found',
      }, { status: 404 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
      },
      include: {
        worker: {
          include: { user: true, cooperative: true },
        },
        service: true,
        payment: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Booking accepted by ${updated.worker.user.fullName}. Status updated to ACCEPTED.`,
      data: updated,
    }, { status: 200 });
  } catch (error) {
    console.error('Error accepting booking:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
