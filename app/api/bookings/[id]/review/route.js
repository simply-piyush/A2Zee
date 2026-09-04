import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/bookings/[id]/review
 * Mapped to schema.prisma Review model
 * Creates review for completed booking and recalculates Worker.averageRating
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { rating, comment } = body;

    const ratingInt = parseInt(rating, 10);
    if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
      return NextResponse.json({
        success: false,
        error: 'Rating must be an integer between 1 and 5.',
      }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { review: true },
    });

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found.',
      }, { status: 404 });
    }

    // Upsert review for this booking
    const review = await prisma.review.upsert({
      where: { bookingId: id },
      update: {
        rating: ratingInt,
        comment: comment || null,
      },
      create: {
        bookingId: id,
        rating: ratingInt,
        comment: comment || null,
      },
    });

    // Recalculate Worker average rating across all their completed reviews
    if (booking.workerId) {
      const allWorkerReviews = await prisma.review.findMany({
        where: {
          booking: { workerId: booking.workerId },
        },
        select: { rating: true },
      });

      if (allWorkerReviews.length > 0) {
        const sum = allWorkerReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = Math.round((sum / allWorkerReviews.length) * 100) / 100;

        await prisma.worker.update({
          where: { id: booking.workerId },
          data: { averageRating: avg },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully.',
      data: review,
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
