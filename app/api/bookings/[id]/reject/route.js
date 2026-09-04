import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rankArtisans } from '@/lib/dispatchAlgorithm';

/**
 * POST /api/bookings/[id]/reject
 * Worker rejects an assigned job.
 * Automatically triggers cascading reassignment to the NEXT BEST CANDIDATE.
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Body optional
    }

    const { workerId, reason } = body;

    // 1. Fetch current booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        worker: {
          include: {
            user: true,
          },
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

    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return NextResponse.json({
        success: false,
        error: `Cannot reject: Booking is already ${booking.status.toLowerCase()}.`,
      }, { status: 400 });
    }

    const rejectingWorkerId = workerId || booking.workerId;
    const rejectingWorkerName = booking.worker?.user?.fullName || 'Artisan';

    // 2. Add to rejectedWorkerIds list
    const currentRejected = booking.rejectedWorkerIds || [];
    const updatedRejected = Array.from(new Set([...currentRejected, rejectingWorkerId]));

    // 3. Find candidate workers with matching skill
    const candidateWorkers = await prisma.worker.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        skills: {
          some: { skillId: booking.serviceId ? undefined : undefined }, // will match by skill
        },
      },
      include: {
        user: true,
        cooperative: true,
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

    // Filter candidate workers to those matching the service skill
    const serviceSkillWorkers = candidateWorkers.filter((w) =>
      w.skills.some((ws) => ws.skillId === booking.service.skillId)
    );

    // 4. Run dispatch engine excluding all rejected workers
    const dispatchResult = rankArtisans({
      userLat: booking.latitude || 22.6950,
      userLng: booking.longitude || 88.4550,
      workers: serviceSkillWorkers,
      isEmergency: booking.isEmergency,
      startTime: booking.scheduledStartTime,
      endTime: booking.scheduledEndTime,
      excludedWorkerIds: updatedRejected,
    });

    const nextBestArtisan = dispatchResult.topCandidate;

    if (!nextBestArtisan) {
      // Update booking to record rejection, but no other candidates found
      await prisma.booking.update({
        where: { id },
        data: {
          rejectedWorkerIds: updatedRejected,
          status: 'PENDING',
        },
      });

      return NextResponse.json({
        success: false,
        message: `Artisan ${rejectingWorkerName} rejected the job. No other available artisans currently found in this cluster.`,
        data: {
          bookingId: booking.id,
          rejectedByWorkerId: rejectingWorkerId,
          allRejectedWorkers: updatedRejected,
          nextCandidateAssigned: null,
        },
      }, { status: 200 });
    }

    // 5. Reassign to Next Best Candidate
    const reassignedBooking = await prisma.booking.update({
      where: { id },
      data: {
        workerId: nextBestArtisan.workerId,
        rejectedWorkerIds: updatedRejected,
        status: 'PENDING', // Awaiting acceptance from new candidate
      },
      include: {
        worker: {
          include: {
            user: true,
            cooperative: true,
          },
        },
        service: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Job rejected by ${rejectingWorkerName}. Automatically reassigned to NEXT BEST CANDIDATE: ${nextBestArtisan.workerName} (Score: ${nextBestArtisan.compositeScore}, ETA: ~${nextBestArtisan.etaMinutes} mins)`,
      data: {
        bookingId: reassignedBooking.id,
        rejectedWorker: {
          id: rejectingWorkerId,
          name: rejectingWorkerName,
          reason: reason || 'Artisan schedule or distance conflict',
        },
        newAssignedArtisan: {
          workerId: nextBestArtisan.workerId,
          name: nextBestArtisan.workerName,
          cooperative: nextBestArtisan.cooperative,
          rating: nextBestArtisan.rating,
          distanceKm: nextBestArtisan.distanceKm,
          etaMinutes: nextBestArtisan.etaMinutes,
          score: nextBestArtisan.compositeScore,
          scoreBreakdown: nextBestArtisan.scoreBreakdown,
        },
        allRejectedWorkerIds: updatedRejected,
        remainingCandidatesCount: dispatchResult.rankedCandidates.length - 1,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error handling booking rejection:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
