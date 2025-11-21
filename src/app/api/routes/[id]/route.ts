import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { routes } from '@/db/schema';
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

    const routeId = parseInt(params.id);
    const body = await request.json();
    const { fromCity, toCity, distance, estimatedDuration, isActive } = body;

    const [updatedRoute] = await db
      .update(routes)
      .set({
        fromCity,
        toCity,
        distance,
        estimatedDuration,
        isActive,
      })
      .where(eq(routes.id, routeId))
      .returning();

    return NextResponse.json(updatedRoute);
  } catch (error) {
    console.error('Error updating route:', error);
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

    const routeId = parseInt(params.id);

    await db.delete(routes).where(eq(routes.id, routeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
