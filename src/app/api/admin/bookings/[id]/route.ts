import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  bookings,
  buses,
  operators,
  routes,
  agents,
  agentOperatorAssignments,
  payments,
  bookingAssignmentHistory,
} from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

export async function GET(
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

    // Get booking details with related data
    const bookingData = await db
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
        assignedAgentId: bookings.assignedAgentId,
        assignedAt: bookings.assignedAt,
        agentNotes: bookings.agentNotes,
        assignmentStatus: bookings.assignmentStatus,
        assignmentResponseDeadline: bookings.assignmentResponseDeadline,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        // Bus info
        departureTime: buses.departureTime,
        arrivalTime: buses.arrivalTime,
        busType: buses.type,
        busPrice: buses.price,
        // Operator info
        operatorId: operators.id,
        operatorName: operators.name,
        operatorLogo: operators.logo,
        operatorPhone: operators.phone,
        operatorEmail: operators.email,
        // Route info
        fromCity: routes.fromCity,
        toCity: routes.toCity,
        distance: routes.distance,
        estimatedDuration: routes.estimatedDuration,
      })
      .from(bookings)
      .leftJoin(buses, eq(bookings.busId, buses.id))
      .leftJoin(operators, eq(buses.operatorId, operators.id))
      .leftJoin(routes, eq(buses.routeId, routes.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!bookingData || bookingData.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookingData[0];

    // Get payment information
    const paymentData = await db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, bookingId))
      .limit(1);

    // Get available agents for this operator (with error handling)
    // Agents can be: 1) tied to this operator or 2) independent agents assigned to this operator
    let availableAgents: any[] = [];
    try {
      if (booking.operatorId) {
        availableAgents = await db
          .select({
            id: agents.id,
            phoneNumber: agents.phoneNumber,
            firstName: agents.firstName,
            lastName: agents.lastName,
            email: agents.email,
            locationCity: agents.locationCity,
            agentType: agents.agentType,
            isOnline: agents.isOnline,
            lastActiveAt: agents.lastActiveAt,
            status: agents.status,
          })
          .from(agents)
          .leftJoin(
            agentOperatorAssignments,
            eq(agents.id, agentOperatorAssignments.agentId)
          )
          .where(
            and(
              eq(agents.status, 'approved'),
              or(
                eq(agents.primaryOperatorId, booking.operatorId),
                and(
                  eq(agentOperatorAssignments.operatorId, booking.operatorId),
                  eq(agentOperatorAssignments.isActive, true)
                )
              )
            )
          );
      }
    } catch (error) {
      console.error('Error fetching available agents:', error);
      // Continue without agents if query fails
    }

    // Get assignment history for this booking (with error handling)
    let assignmentHistory: any[] = [];
    try {
      assignmentHistory = await db
        .select({
          id: bookingAssignmentHistory.id,
          agentId: bookingAssignmentHistory.agentId,
          agentName: agents.firstName,
          agentLastName: agents.lastName,
          assignmentStatus: bookingAssignmentHistory.assignmentStatus,
          responseTime: bookingAssignmentHistory.responseTime,
          rejectionReason: bookingAssignmentHistory.rejectionReason,
          escalated: bookingAssignmentHistory.escalated,
          escalatedAt: bookingAssignmentHistory.escalatedAt,
          createdAt: bookingAssignmentHistory.createdAt,
        })
        .from(bookingAssignmentHistory)
        .leftJoin(agents, eq(bookingAssignmentHistory.agentId, agents.id))
        .where(eq(bookingAssignmentHistory.bookingId, bookingId));
    } catch (error) {
      console.error('Error fetching assignment history:', error);
      // Continue without history if query fails
    }

    // Get currently assigned agent details if any (with error handling)
    let assignedAgent: any = null;
    try {
      if (booking.assignedAgentId) {
        const agentData = await db
          .select()
          .from(agents)
          .where(eq(agents.id, booking.assignedAgentId))
          .limit(1);

        if (agentData.length > 0) {
          assignedAgent = agentData[0];
        }
      }
    } catch (error) {
      console.error('Error fetching assigned agent:', error);
      // Continue without assigned agent if query fails
    }

    return NextResponse.json({
      booking: {
        ...booking,
        payment: paymentData.length > 0 ? paymentData[0] : null,
        assignedAgent,
      },
      availableAgents: availableAgents || [],
      assignmentHistory: assignmentHistory || [],
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    console.error('Error details:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
