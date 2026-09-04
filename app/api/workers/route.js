import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/workers
 * List workers with user info, cooperative, and skills
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skillName = searchParams.get('skill');
    const status = searchParams.get('status');

    const workers = await prisma.worker.findMany({
      where: {
        ...(status && { availabilityStatus: status }),
        ...(skillName && {
          skills: {
            some: {
              skill: {
                name: { contains: skillName, mode: 'insensitive' },
              },
            },
          },
        }),
      },
      include: {
        user: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
        cooperative: {
          select: { id: true, name: true, registrationNumber: true },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { averageRating: 'desc' },
    });

    const formatted = workers.map((w) => ({
      id: w.id,
      userId: w.userId,
      name: w.user.fullName,
      phone: w.user.phone,
      email: w.user.email,
      cooperative: w.cooperative.name,
      cooperativeId: w.cooperativeId,
      bio: w.bio,
      averageRating: Number(w.averageRating),
      totalJobs: w.totalJobs,
      verificationStatus: w.verificationStatus,
      availabilityStatus: w.availabilityStatus,
      skills: w.skills.map((ws) => ws.skill.name),
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
