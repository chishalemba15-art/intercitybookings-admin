import { db } from '@/lib/db';
import { agents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Simulated OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateReferralCode(): string {
  return 'AG' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      phoneNumber,
      firstName,
      lastName,
      email,
      idType,
      idNumber,
      locationCity,
      locationAddress,
      referralCode: incomingReferralCode,
    } = body;

    // Validation
    if (!phoneNumber || !firstName || !lastName || !idType || !idNumber || !locationCity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const existingPhone = await db
      .select()
      .from(agents)
      .where(eq(agents.phoneNumber, phoneNumber));

    if (existingPhone.length > 0) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 400 }
      );
    }

    // Check if ID number already exists
    const existingId = await db
      .select()
      .from(agents)
      .where(eq(agents.idNumber, idNumber));

    if (existingId.length > 0) {
      return NextResponse.json(
        { error: 'ID number already registered' },
        { status: 400 }
      );
    }

    // Create agent with pending_review status
    const agent = await db
      .insert(agents)
      .values({
        phoneNumber,
        firstName,
        lastName,
        email: email || null,
        idType: idType as any,
        idNumber,
        locationCity,
        locationAddress: locationAddress || null,
        referralCode: incomingReferralCode || generateReferralCode(),
        status: 'pending_review',
      })
      .returning();

    if (!agent || agent.length === 0) {
      throw new Error('Failed to create agent');
    }

    // Generate and store OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(phoneNumber, { code: otp, expiresAt });

    // For testing: Return OTP directly instead of sending via SMS
    console.log(`[TEST MODE] OTP for ${phoneNumber}: ${otp}`);

    return NextResponse.json({
      message: 'Agent registered successfully. Use OTP below for testing (SMS disabled).',
      agentId: agent[0].id,
      phoneNumber: agent[0].phoneNumber,
      testOTP: otp, // Only in development/test mode
      testMessage: 'This OTP is returned directly for testing. In production, it will be sent via SMS.',
    });
  } catch (error) {
    console.error('Error registering agent:', error);
    return NextResponse.json(
      { error: 'Failed to register agent' },
      { status: 500 }
    );
  }
}
