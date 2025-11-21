import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { bookings, buses, operators, routes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allBookings = await db
      .select({
        id: bookings.id,
        busId: bookings.busId,
        bookingRef: bookings.bookingRef,
        passengerName: bookings.passengerName,
        passengerPhone: bookings.passengerPhone,
        passengerEmail: bookings.passengerEmail,
        seatNumber: bookings.seatNumber,
        travelDate: bookings.travelDate,
        status: bookings.status,
        totalAmount: bookings.totalAmount,
        specialRequests: bookings.specialRequests,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        operatorName: operators.name,
        departureTime: buses.departureTime,
        arrivalTime: buses.arrivalTime,
        fromCity: routes.fromCity,
        toCity: routes.toCity,
      })
      .from(bookings)
      .leftJoin(buses, eq(bookings.busId, buses.id))
      .leftJoin(operators, eq(buses.operatorId, operators.id))
      .leftJoin(routes, eq(buses.routeId, routes.id));

    return NextResponse.json(
      allBookings.map((b: any) => ({
        ...b,
        busInfo: {
          operatorName: b.operatorName,
          departureTime: b.departureTime,
          arrivalTime: b.arrivalTime,
          fromCity: b.fromCity,
          toCity: b.toCity,
        },
      }))
    );
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    if (!busId || !bookingRef || !passengerName || !passengerPhone || !seatNumber || !travelDate || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newBooking] = await db
      .insert(bookings)
      .values({
        busId,
        bookingRef,
        passengerName,
        passengerPhone,
        passengerEmail: passengerEmail || null,
        seatNumber,
        travelDate: new Date(travelDate),
        status: status || 'pending',
        totalAmount: parseFloat(totalAmount),
        specialRequests: specialRequests || null,
      })
      .returning();

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
