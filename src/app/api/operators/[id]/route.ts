import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { operators } from '@/db/schema';
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

    const operatorId = parseInt(params.id);
    const body = await request.json();
    const { name, slug, description, logo, color, rating, phone, email, isActive } =
      body;

    const [updatedOperator] = await db
      .update(operators)
      .set({
        name,
        slug,
        description: description || null,
        logo: logo || null,
        color: color || 'bg-blue-600',
        rating: rating || null,
        phone: phone || null,
        email: email || null,
        isActive,
      })
      .where(eq(operators.id, operatorId))
      .returning();

    return NextResponse.json(updatedOperator);
  } catch (error) {
    console.error('Error updating operator:', error);
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

    const operatorId = parseInt(params.id);

    await db.delete(operators).where(eq(operators.id, operatorId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting operator:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
