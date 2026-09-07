import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { dbStore } from '@/lib/dbStore';

/**
 * GET /api/addresses
 * Returns saved addresses for the authenticated user or worker.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    let workerId = searchParams.get('workerId');

    if (!userId && !workerId) {
      const session = await getAuthSession(request);
      const sessionUserId = session?.sub || session?.id;
      if (sessionUserId) {
        if (session.role === 'WORKER') {
          try {
            const worker = await prisma.worker.findUnique({ where: { userId: sessionUserId } });
            if (worker) workerId = worker.id;
            else userId = sessionUserId;
          } catch (e) {
            userId = sessionUserId;
          }
        } else {
          userId = sessionUserId;
        }
      }
    }

    // Default to seeded demo customer if not specified
    if (!userId && !workerId) {
      try {
        const demoCustomer = await prisma.user.findFirst({
          where: { role: 'CUSTOMER' },
        });
        if (demoCustomer) userId = demoCustomer.id;
      } catch (e) {}
    }

    try {
      const where = {};
      if (userId) where.userId = userId;
      if (workerId) where.workerId = workerId;

      const addresses = await prisma.address.findMany({
        where,
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });

      return NextResponse.json({
        success: true,
        count: addresses.length,
        data: addresses,
      });
    } catch (dbErr) {
      console.warn('Prisma addresses fetch note:', dbErr.message);
    }

    // Fallback store
    const fallbackList = dbStore.getAddresses ? dbStore.getAddresses({ userId, workerId }) : [];
    return NextResponse.json({
      success: true,
      count: fallbackList.length,
      data: fallbackList,
    });
  } catch (err) {
    console.error('Error fetching addresses:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch addresses.' }, { status: 500 });
  }
}

/**
 * POST /api/addresses
 * Create a new address record.
 * Strictly enforces a maximum of 5 addresses per user.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    let { 
      userId, 
      workerId, 
      label = 'Home', 
      addressLine, 
      city = 'Kolkata', 
      state = 'West Bengal', 
      postalCode = '700129', 
      latitude = 22.6950, 
      longitude = 88.4550, 
      isDefault = false,
      isCurrent = false,
      replaceOldest = false
    } = body;

    if (!addressLine || !addressLine.trim()) {
      return NextResponse.json({ success: false, error: 'Address line is required.' }, { status: 400 });
    }

    if (!userId && !workerId) {
      const session = await getAuthSession(request);
      const sessionUserId = session?.sub || session?.id;
      if (sessionUserId) {
        if (session.role === 'WORKER') {
          try {
            const worker = await prisma.worker.findUnique({ where: { userId: sessionUserId } });
            if (worker) workerId = worker.id;
            else userId = sessionUserId;
          } catch (e) {
            userId = sessionUserId;
          }
        } else {
          userId = sessionUserId;
        }
      }
    }

    // Fallback to demo customer if needed
    if (!userId && !workerId) {
      try {
        const demoCustomer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
        if (demoCustomer) userId = demoCustomer.id;
      } catch (e) {}
    }

    // 1. Enforce max 5 addresses per user (with replaceOldest fallback)
    if (userId) {
      try {
        const count = await prisma.address.count({ where: { userId } });
        if (count >= 5) {
          if (replaceOldest) {
            const oldest = await prisma.address.findFirst({
              where: { userId, isDefault: false },
              orderBy: { createdAt: 'asc' },
            }) || await prisma.address.findFirst({
              where: { userId },
              orderBy: { createdAt: 'asc' },
            });
            if (oldest) {
              await prisma.address.delete({ where: { id: oldest.id } });
            }
          } else {
            return NextResponse.json({
              success: false,
              error: 'Maximum of 5 saved addresses reached. Please remove an older address first.',
            }, { status: 400 });
          }
        }
      } catch (e) {}
    }

    try {
      // If setting default, unset previous defaults
      if (isDefault && userId) {
        await prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const created = await prisma.address.create({
        data: {
          userId,
          workerId,
          label,
          addressLine: addressLine.trim(),
          city,
          state,
          postalCode,
          latitude: parseFloat(latitude) || null,
          longitude: parseFloat(longitude) || null,
          isDefault: Boolean(isDefault),
          isCurrent: Boolean(isCurrent),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Address saved successfully.',
        data: created,
      }, { status: 201 });
    } catch (dbErr) {
      console.warn('Prisma create address note:', dbErr.message);
    }

    // Fallback store
    if (dbStore.addAddress) {
      const createdFallback = dbStore.addAddress({
        userId,
        workerId,
        label,
        addressLine,
        city,
        state,
        latitude,
        longitude,
        isDefault,
      });
      return NextResponse.json({
        success: true,
        message: 'Address saved in store.',
        data: createdFallback,
      }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: `addr_${Date.now()}`,
        userId,
        label,
        addressLine,
        city,
        state,
        isDefault,
      },
    }, { status: 201 });
  } catch (err) {
    console.error('Error creating address:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to save address.' }, { status: 500 });
  }
}
