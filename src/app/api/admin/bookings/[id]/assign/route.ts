import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  bookings,
  bookingAssignmentHistory,
  agentNotifications,
  buses,
  operators,
  routes,
  agents,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { smsService } from '@/lib/sms';
import { settingsService } from '@/lib/settings';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = parseInt(params.id);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const body = await request.json();
    const { agentId, adminUserId, notes } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    // Get booking details
    const bookingData = await db
      .select({
        id: bookings.id,
        bookingRef: bookings.bookingRef,
        passengerName: bookings.passengerName,
        passengerPhone: bookings.passengerPhone,
        travelDate: bookings.travelDate,
        busId: bookings.busId,
      })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!bookingData || bookingData.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookingData[0];

    // Get bus and route info for notification
    const busData = await db
      .select({
        fromCity: routes.fromCity,
        toCity: routes.toCity,
        departureTime: buses.departureTime,
      })
      .from(buses)
      .leftJoin(routes, eq(buses.routeId, routes.id))
      .where(eq(buses.id, booking.busId))
      .limit(1);

    const busInfo = busData[0];

    // Get agent details
    const agentData = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agentData || agentData.length === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const agent = agentData[0];

    // Get timeout setting
    const timeoutMinutes = await settingsService.getSetting(
      'assignmentResponseTimeoutMinutes'
    );
    const responseDeadline = new Date(
      Date.now() + (timeoutMinutes || 30) * 60 * 1000
    );

    // Update booking with assignment
    await db
      .update(bookings)
      .set({
        assignedAgentId: agentId,
        assignedAt: new Date(),
        agentNotes: notes || null,
        status: 'assigned',
        assignmentStatus: 'pending',
        assignmentResponseDeadline: responseDeadline,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // Create assignment history record
    await db.insert(bookingAssignmentHistory).values({
      bookingId,
      agentId,
      assignedBy: adminUserId,
      assignmentStatus: 'pending',
      notificationSent: false,
    });

    // Create agent notification
    const notificationTitle = 'New Booking Assigned!';
    const notificationMessage = `You have been assigned booking ${booking.bookingRef} for ${booking.passengerName}. Please respond within ${timeoutMinutes} minutes.`;

    await db.insert(agentNotifications).values({
      agentId,
      notificationType: 'booking_assigned',
      bookingId,
      title: notificationTitle,
      message: notificationMessage,
      actionUrl: `/agent/bookings/${bookingId}`,
      isRead: false,
      smsSent: false,
    });

    // Send SMS notification to agent
    const smsEnabled = await settingsService.getSetting('enableSmsNotifications');

    if (smsEnabled) {
      const route = `${busInfo?.fromCity || 'N/A'} → ${busInfo?.toCity || 'N/A'}`;
      const travelDate = new Date(booking.travelDate).toLocaleDateString('en-ZM');

      const smsResult = await smsService.sendBookingAssignmentSMS(
        agent.phoneNumber,
        booking.bookingRef,
        booking.passengerName,
        booking.passengerPhone,
        route,
        travelDate
      );

      if (smsResult.success) {
        // Update notification as SMS sent
        await db
          .update(agentNotifications)
          .set({
            smsSent: true,
            smsSentAt: new Date(),
            smsDeliveryStatus: 'sent',
          })
          .where(
            eq(agentNotifications.bookingId, bookingId)
          );

        // Update assignment history
        await db
          .update(bookingAssignmentHistory)
          .set({ notificationSent: true })
          .where(
            eq(bookingAssignmentHistory.bookingId, bookingId)
          );
      }
    }

    console.log(
      `[ASSIGNMENT] Booking ${bookingId} assigned to agent ${agentId}`
    );

    return NextResponse.json({
      message: 'Booking assigned successfully',
      assignment: {
        bookingId,
        agentId,
        agentName: `${agent.firstName} ${agent.lastName}`,
        agentPhone: agent.phoneNumber,
        responseDeadline,
      },
    });
  } catch (error) {
    console.error('Error assigning booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
