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
      cooperativeId: session.cooperativeId || null,
      cooperativeName: session.cooperativeName || null,
      isCooperativeAdmin: Boolean(session.isCooperativeAdmin || session.cooperativeId),
    };

    // 1. If Cooperative Admin session
    if (session.cooperativeId) {
      try {
        const coop = await prisma.cooperative.findUnique({
          where: { id: session.cooperativeId },
        });
        if (coop) {
          user.cooperativeId = coop.id;
          user.cooperativeName = coop.name;
          user.registrationNumber = coop.registrationNumber;
          user.isCooperativeAdmin = true;
          user.role = 'ADMIN';
        }
      } catch (e) {
        console.warn('Could not fetch cooperative details in /me:', e.message);
      }
    } else {
      // 2. Regular User (UUID)
      try {
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (typeof session.sub === 'string' && UUID_REGEX.test(session.sub)) {
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
        }
      } catch (e) {
        console.warn('Could not fetch latest user details from DB:', e.message);
      }
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
