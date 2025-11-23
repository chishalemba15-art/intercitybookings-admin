import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { buses } from '@/db/schema';
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

    const busId = parseInt(params.id);
    const body = await request.json();
    const {
      operatorId,
      routeId,
      departureTime,
      arrivalTime,
      price,
      type,
      totalSeats,
      availableSeats,
      features,
      operatesOn,
      isActive,
    } = body;

    const [updatedBus] = await db
      .update(buses)
      .set({
        operatorId,
        routeId,
        departureTime,
        arrivalTime,
        price: price || undefined,
        type,
        totalSeats,
        availableSeats,
        features: features ? JSON.stringify(features) : null,
        operatesOn: operatesOn ? JSON.stringify(operatesOn) : null,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(buses.id, busId))
      .returning();

    return NextResponse.json(updatedBus);
  } catch (error) {
    console.error('Error updating bus:', error);
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

    const busId = parseInt(params.id);

    await db.delete(buses).where(eq(buses.id, busId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bus:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
