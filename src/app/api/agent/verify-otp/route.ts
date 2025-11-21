import { NextResponse } from 'next/server';

// Simulated OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, otp } = body;

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP required' },
        { status: 400 }
      );
    }

    const storedOTP = otpStore.get(phoneNumber);

    // In test mode: allow any 6-digit OTP (for development)
    if (!storedOTP) {
      // Allow test OTPs (6 digits)
      if (!/^\d{6}$/.test(otp)) {
        return NextResponse.json(
          { error: 'Invalid OTP format. Must be 6 digits.' },
          { status: 400 }
        );
      }
      console.log(`[TEST MODE] Accepting OTP ${otp} for ${phoneNumber}`);
    } else {
      if (storedOTP.expiresAt < Date.now()) {
        otpStore.delete(phoneNumber);
        return NextResponse.json(
          { error: 'OTP expired. Please register again.' },
          { status: 400 }
        );
      }

      if (storedOTP.code !== otp) {
        return NextResponse.json(
          { error: 'Invalid OTP' },
          { status: 400 }
        );
      }
    }

    // OTP verified - remove from store
    otpStore.delete(phoneNumber);

    // In production, you would:
    // 1. Set a session/JWT token
    // 2. Send SMS confirmation to agent
    // 3. Log verification timestamp

    return NextResponse.json({
      message: 'OTP verified successfully',
      phoneNumber,
      verified: true,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
