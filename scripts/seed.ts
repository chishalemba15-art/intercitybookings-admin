import dotenv from 'dotenv';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { hash } from 'bcryptjs';
import * as schema from '../src/db/schema';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql as any, { schema });

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // 1. Create Bus Operators
    console.log('📝 Creating bus operators...');
    await db
      .insert(schema.operators)
      .values([
        {
          name: 'Juldan Motors',
          slug: 'juldan-motors',
          description: 'Premium luxury bus service across Southern Africa',
          logo: 'https://via.placeholder.com/200x100?text=Juldan',
          color: 'bg-blue-600',
          rating: 4.8,
          phone: '+260211123456',
          email: 'info@juldan.zm',
          isActive: true,
        },
        {
          name: 'Mazhandu Coaches',
          slug: 'mazhandu-coaches',
          description: 'Affordable and reliable intercity bus service',
          logo: 'https://via.placeholder.com/200x100?text=Mazhandu',
          color: 'bg-red-600',
          rating: 4.5,
          phone: '+260211234567',
          email: 'booking@mazhandu.zm',
          isActive: true,
        },
        {
          name: 'Zambian Eagle Coaches',
          slug: 'zambian-eagle',
          description: 'Fast and comfortable long-distance travel',
          logo: 'https://via.placeholder.com/200x100?text=ZE+Coaches',
          color: 'bg-yellow-600',
          rating: 4.6,
          phone: '+260211345678',
          email: 'contact@zeagle.zm',
          isActive: true,
        },
        {
          name: 'City Cruiser Express',
          slug: 'city-cruiser',
          description: 'Budget-friendly intercity transportation',
          logo: 'https://via.placeholder.com/200x100?text=City+Cruiser',
          color: 'bg-green-600',
          rating: 4.3,
          phone: '+260211456789',
          email: 'info@citycruiser.zm',
          isActive: true,
        },
      ])
      .onConflictDoNothing();

    // 2. Create Routes (Zambian intercity routes)
    console.log('🗺️ Creating routes...');
    const routes = [
      {
        fromCity: 'Lusaka',
        toCity: 'Kitwe',
        distance: 456,
        estimatedDuration: 480, // 8 hours
      },
      {
        fromCity: 'Lusaka',
        toCity: 'Ndola',
        distance: 434,
        estimatedDuration: 450, // 7.5 hours
      },
      {
        fromCity: 'Lusaka',
        toCity: 'Livingstone',
        distance: 460,
        estimatedDuration: 480, // 8 hours
      },
      {
        fromCity: 'Lusaka',
        toCity: 'Chipata',
        distance: 520,
        estimatedDuration: 540, // 9 hours
      },
      {
        fromCity: 'Lusaka',
        toCity: 'Kabwe',
        distance: 145,
        estimatedDuration: 120, // 2 hours
      },
      {
        fromCity: 'Lusaka',
        toCity: 'Chingola',
        distance: 490,
        estimatedDuration: 510, // 8.5 hours
      },
      {
        fromCity: 'Kitwe',
        toCity: 'Ndola',
        distance: 50,
        estimatedDuration: 60, // 1 hour
      },
      {
        fromCity: 'Livingstone',
        toCity: 'Kazungula',
        distance: 65,
        estimatedDuration: 90, // 1.5 hours
      },
      {
        fromCity: 'Lusaka',
        toCity: 'Kasama',
        distance: 610,
        estimatedDuration: 630, // 10.5 hours
      },
      {
        fromCity: 'Lusaka',
        toCity: 'Mansa',
        distance: 580,
        estimatedDuration: 600, // 10 hours
      },
    ];

    await db.insert(schema.routes).values(routes).onConflictDoNothing();

    // Get the routes to reference them
    const allRoutes = await db.select().from(schema.routes);

    // Get operators
    const allOperators = await db.select().from(schema.operators);

    // 3. Create Bus Schedules
    console.log('🚌 Creating bus schedules...');
    const busesData = [
      {
        operatorId: allOperators[0].id,
        routeId: allRoutes[0].id,
        departureTime: '06:00',
        arrivalTime: '14:00',
        price: 850,
        type: 'luxury' as const,
        totalSeats: 32,
        availableSeats: 28,
        features: JSON.stringify(['WiFi', 'AC', 'Toilet', 'Drinks Service']),
        operatesOn: JSON.stringify([1, 2, 3, 4, 5, 6]), // Daily
      },
      {
        operatorId: allOperators[0].id,
        routeId: allRoutes[0].id,
        departureTime: '14:00',
        arrivalTime: '22:00',
        price: 850,
        type: 'luxury' as const,
        totalSeats: 32,
        availableSeats: 15,
        features: JSON.stringify(['WiFi', 'AC', 'Toilet', 'Drinks Service']),
        operatesOn: JSON.stringify([1, 2, 3, 4, 5, 6]),
      },
      {
        operatorId: allOperators[1].id,
        routeId: allRoutes[0].id,
        departureTime: '07:30',
        arrivalTime: '15:30',
        price: 650,
        type: 'standard' as const,
        totalSeats: 52,
        availableSeats: 40,
        features: JSON.stringify(['AC', 'Toilet']),
        operatesOn: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
      },
      {
        operatorId: allOperators[2].id,
        routeId: allRoutes[1].id,
        departureTime: '05:30',
        arrivalTime: '13:00',
        price: 750,
        type: 'luxury' as const,
        totalSeats: 40,
        availableSeats: 32,
        features: JSON.stringify(['WiFi', 'AC', 'Toilet', 'Snacks']),
        operatesOn: JSON.stringify([1, 2, 3, 4, 5, 6]),
      },
      {
        operatorId: allOperators[1].id,
        routeId: allRoutes[1].id,
        departureTime: '08:00',
        arrivalTime: '15:30',
        price: 580,
        type: 'standard' as const,
        totalSeats: 52,
        availableSeats: 22,
        features: JSON.stringify(['AC', 'Toilet']),
        operatesOn: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
      },
      {
        operatorId: allOperators[3].id,
        routeId: allRoutes[2].id,
        departureTime: '06:00',
        arrivalTime: '14:00',
        price: 620,
        type: 'standard' as const,
        totalSeats: 48,
        availableSeats: 38,
        features: JSON.stringify(['AC', 'Toilet']),
        operatesOn: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
      },
      {
        operatorId: allOperators[0].id,
        routeId: allRoutes[2].id,
        departureTime: '15:00',
        arrivalTime: '23:00',
        price: 900,
        type: 'luxury' as const,
        totalSeats: 32,
        availableSeats: 25,
        features: JSON.stringify(['WiFi', 'AC', 'Toilet', 'Drinks Service', 'USB Charging']),
        operatesOn: JSON.stringify([1, 3, 5, 6]),
      },
      {
        operatorId: allOperators[2].id,
        routeId: allRoutes[4].id,
        departureTime: '07:00',
        arrivalTime: '09:00',
        price: 250,
        type: 'standard' as const,
        totalSeats: 60,
        availableSeats: 45,
        features: JSON.stringify(['AC']),
        operatesOn: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
      },
      {
        operatorId: allOperators[1].id,
        routeId: allRoutes[4].id,
        departureTime: '14:00',
        arrivalTime: '16:00',
        price: 240,
        type: 'standard' as const,
        totalSeats: 56,
        availableSeats: 35,
        features: JSON.stringify(['AC']),
        operatesOn: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
      },
      {
        operatorId: allOperators[3].id,
        routeId: allRoutes[3].id,
        departureTime: '18:00',
        arrivalTime: '03:00',
        price: 700,
        type: 'standard' as const,
        totalSeats: 48,
        availableSeats: 28,
        features: JSON.stringify(['AC', 'Toilet']),
        operatesOn: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
      },
    ];

    await db.insert(schema.buses).values(busesData).onConflictDoNothing();

    // Get buses
    const allBuses = await db.select().from(schema.buses);

    // 4. Create Sample Bookings
    console.log('📅 Creating sample bookings...');
    const bookings = [
      {
        busId: allBuses[0].id,
        bookingRef: 'ICB202411001',
        passengerName: 'John Mwale',
        passengerPhone: '+260971234567',
        passengerEmail: 'john.mwale@email.com',
        seatNumber: 'A1',
        travelDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: 'confirmed' as const,
        totalAmount: 850,
        specialRequests: 'Window seat preferred',
      },
      {
        busId: allBuses[0].id,
        bookingRef: 'ICB202411002',
        passengerName: 'Mary Chipenge',
        passengerPhone: '+260972345678',
        passengerEmail: 'mary.chipenge@email.com',
        seatNumber: 'A2',
        travelDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
        status: 'confirmed' as const,
        totalAmount: 850,
        specialRequests: null,
      },
      {
        busId: allBuses[2].id,
        bookingRef: 'ICB202411003',
        passengerName: 'Chanda Zambia',
        passengerPhone: '+260973456789',
        passengerEmail: 'chanda.z@email.com',
        seatNumber: 'B5',
        travelDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'confirmed' as const,
        totalAmount: 650,
        specialRequests: 'Aisle seat',
      },
      {
        busId: allBuses[1].id,
        bookingRef: 'ICB202411004',
        passengerName: 'Ibrahim Hassan',
        passengerPhone: '+260974567890',
        passengerEmail: 'ibrahim.h@email.com',
        seatNumber: 'C3',
        travelDate: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000),
        status: 'pending' as const,
        totalAmount: 850,
        specialRequests: null,
      },
      {
        busId: allBuses[3].id,
        bookingRef: 'ICB202411005',
        passengerName: 'Precious Banda',
        passengerPhone: '+260975678901',
        passengerEmail: 'precious.banda@email.com',
        seatNumber: 'D7',
        travelDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
        status: 'completed' as const,
        totalAmount: 750,
        specialRequests: 'Accessible seating',
      },
    ];

    await db.insert(schema.bookings).values(bookings).onConflictDoNothing();

    // Get bookings
    const allBookings = await db.select().from(schema.bookings);

    // 5. Create Sample Payments
    console.log('💳 Creating sample payments...');
    const payments = [
      {
        bookingId: allBookings[0].id,
        amount: 850,
        paymentMethod: 'airtel_money' as const,
        paymentStatus: 'completed' as const,
        transactionRef: 'ATL202411001',
        phoneNumber: '+260971234567',
        processedAt: new Date(),
      },
      {
        bookingId: allBookings[1].id,
        amount: 850,
        paymentMethod: 'mtn_momo' as const,
        paymentStatus: 'completed' as const,
        transactionRef: 'MTN202411001',
        phoneNumber: '+260972345678',
        processedAt: new Date(),
      },
      {
        bookingId: allBookings[2].id,
        amount: 650,
        paymentMethod: 'airtel_money' as const,
        paymentStatus: 'completed' as const,
        transactionRef: 'ATL202411002',
        phoneNumber: '+260973456789',
        processedAt: new Date(),
      },
      {
        bookingId: allBookings[3].id,
        amount: 850,
        paymentMethod: 'mtn_momo' as const,
        paymentStatus: 'pending' as const,
        transactionRef: 'MTN202411002',
        phoneNumber: '+260974567890',
        processedAt: null,
      },
    ];

    await db.insert(schema.payments).values(payments).onConflictDoNothing();

    // 6. Create Admin User
    console.log('👤 Creating admin user...');
    const adminPassword = await hash('admin123', 10);
    await db
      .insert(schema.adminUsers)
      .values({
        email: 'admin@intercity.zm',
        passwordHash: adminPassword,
        name: 'System Administrator',
        role: 'super_admin',
        isActive: true,
        lastLogin: null,
      })
      .onConflictDoNothing();

    // 7. Create Search Analytics
    console.log('🔍 Creating search analytics...');
    const now = new Date();
    const searchAnalytics = [
      {
        searchQuery: 'Lusaka to Kitwe',
        destination: 'Kitwe',
        travelDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        resultsCount: 3,
        userPhone: '+260971234567',
        sessionId: 'sess-001-kajsdhf',
        ipAddress: '192.168.1.100',
      },
      {
        searchQuery: 'Lusaka Livingstone',
        destination: 'Livingstone',
        travelDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        resultsCount: 2,
        userPhone: '+260972345678',
        sessionId: 'sess-002-lkasjdf',
        ipAddress: '192.168.1.101',
      },
      {
        searchQuery: 'Lusaka to Ndola buses',
        destination: 'Ndola',
        travelDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        resultsCount: 4,
        userPhone: '+260973456789',
        sessionId: 'sess-003-mnbvcxz',
        ipAddress: '192.168.1.102',
      },
      {
        searchQuery: 'Lusaka Kabwe transport',
        destination: 'Kabwe',
        travelDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        resultsCount: 5,
        userPhone: '+260971234567',
        sessionId: 'sess-001-kajsdhf',
        ipAddress: '192.168.1.100',
      },
      {
        searchQuery: 'Kitwe Ndola buses today',
        destination: 'Ndola',
        travelDate: new Date(now.getTime()),
        resultsCount: 2,
        userPhone: '+260974567890',
        sessionId: 'sess-004-qwerty',
        ipAddress: '192.168.1.103',
      },
    ];

    await db
      .insert(schema.searchAnalytics)
      .values(searchAnalytics)
      .onConflictDoNothing();

    // 8. Create Page Views
    console.log('📄 Creating page views...');
    const pageViews = [
      {
        page: '/search',
        userPhone: '+260971234567',
        sessionId: 'sess-001-kajsdhf',
        referrer: 'google.com',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
        ipAddress: '192.168.1.100',
      },
      {
        page: '/bus-details/1',
        userPhone: '+260971234567',
        sessionId: 'sess-001-kajsdhf',
        referrer: '/search',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
        ipAddress: '192.168.1.100',
      },
      {
        page: '/checkout',
        userPhone: '+260971234567',
        sessionId: 'sess-001-kajsdhf',
        referrer: '/bus-details/1',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
        ipAddress: '192.168.1.100',
      },
      {
        page: '/search',
        userPhone: '+260972345678',
        sessionId: 'sess-002-lkasjdf',
        referrer: 'facebook.com',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ipAddress: '192.168.1.101',
      },
      {
        page: '/bus-details/3',
        userPhone: '+260972345678',
        sessionId: 'sess-002-lkasjdf',
        referrer: '/search',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ipAddress: '192.168.1.101',
      },
    ];

    await db.insert(schema.pageViews).values(pageViews).onConflictDoNothing();

    // 9. Create Booking Attempts
    console.log('🎯 Creating booking attempts...');
    const bookingAttempts = [
      {
        busId: allBuses[0].id,
        userPhone: '+260971234567',
        sessionId: 'sess-001-kajsdhf',
        status: 'completed',
        failureReason: null,
      },
      {
        busId: allBuses[1].id,
        userPhone: '+260972345678',
        sessionId: 'sess-002-lkasjdf',
        status: 'attempted',
        failureReason: null,
      },
      {
        busId: allBuses[2].id,
        userPhone: '+260973456789',
        sessionId: 'sess-003-mnbvcxz',
        status: 'completed',
        failureReason: null,
      },
      {
        busId: allBuses[3].id,
        userPhone: '+260975432109',
        sessionId: 'sess-005-asdfgh',
        status: 'failed',
        failureReason: 'Payment declined',
      },
    ];

    await db
      .insert(schema.bookingAttempts)
      .values(bookingAttempts)
      .onConflictDoNothing();

    // 10. Create Feedback
    console.log('⭐ Creating feedback...');
    const feedback = [
      {
        bookingId: allBookings[0].id,
        name: 'John Mwale',
        email: 'john.mwale@email.com',
        phone: '+260971234567',
        message:
          'Excellent service! The bus was very comfortable and arrived on time. Highly recommend Juldan Motors.',
        rating: 5,
      },
      {
        bookingId: allBookings[2].id,
        name: 'Chanda Zambia',
        email: 'chanda.z@email.com',
        phone: '+260973456789',
        message: 'Good value for money. Driver was courteous and professional.',
        rating: 4,
      },
      {
        bookingId: null,
        name: 'Anonymous User',
        email: 'feedback@example.com',
        phone: '+260976543210',
        message: 'Website is easy to use. Would appreciate more payment options.',
        rating: 4,
      },
    ];

    await db.insert(schema.feedback).values(feedback).onConflictDoNothing();

    // 11. Create Agents (Pending Review and Approved)
    console.log('👥 Creating agents...');
    const agentsData = [
      {
        phoneNumber: '+260961234567',
        firstName: 'Emmanuel',
        lastName: 'Mwale',
        email: 'emmanuel.mwale@email.com',
        idType: 'national_id' as const,
        idNumber: 'NZ202411001234',
        profilePictureUrl: null,
        locationCity: 'Lusaka',
        locationAddress: 'Kabulonga',
        referralCode: 'EM001',
        status: 'approved' as const,
        approvedBy: 1,
        approvedAt: new Date(),
        rejectionReason: null,
        suspendedAt: null,
        suspensionReason: null,
      },
      {
        phoneNumber: '+260962345678',
        firstName: 'Patricia',
        lastName: 'Banda',
        email: 'patricia.banda@email.com',
        idType: 'national_id' as const,
        idNumber: 'NZ202411002345',
        profilePictureUrl: null,
        locationCity: 'Kitwe',
        locationAddress: 'Nkana',
        referralCode: 'PB001',
        status: 'approved' as const,
        approvedBy: 1,
        approvedAt: new Date(),
        rejectionReason: null,
        suspendedAt: null,
        suspensionReason: null,
      },
      {
        phoneNumber: '+260963456789',
        firstName: 'Moses',
        lastName: 'Chipulu',
        email: 'moses.chipulu@email.com',
        idType: 'drivers_license' as const,
        idNumber: 'DL2020001234',
        profilePictureUrl: null,
        locationCity: 'Ndola',
        locationAddress: 'Masala',
        referralCode: 'MC001',
        status: 'pending_review' as const,
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null,
        suspendedAt: null,
        suspensionReason: null,
      },
      {
        phoneNumber: '+260964567890',
        firstName: 'Grace',
        lastName: 'Phiri',
        email: 'grace.phiri@email.com',
        idType: 'national_id' as const,
        idNumber: 'NZ202411004567',
        profilePictureUrl: null,
        locationCity: 'Livingstone',
        locationAddress: 'Maramba',
        referralCode: 'GP001',
        status: 'pending_review' as const,
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null,
        suspendedAt: null,
        suspensionReason: null,
      },
      {
        phoneNumber: '+260965678901',
        firstName: 'Samuel',
        lastName: 'Kaunda',
        email: 'samuel.kaunda@email.com',
        idType: 'passport' as const,
        idNumber: 'ZA12345678',
        profilePictureUrl: null,
        locationCity: 'Lusaka',
        locationAddress: 'Chilenjenje',
        referralCode: 'SK001',
        status: 'suspended' as const,
        approvedBy: 1,
        approvedAt: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000),
        rejectionReason: null,
        suspendedAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
        suspensionReason: 'Suspicious activity - multiple failed transactions',
      },
    ];

    await db.insert(schema.agents).values(agentsData).onConflictDoNothing();

    // Get agents to create float accounts
    const allAgents = await db.select().from(schema.agents);

    // 12. Create Agent Float Accounts for approved agents
    console.log('💰 Creating agent float accounts...');
    const floatAccounts = allAgents
      .filter(agent => agent.status === 'approved')
      .map(agent => ({
        agentId: agent.id,
        currentBalance: '250.00', // Enhanced balance for testing
        dailyQuotaRemaining: 20,
        dailyQuotaLimit: 25,
        lastQuotaReset: new Date(),
      }));

    await db
      .insert(schema.agentFloat)
      .values(floatAccounts)
      .onConflictDoNothing();

    // 13. Create Ticket Requests
    console.log('🎫 Creating ticket requests...');
    const approvedAgent = allAgents.find(a => a.phoneNumber === '+260961234567');
    const ticketRequests = [
      {
        userPhone: '+260971234567',
        fromCity: 'Lusaka',
        toCity: 'Kitwe',
        travelDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
        passengerCount: 2,
        passengerNames: JSON.stringify(['John Mwale', 'Jane Mwale']),
        contactPhone: '+260971234567',
        contactEmail: 'john.mwale@email.com',
        preferredOperator: 'Juldan Motors',
        status: 'claimed_by_agent' as const,
        agentId: approvedAgent?.id,
        agentClaimedAt: new Date(),
        requestExpiresAt: new Date(new Date().getTime() + 22 * 60 * 60 * 1000),
      },
      {
        userPhone: '+260972345678',
        fromCity: 'Lusaka',
        toCity: 'Ndola',
        travelDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
        passengerCount: 1,
        passengerNames: JSON.stringify(['Mary Chipenge']),
        contactPhone: '+260972345678',
        contactEmail: 'mary.chipenge@email.com',
        preferredOperator: null,
        status: 'open' as const,
        agentId: null,
        agentClaimedAt: null,
        requestExpiresAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      },
      {
        userPhone: '+260973456789',
        fromCity: 'Livingstone',
        toCity: 'Lusaka',
        travelDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
        passengerCount: 3,
        passengerNames: JSON.stringify(['Chanda Zambia', 'Chanda Jr', 'Cynthia']),
        contactPhone: '+260973456789',
        contactEmail: 'chanda.z@email.com',
        preferredOperator: 'Zambian Eagle Coaches',
        status: 'open' as const,
        agentId: null,
        agentClaimedAt: null,
        requestExpiresAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      },
    ];

    await db
      .insert(schema.ticketRequests)
      .values(ticketRequests)
      .onConflictDoNothing();

    // 14. Create Agent Float Transactions (purchase history)
    console.log('💳 Creating agent float transactions...');
    const agent1 = allAgents.find(a => a.phoneNumber === '+260961234567');
    const agent2 = allAgents.find(a => a.phoneNumber === '+260962345678');

    const transactions = [
      // Agent 1 transactions
      {
        agentId: agent1?.id,
        transactionType: 'purchase' as const,
        amountZmw: '100.00',
        requestsAllocated: 50,
        paymentMethod: 'mtn_momo' as const,
        paymentReference: 'MTN20251120001',
        status: 'completed' as const,
        notes: 'Float purchase via MTN Mobile Money',
        createdAt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        agentId: agent1?.id,
        transactionType: 'purchase' as const,
        amountZmw: '50.00',
        requestsAllocated: 25,
        paymentMethod: 'airtel_money' as const,
        paymentReference: 'ATL20251115001',
        status: 'completed' as const,
        notes: 'Float purchase via Airtel Money',
        createdAt: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        agentId: agent1?.id,
        transactionType: 'usage' as const,
        amountZmw: '10.00',
        requestsAllocated: -5,
        status: 'completed' as const,
        notes: 'Float deducted for ticket requests',
        createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      // Agent 2 transactions
      {
        agentId: agent2?.id,
        transactionType: 'purchase' as const,
        amountZmw: '75.00',
        requestsAllocated: 37,
        paymentMethod: 'mtn_momo' as const,
        paymentReference: 'MTN20251119001',
        status: 'completed' as const,
        notes: 'Float purchase via MTN Mobile Money',
        createdAt: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        agentId: agent2?.id,
        transactionType: 'usage' as const,
        amountZmw: '15.00',
        requestsAllocated: -7,
        status: 'completed' as const,
        notes: 'Float deducted for ticket requests',
        createdAt: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    await db
      .insert(schema.agentFloatTransactions)
      .values(transactions)
      .onConflictDoNothing();

    // 15. Create Processed Tickets (completed requests)
    console.log('🎫 Creating processed tickets...');
    const allTickets = await db.select().from(schema.ticketRequests);
    const processedTickets = [
      {
        ticketRequestId: allTickets[0]?.id,
        agentId: agent1?.id,
        passengerName: 'John Mwale',
        seatNumber: 'A1',
        busId: allBuses[0]?.id,
        bookingReference: 'ICB202411006',
        receiptImageUrl: 'https://via.placeholder.com/400x300?text=Receipt+001',
        receiptVerificationStatus: 'verified' as const,
        verifiedBy: 1,
        userSmsSent: true,
        userSmsSentAt: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000),
        notesToUser: 'Booking confirmed for Lusaka-Kitwe route',
        createdAt: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    ];

    await db
      .insert(schema.agentProcessedTickets)
      .values(processedTickets)
      .onConflictDoNothing();

    // 16. Create Performance Tiers
    console.log('📊 Creating performance tiers...');
    const performanceTiers = [
      {
        agentId: agent1?.id,
        tier: 'silver',
        totalRequestsCompleted: 15,
        totalRevenue: '30.00',
        costPerRequest: '2.00',
        bonusPercentage: 10,
        createdAt: new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        agentId: agent2?.id,
        tier: 'bronze',
        totalRequestsCompleted: 8,
        totalRevenue: '16.00',
        costPerRequest: '2.00',
        bonusPercentage: 0,
        createdAt: new Date(new Date().getTime() - 20 * 24 * 60 * 60 * 1000),
      },
    ];

    await db
      .insert(schema.agentPerformanceTiers)
      .values(performanceTiers)
      .onConflictDoNothing();

    // 17. Create Bonuses
    console.log('🎁 Creating agent bonuses...');
    const bonuses = [
      {
        agentId: agent1?.id,
        bonusType: 'tier_upgrade',
        bonusAmountZmw: '25.00',
        description: 'Silver tier achievement bonus',
        expiresAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
        claimed: false,
        createdAt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        agentId: agent2?.id,
        bonusType: 'daily_challenge',
        bonusAmountZmw: '10.00',
        description: 'Daily challenge completion bonus',
        expiresAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        claimed: false,
        createdAt: new Date(),
      },
    ];

    await db
      .insert(schema.agentBonuses)
      .values(bonuses)
      .onConflictDoNothing();

    // 18. Create Referral Records
    console.log('🤝 Creating agent referrals...');
    const referrals = [
      {
        referrerAgentId: agent1?.id,
        referredAgentId: agent2?.id,
        bonusZmw: '50.00',
        status: 'credited',
        createdAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
        creditedAt: new Date(new Date().getTime() - 6 * 24 * 60 * 60 * 1000),
      },
    ];

    await db
      .insert(schema.agentReferrals)
      .values(referrals)
      .onConflictDoNothing();

    // 19. Create Daily Quota Logs
    console.log('📅 Creating daily quota logs...');
    const quotaLogs = [
      {
        agentId: agent1?.id,
        date: new Date().toISOString().split('T')[0],
        requestsViewed: 5,
        quotaLimit: 25,
        floatBalanceOnDate: '235.00',
        createdAt: new Date(),
      },
      {
        agentId: agent2?.id,
        date: new Date().toISOString().split('T')[0],
        requestsViewed: 3,
        quotaLimit: 25,
        floatBalanceOnDate: '235.00',
        createdAt: new Date(),
      },
    ];

    await db
      .insert(schema.agentDailyQuotaLogs)
      .values(quotaLogs)
      .onConflictDoNothing();

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Seeded Data Summary:');
    console.log(`  ✓ ${allOperators.length} Bus Operators`);
    console.log(`  ✓ ${allRoutes.length} Routes`);
    console.log(`  ✓ ${allBuses.length} Bus Schedules`);
    console.log(`  ✓ ${allBookings.length} Bookings`);
    console.log(`  ✓ ${payments.length} Payments`);
    console.log(`  ✓ 1 Admin User (admin@intercity.zm / admin123)`);
    console.log(`  ✓ ${searchAnalytics.length} Search Analytics`);
    console.log(`  ✓ ${pageViews.length} Page Views`);
    console.log(`  ✓ ${bookingAttempts.length} Booking Attempts`);
    console.log(`  ✓ ${feedback.length} Feedback Entries`);
    console.log(`  ✓ ${agentsData.length} Agents (2 approved, 2 pending, 1 suspended)`);
    console.log(`  ✓ ${floatAccounts.length} Agent Float Accounts`);
    console.log(`  ✓ ${ticketRequests.length} Ticket Requests`);
    console.log(`  ✓ ${transactions.length} Agent Float Transactions`);
    console.log(`  ✓ ${processedTickets.length} Processed Tickets`);
    console.log(`  ✓ ${performanceTiers.length} Performance Tiers`);
    console.log(`  ✓ ${bonuses.length} Agent Bonuses`);
    console.log(`  ✓ ${referrals.length} Agent Referrals`);
    console.log(`  ✓ ${quotaLogs.length} Daily Quota Logs`);
    console.log(
      '\n🎯 Admin Login: admin@intercity.zm / admin123',
    );
    console.log(
      '\n👥 Agent Accounts (PIN for all: 1234):',
    );
    console.log(
      '  Approved Agents:',
    );
    console.log(
      '    • +260961234567 (Emmanuel Mwale) - 250 ZMW float, 25 daily requests',
    );
    console.log(
      '    • +260962345678 (Patricia Banda) - 250 ZMW float, 25 daily requests',
    );
    console.log(
      '  Pending Review:',
    );
    console.log(
      '    • +260963456789 (Moses Chipulu)',
    );
    console.log(
      '    • +260964567890 (Grace Phiri)',
    );
    console.log(
      '  Suspended:',
    );
    console.log(
      '    • +260965678901 (Samuel Kaunda)',
    );
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
