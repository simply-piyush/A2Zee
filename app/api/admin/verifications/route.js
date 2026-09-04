import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

/**
 * GET /api/admin/verifications
 * List pending artisan verification requests
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status') || 'PENDING';
    const cooperativeId = searchParams.get('cooperativeId');

    const where = {};
    if (statusParam !== 'ALL') {
      where.verificationStatus = statusParam;
    }
    if (cooperativeId) {
      where.cooperativeId = cooperativeId;
    }

    const workers = await prisma.worker.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            latitude: true,
            longitude: true,
            createdAt: true,
          },
        },
        cooperative: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = workers.map((w) => ({
      id: w.id,
      userId: w.userId,
      name: w.user.fullName,
      email: w.user.email,
      phone: w.user.phone,
      cooperative: w.cooperative.name,
      cooperativeId: w.cooperativeId,
      bio: w.bio || 'Verified tradesperson applicant',
      verificationStatus: w.verificationStatus,
      availabilityStatus: w.availabilityStatus,
      rating: Number(w.averageRating),
      totalJobs: w.totalJobs,
      latitude: w.latitude,
      longitude: w.longitude,
      skills: w.skills.map((ws) => ws.skill.name),
      registeredAt: w.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      count: formatted.length,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/verifications
 * Approve or reject an artisan's verification request
 * Body: { workerId, status: 'VERIFIED' | 'REJECTED' }
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { workerId, status } = body;

    if (!workerId || !status) {
      return NextResponse.json({
        success: false,
        error: 'workerId and status ("VERIFIED" | "REJECTED") are required.',
      }, { status: 400 });
    }

    const validStatuses = ['VERIFIED', 'REJECTED', 'PENDING'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      }, { status: 400 });
    }

    const updatedWorker = await prisma.worker.update({
      where: { id: workerId },
      data: {
        verificationStatus: status,
        ...(status === 'VERIFIED' && { availabilityStatus: 'AVAILABLE' }),
        ...(status === 'REJECTED' && { availabilityStatus: 'OFFLINE' }),
      },
      include: {
        user: { select: { fullName: true, phone: true } },
        cooperative: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Artisan ${updatedWorker.user.fullName} is now ${status}.`,
      data: {
        workerId: updatedWorker.id,
        name: updatedWorker.user.fullName,
        cooperative: updatedWorker.cooperative.name,
        verificationStatus: updatedWorker.verificationStatus,
        availabilityStatus: updatedWorker.availabilityStatus,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating worker verification:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
