import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = parseInt(params.id);
    const body = await request.json();
    const {
      busId,
      bookingRef,
      passengerName,
      passengerPhone,
      passengerEmail,
      seatNumber,
      travelDate,
      status,
      totalAmount,
      specialRequests,
    } = body;

    const [updatedBooking] = await db
      .update(bookings)
      .set({
        busId,
        bookingRef,
        passengerName,
        passengerPhone,
        passengerEmail: passengerEmail || null,
        seatNumber,
        travelDate: new Date(travelDate),
        status,
        totalAmount: parseFloat(totalAmount),
        specialRequests: specialRequests || null,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = parseInt(params.id);

    await db.delete(bookings).where(eq(bookings.id, bookingId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
