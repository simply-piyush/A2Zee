import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dbStore } from '@/lib/dbStore';

/**
 * DELETE /api/addresses/[id]
 * Deletes an address by ID
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Address ID is required.' }, { status: 400 });
    }

    try {
      await prisma.address.delete({
        where: { id },
      });
      return NextResponse.json({
        success: true,
        message: 'Address deleted successfully.',
      });
    } catch (dbErr) {
      console.warn('Prisma delete address note:', dbErr.message);
    }

    if (dbStore.deleteAddress) {
      dbStore.deleteAddress(id);
    }

    return NextResponse.json({
      success: true,
      message: 'Address deleted.',
    });
  } catch (err) {
    console.error('Error deleting address:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete address.' }, { status: 500 });
  }
}

/**
 * PATCH /api/addresses/[id]
 * Updates an address (e.g. set as default, update label or coords)
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    try {
      const existing = await prisma.address.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Address not found.' }, { status: 404 });
      }

      if (body.isDefault && existing.userId) {
        await prisma.address.updateMany({
          where: { userId: existing.userId },
          data: { isDefault: false },
        });
      }

      const updated = await prisma.address.update({
        where: { id },
        data: {
          label: body.label ?? existing.label,
          addressLine: body.addressLine ? body.addressLine.trim() : existing.addressLine,
          city: body.city ?? existing.city,
          state: body.state ?? existing.state,
          postalCode: body.postalCode ?? existing.postalCode,
          latitude: body.latitude !== undefined ? parseFloat(body.latitude) : existing.latitude,
          longitude: body.longitude !== undefined ? parseFloat(body.longitude) : existing.longitude,
          isDefault: body.isDefault !== undefined ? Boolean(body.isDefault) : existing.isDefault,
          isCurrent: body.isCurrent !== undefined ? Boolean(body.isCurrent) : existing.isCurrent,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Address updated successfully.',
        data: updated,
      });
    } catch (dbErr) {
      console.warn('Prisma update address note:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      data: { id, ...body },
    });
  } catch (err) {
    console.error('Error updating address:', err);
    return NextResponse.json({ success: false, error: 'Failed to update address.' }, { status: 500 });
  }
}
