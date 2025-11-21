import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { routes } from '@/db/schema';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allRoutes = await db
      .select({
        id: routes.id,
        fromCity: routes.fromCity,
        toCity: routes.toCity,
        distance: routes.distance,
        estimatedDuration: routes.estimatedDuration,
        isActive: routes.isActive,
        createdAt: routes.createdAt,
      })
      .from(routes);

    return NextResponse.json(allRoutes);
  } catch (error) {
    console.error('Error fetching routes:', error);
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
    const { fromCity, toCity, distance, estimatedDuration } = body;

    if (!fromCity || !toCity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newRoute] = await db
      .insert(routes)
      .values({
        fromCity,
        toCity,
        distance: distance ? parseInt(distance) : null,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
        isActive: true,
      })
      .returning();

    return NextResponse.json(newRoute, { status: 201 });
  } catch (error) {
    console.error('Error creating route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
