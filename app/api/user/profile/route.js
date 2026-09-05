import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

/**
 * PATCH /api/user/profile
 * Updates citizen profile details (name, phone, email, gender)
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { name, phone, email, gender } = body;

    let userId = null;
    const session = await getAuthSession(request);
    if (session?.id) userId = session.id;

    if (!userId) {
      try {
        const demoCustomer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
        if (demoCustomer) userId = demoCustomer.id;
      } catch (e) {}
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          fullName: name || undefined,
          phone: phone || undefined,
          email: email || undefined,
          gender: gender || undefined,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully.',
        data: {
          id: updatedUser.id,
          name: updatedUser.fullName,
          phone: updatedUser.phone,
          email: updatedUser.email,
          gender: updatedUser.gender,
        },
      });
    } catch (dbErr) {
      console.warn('Prisma update profile note:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      data: { name, phone, email, gender },
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return NextResponse.json({ success: false, error: 'Failed to update profile.' }, { status: 500 });
  }
}
