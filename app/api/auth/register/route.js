import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createToken, COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/register
 * Real Database Account Registration for Customers and Cooperative Artisans
 * Newly registered workers are initialized as PENDING verification.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      phone,
      fullName,
      email,
      password,
      role = 'CUSTOMER',
      trade,
      skillId,
      cooperativeId,
      bio,
      latitude,
      longitude,
      address,
    } = body;

    // Validation
    if (!phone || !fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Full Name, Email, Phone, and Password are all required.' },
        { status: 400 }
      );
    }

    // Role normalization
    let normalizedRole = 'CUSTOMER';
    const roleUpper = (role || '').toUpperCase();
    if (roleUpper === 'WORKER') {
      normalizedRole = 'WORKER';
    } else if (roleUpper === 'ADMIN') {
      normalizedRole = 'ADMIN';
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check if phone or email already registered
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { email: cleanEmail },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this phone number or email address already exists. Please Sign In.' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const latNum = latitude ? parseFloat(latitude) : 22.6950;
    const lngNum = longitude ? parseFloat(longitude) : 88.4550;

    // 1. Create User in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role: normalizedRole,
        latitude: latNum,
        longitude: lngNum,
      },
    });

    let workerRecord = null;

    // 2. If Worker, create Worker profile with initial status PENDING (unverified)
    if (normalizedRole === 'WORKER') {
      let targetCoopId = cooperativeId;

      if (!targetCoopId) {
        // Fallback to first cooperative if not specified
        const defaultCoop = await prisma.cooperative.findFirst();
        targetCoopId = defaultCoop?.id;
      }

      if (!targetCoopId) {
        return NextResponse.json(
          { success: false, error: 'Valid Cooperative Society is required to register as an artisan.' },
          { status: 400 }
        );
      }

      // Create Worker strictly with PENDING verification
      workerRecord = await prisma.worker.create({
        data: {
          userId: newUser.id,
          cooperativeId: targetCoopId,
          bio: bio || 'Certified cooperative tradesperson applicant',
          averageRating: 5.00,
          totalJobs: 0,
          verificationStatus: 'PENDING', // Initial unverified state
          availabilityStatus: 'OFFLINE',
          latitude: latNum,
          longitude: lngNum,
        },
      });

      // Link Skill
      let targetSkillId = skillId;
      if (!targetSkillId && trade) {
        const matchedSkill = await prisma.skill.findFirst({
          where: { name: { contains: trade, mode: 'insensitive' } },
        });
        targetSkillId = matchedSkill?.id;
      }

      if (targetSkillId) {
        await prisma.workerSkill.create({
          data: {
            workerId: workerRecord.id,
            skillId: targetSkillId,
          },
        });
      }
    }

    // 3. Issue signed JWT session token
    const token = await createToken({
      sub: newUser.id,
      phone: newUser.phone,
      name: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      cooperativeId: workerRecord?.cooperativeId || null,
      verificationStatus: workerRecord?.verificationStatus || 'N/A',
    });

    const isWorkerPending = normalizedRole === 'WORKER' && workerRecord?.verificationStatus === 'PENDING';

    const response = NextResponse.json({
      success: true,
      message: isWorkerPending
        ? 'Artisan account created successfully. Your profile is currently PENDING verification by your cooperative society administrator.'
        : 'Account created successfully.',
      user: {
        id: newUser.id,
        phone: newUser.phone,
        name: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        verificationStatus: workerRecord?.verificationStatus || null,
      },
      token,
    }, { status: 201 });

    // Set secure cookie
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
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
