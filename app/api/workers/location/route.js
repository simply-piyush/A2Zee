import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

/**
 * PATCH /api/workers/location
 * Updates artisan live GPS coordinates and availability status
 * Body: { workerId, latitude, longitude, availabilityStatus }
 */
export async function PATCH(request) {
  try {
    const session = await getAuthSession(request);
    const body = await request.json();
    const { workerId: inputWorkerId, latitude, longitude, availabilityStatus } = body;

    let targetWorkerId = inputWorkerId;

    // If workerId not provided in body, try resolving from session
    if (!targetWorkerId && session?.sub) {
      const worker = await prisma.worker.findUnique({
        where: { userId: session.sub },
      });
      targetWorkerId = worker?.id;
    }

    if (!targetWorkerId) {
      return NextResponse.json({
        success: false,
        error: 'workerId is required.',
      }, { status: 400 });
    }

    const data = {};
    if (latitude !== undefined) data.latitude = parseFloat(latitude);
    if (longitude !== undefined) data.longitude = parseFloat(longitude);
    if (availabilityStatus) {
      const validStatuses = ['AVAILABLE', 'BUSY', 'OFFLINE'];
      if (!validStatuses.includes(availabilityStatus)) {
        return NextResponse.json({
          success: false,
          error: `Invalid availabilityStatus. Must be one of: ${validStatuses.join(', ')}`,
        }, { status: 400 });
      }
      data.availabilityStatus = availabilityStatus;
    }

    const updatedWorker = await prisma.worker.update({
      where: { id: targetWorkerId },
      data,
      include: {
        user: { select: { fullName: true, phone: true } },
        cooperative: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Worker location and status updated successfully.',
      data: {
        workerId: updatedWorker.id,
        name: updatedWorker.user.fullName,
        latitude: updatedWorker.latitude,
        longitude: updatedWorker.longitude,
        availabilityStatus: updatedWorker.availabilityStatus,
        cooperative: updatedWorker.cooperative.name,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating worker location:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
