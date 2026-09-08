import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createToken, COOKIE_NAME, DEMO_USERS } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { phone, email, identifier: inputId, password, role } = await request.json();

    const identifier = inputId?.trim() || phone?.trim() || email?.trim();
    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Login identifier (email, phone, or cooperative ID) is required' },
        { status: 400 }
      );
    }

    let authenticatedUser = null;

    // 1. Check if identifier is a Cooperative Admin (by adminEmail or registrationNumber)
    try {
      const coop = await prisma.cooperative.findFirst({
        where: {
          OR: [
            { adminEmail: identifier },
            { registrationNumber: identifier },
          ],
        },
      });

      if (coop) {
        let passwordMatches = true;
        if (password && coop.adminPasswordHash) {
          passwordMatches = await bcrypt.compare(password, coop.adminPasswordHash);
        }

        if (passwordMatches) {
          authenticatedUser = {
            id: `coop_admin_${coop.id}`,
            cooperativeId: coop.id,
            cooperativeName: coop.name,
            registrationNumber: coop.registrationNumber,
            name: `${coop.name} Admin`,
            email: coop.adminEmail,
            phone: coop.adminPhone || '+91 33 2289 1100',
            role: 'ADMIN',
            isCooperativeAdmin: true,
          };
        }
      }
    } catch (coopErr) {
      console.warn('Cooperative login check note:', coopErr.message);
    }

    // 2. Query Neon PostgreSQL User table (Customer / Worker / Admin)
    if (!authenticatedUser) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: identifier },
              { email: identifier },
            ],
          },
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
          let passwordMatches = true;
          if (password && dbUser.passwordHash) {
            passwordMatches = await bcrypt.compare(password, dbUser.passwordHash);
          }

          if (passwordMatches) {
            authenticatedUser = {
              id: dbUser.id,
              phone: dbUser.phone,
              name: dbUser.fullName,
              email: dbUser.email,
              role: dbUser.role,
              latitude: dbUser.latitude,
              longitude: dbUser.longitude,
              worker: dbUser.worker ? {
                id: dbUser.worker.id,
                cooperativeId: dbUser.worker.cooperativeId,
                cooperative: dbUser.worker.cooperative?.name,
                verificationStatus: dbUser.worker.verificationStatus,
                availabilityStatus: dbUser.worker.availabilityStatus,
                averageRating: Number(dbUser.worker.averageRating),
                totalJobs: dbUser.worker.totalJobs,
                latitude: dbUser.worker.latitude,
                longitude: dbUser.worker.longitude,
                skills: dbUser.worker.skills.map((s) => s.skill.name),
              } : null,
            };
          }
        }
      } catch (dbErr) {
        console.warn('Prisma login lookup note:', dbErr.message);
      }
    }

    // 3. Fallback to predefined DEMO_USERS (ensure genuine PostgreSQL User with UUID is created/retrieved)
    if (!authenticatedUser) {
      const demoUser = DEMO_USERS.find(
        (u) => u.phone === identifier || (role && u.role === role)
      );

      if (demoUser) {
        let normalizedRole = 'CUSTOMER';
        if (demoUser.role === 'WORKER') normalizedRole = 'WORKER';
        if (demoUser.role === 'FEDERATION_ADMIN' || demoUser.role === 'SOCIETY_ADMIN' || demoUser.role === 'ADMIN') {
          normalizedRole = 'ADMIN';
        }

        try {
          const dbDemoUser = await prisma.user.upsert({
            where: { phone: demoUser.phone },
            update: {
              fullName: demoUser.name,
              role: normalizedRole,
            },
            create: {
              fullName: demoUser.name,
              phone: demoUser.phone,
              email: `${demoUser.phone.replace(/[^0-9]/g, '')}@a2zee.local`,
              passwordHash: '$2b$10$dummyhashforguestcustomeraccount1234567890',
              role: normalizedRole,
              latitude: 22.6950,
              longitude: 88.4550,
            },
          });

          authenticatedUser = {
            id: dbDemoUser.id,
            phone: dbDemoUser.phone,
            name: dbDemoUser.fullName,
            email: dbDemoUser.email,
            role: dbDemoUser.role,
          };
        } catch (dbErr) {
          console.warn('Demo user db upsert fallback:', dbErr.message);
          authenticatedUser = demoUser;
        }
      }
    }

    // 4. Fallback dynamic session (upsert real User with UUID)
    if (!authenticatedUser) {
      const roleUpper = (role || 'CUSTOMER').toUpperCase();
      const normalizedRole = roleUpper === 'WORKER' ? 'WORKER' : roleUpper === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
      const cleanPhone = identifier.startsWith('+') ? identifier : `+91${identifier.replace(/[^0-9]/g, '').slice(-10)}`;
      
      try {
        const dynamicUser = await prisma.user.upsert({
          where: { phone: cleanPhone },
          update: { role: normalizedRole },
          create: {
            fullName: cleanPhone === '+919899011223' ? 'Priya Soni' : 'A2Zee Member',
            phone: cleanPhone,
            email: `${cleanPhone.replace(/[^0-9]/g, '')}@a2zee.local`,
            passwordHash: '$2b$10$dummyhashforguestcustomeraccount1234567890',
            role: normalizedRole,
            latitude: 22.6950,
            longitude: 88.4550,
          },
        });

        authenticatedUser = {
          id: dynamicUser.id,
          phone: dynamicUser.phone,
          name: dynamicUser.fullName,
          email: dynamicUser.email,
          role: dynamicUser.role,
        };
      } catch (dynErr) {
        console.warn('Dynamic user upsert note:', dynErr.message);
        authenticatedUser = {
          id: '00000000-0000-0000-0000-000000000001',
          phone: cleanPhone,
          name: cleanPhone === '+919899011223' ? 'Priya Soni' : 'A2Zee Member',
          email: `${cleanPhone.replace(/[^0-9]/g, '')}@a2zee.local`,
          role: normalizedRole,
        };
      }
    }

    // 5. Generate signed JWT token
    const token = await createToken({
      sub: authenticatedUser.id,
      phone: authenticatedUser.phone,
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      role: authenticatedUser.role,
      cooperativeId: authenticatedUser.cooperativeId || null,
      cooperativeName: authenticatedUser.cooperativeName || null,
      isCooperativeAdmin: Boolean(authenticatedUser.isCooperativeAdmin || authenticatedUser.cooperativeId),
    });

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: authenticatedUser,
      token,
    }, { status: 200 });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
