import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { buses, operators, routes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allBuses = await db
      .select({
        id: buses.id,
        operatorId: buses.operatorId,
        routeId: buses.routeId,
        departureTime: buses.departureTime,
        arrivalTime: buses.arrivalTime,
        price: buses.price,
        type: buses.type,
        totalSeats: buses.totalSeats,
        availableSeats: buses.availableSeats,
        features: buses.features,
        isActive: buses.isActive,
        operatesOn: buses.operatesOn,
        createdAt: buses.createdAt,
        updatedAt: buses.updatedAt,
        operatorName: operators.name,
        route: routes.fromCity,
        toCity: routes.toCity,
      })
      .from(buses)
      .leftJoin(operators, eq(buses.operatorId, operators.id))
      .leftJoin(routes, eq(buses.routeId, routes.id));

    return NextResponse.json(allBuses);
  } catch (error) {
    console.error('Error fetching buses:', error);
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
    } = body;

    // Validate required fields
    if (!operatorId || !routeId || !departureTime || !type || !totalSeats) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newBus] = await db
      .insert(buses)
      .values({
        operatorId,
        routeId,
        departureTime,
        arrivalTime,
        price: price || '0',
        type,
        totalSeats,
        availableSeats: availableSeats ?? totalSeats,
        features: features ? JSON.stringify(features) : null,
        operatesOn: operatesOn ? JSON.stringify(operatesOn) : null,
        isActive: true,
      })
      .returning();

    return NextResponse.json(newBus, { status: 201 });
  } catch (error) {
    console.error('Error creating bus:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
