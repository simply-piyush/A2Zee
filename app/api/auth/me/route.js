import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getAuthSession(request);

    if (!session) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let user = {
      id: session.sub,
      phone: session.phone,
      name: session.name,
      email: session.email,
      role: session.role,
    };

    // Attempt to load fresh data from DB
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.sub },
        include: {
          worker: {
            include: {
              cooperative: true,
              skills: {
                include: { skill: true },
              },
            },
          },
        },
      });

      if (dbUser) {
        user = {
          id: dbUser.id,
          phone: dbUser.phone,
          name: dbUser.fullName,
          email: dbUser.email,
          role: dbUser.role,
          worker: dbUser.worker ? {
            id: dbUser.worker.id,
            cooperativeId: dbUser.worker.cooperativeId,
            cooperativeName: dbUser.worker.cooperative?.name,
            verificationStatus: dbUser.worker.verificationStatus,
            availabilityStatus: dbUser.worker.availabilityStatus,
            averageRating: Number(dbUser.worker.averageRating),
            totalJobs: dbUser.worker.totalJobs,
            skills: dbUser.worker.skills.map((ws) => ws.skill.name),
          } : null,
        };
      }
    } catch (e) {
      console.warn('Could not fetch latest user details from DB:', e.message);
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
