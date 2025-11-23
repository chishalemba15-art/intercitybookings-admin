import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { operators } from '@/db/schema';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allOperators = await db
      .select({
        id: operators.id,
        name: operators.name,
        slug: operators.slug,
        description: operators.description,
        logo: operators.logo,
        color: operators.color,
        rating: operators.rating,
        phone: operators.phone,
        email: operators.email,
        isActive: operators.isActive,
        createdAt: operators.createdAt,
        updatedAt: operators.updatedAt,
      })
      .from(operators);

    return NextResponse.json(allOperators);
  } catch (error) {
    console.error('Error fetching operators:', error);
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
    const { name, slug, description, logo, color, rating, phone, email } =
      body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newOperator] = await db
      .insert(operators)
      .values({
        name,
        slug,
        description: description || null,
        logo: logo || null,
        color: color || 'bg-blue-600',
        rating: rating || null,
        phone: phone || null,
        email: email || null,
        isActive: true,
      })
      .returning();

    return NextResponse.json(newOperator, { status: 201 });
  } catch (error) {
    console.error('Error creating operator:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
