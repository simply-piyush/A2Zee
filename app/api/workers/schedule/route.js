import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workers/schedule
 * Query a worker's booked schedule and availability
 * Query Params: ?workerId=...
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');

    if (!workerId) {
      return NextResponse.json({
        success: false,
        error: 'workerId query parameter is required.',
      }, { status: 400 });
    }

    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        user: { select: { fullName: true, phone: true } },
        cooperative: { select: { name: true } },
        bookings: {
          where: {
            status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] },
          },
          select: {
            id: true,
            bookingCode: true,
            status: true,
            bookingDate: true,
            bookingTime: true,
            scheduledStartTime: true,
            scheduledEndTime: true,
            address: true,
            isEmergency: true,
            service: { select: { name: true } },
          },
          orderBy: { bookingDate: 'asc' },
        },
      },
    });

    if (!worker) {
      return NextResponse.json({
        success: false,
        error: 'Worker not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        workerId: worker.id,
        name: worker.user.fullName,
        cooperative: worker.cooperative.name,
        availabilityStatus: worker.availabilityStatus,
        activeBookingsCount: worker.bookings.length,
        schedule: worker.bookings.map((b) => ({
          bookingId: b.id,
          service: b.service?.name,
          status: b.status,
          isEmergency: b.isEmergency,
          startTime: b.scheduledStartTime || b.bookingDate,
          endTime: b.scheduledEndTime || new Date(new Date(b.bookingDate).getTime() + 2 * 3600000),
          address: b.address,
        })),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching worker schedule:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
