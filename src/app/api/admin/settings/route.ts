import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { settingsService } from '@/lib/settings';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await settingsService.getAllSettings();

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { settings, adminUserId } = body;

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings object required' },
        { status: 400 }
      );
    }

    const success = await settingsService.updateMultipleSettings(
      settings,
      adminUserId
    );

    if (success) {
      return NextResponse.json({
        message: 'Settings updated successfully',
        settings: await settingsService.getAllSettings(),
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
