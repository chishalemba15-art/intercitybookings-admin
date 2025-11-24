import { pgTable, serial, text, varchar, integer, decimal, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const busTypeEnum = pgEnum('bus_type', ['luxury', 'standard']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled', 'completed', 'assigned']);
export const paymentMethodEnum = pgEnum('payment_method', ['airtel_money', 'mtn_momo']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);
export const agentStatusEnum = pgEnum('agent_status', ['pending_review', 'approved', 'suspended', 'rejected']);
export const ticketRequestStatusEnum = pgEnum('ticket_request_status', ['open', 'claimed_by_agent', 'completed', 'expired']);
export const idTypeEnum = pgEnum('id_type', ['national_id', 'drivers_license', 'passport']);
export const transactionTypeEnum = pgEnum('transaction_type', ['purchase', 'refund', 'usage']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed']);
export const receiptStatusEnum = pgEnum('receipt_status', ['pending', 'verified', 'rejected']);
export const agentTypeEnum = pgEnum('agent_type', ['tied', 'independent']);
export const liftPurchaseTypeEnum = pgEnum('lift_purchase_type', ['daily', 'weekly', 'monthly']);
export const notificationTypeEnum = pgEnum('notification_type', ['new_booking', 'booking_assigned', 'booking_cancelled', 'booking_escalated', 'new_search']);
export const assignmentStatusEnum = pgEnum('assignment_status', ['pending', 'accepted', 'rejected', 'completed', 'escalated']);

// Operators Table
export const operators = pgTable('operators', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  logo: varchar('logo', { length: 500 }),
  color: varchar('color', { length: 50 }).default('bg-blue-600'),
  rating: decimal('rating', { precision: 2, scale: 1 }).default('4.0'),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Routes Table
export const routes = pgTable('routes', {
  id: serial('id').primaryKey(),
  fromCity: varchar('from_city', { length: 100 }).notNull(),
  toCity: varchar('to_city', { length: 100 }).notNull(),
  distance: integer('distance'), // in kilometers
  estimatedDuration: integer('estimated_duration'), // in minutes
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Buses/Schedules Table
export const buses = pgTable('buses', {
  id: serial('id').primaryKey(),
  operatorId: integer('operator_id').references(() => operators.id).notNull(),
  routeId: integer('route_id').references(() => routes.id).notNull(),
  departureTime: varchar('departure_time', { length: 5 }).notNull(), // HH:MM format
  arrivalTime: varchar('arrival_time', { length: 5 }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  type: busTypeEnum('type').notNull(),
  totalSeats: integer('total_seats').notNull(),
  availableSeats: integer('available_seats').notNull(),
  features: text('features'), // JSON array stored as text
  isActive: boolean('is_active').default(true),
  operatesOn: text('operates_on'), // JSON array of days [0-6] where 0 = Sunday
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Bookings Table
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  busId: integer('bus_id').references(() => buses.id).notNull(),
  bookingRef: varchar('booking_ref', { length: 20 }).notNull().unique(),
  passengerName: varchar('passenger_name', { length: 255 }).notNull(),
  passengerPhone: varchar('passenger_phone', { length: 20 }).notNull(),
  passengerEmail: varchar('passenger_email', { length: 255 }),
  seatNumber: varchar('seat_number', { length: 10 }).notNull(),
  travelDate: timestamp('travel_date').notNull(),
  status: bookingStatusEnum('status').default('pending'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  specialRequests: text('special_requests'),
  assignedAgentId: integer('assigned_agent_id').references(() => agents.id),
  assignedAt: timestamp('assigned_at'),
  agentNotes: text('agent_notes'),
  assignmentStatus: assignmentStatusEnum('assignment_status'),
  assignmentResponseDeadline: timestamp('assignment_response_deadline'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Payments Table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').references(() => bookings.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('pending'),
  transactionRef: varchar('transaction_ref', { length: 100 }),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Feedback Table
export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').references(() => bookings.id),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  message: text('message').notNull(),
  rating: integer('rating'), // 1-5 stars
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const operatorsRelations = relations(operators, ({ many }) => ({
  buses: many(buses),
}));

export const routesRelations = relations(routes, ({ many }) => ({
  buses: many(buses),
}));

export const busesRelations = relations(buses, ({ one, many }) => ({
  operator: one(operators, {
    fields: [buses.operatorId],
    references: [operators.id],
  }),
  route: one(routes, {
    fields: [buses.routeId],
    references: [routes.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  bus: one(buses, {
    fields: [bookings.busId],
    references: [buses.id],
  }),
  payments: many(payments),
  feedback: many(feedback),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  booking: one(bookings, {
    fields: [feedback.bookingId],
    references: [bookings.id],
  }),
}));

// Admin Users Table
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('admin'),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Search Analytics Table
export const searchAnalytics = pgTable('search_analytics', {
  id: serial('id').primaryKey(),
  searchQuery: varchar('search_query', { length: 255 }),
  destination: varchar('destination', { length: 100 }),
  travelDate: timestamp('travel_date'),
  resultsCount: integer('results_count'),
  userPhone: varchar('user_phone', { length: 20 }),
  sessionId: varchar('session_id', { length: 100 }),
  ipAddress: varchar('ip_address', { length: 50 }),
  // Geolocation fields
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),
  // ML extracted data
  extractedLocation: varchar('extracted_location', { length: 255 }), // Location extracted by ML from query
  searchIntent: varchar('search_intent', { length: 100 }), // ML-classified intent (booking, price_check, schedule_check, etc.)
  createdAt: timestamp('created_at').defaultNow(),
});

// Page Views Table
export const pageViews = pgTable('page_views', {
  id: serial('id').primaryKey(),
  page: varchar('page', { length: 255 }).notNull(),
  userPhone: varchar('user_phone', { length: 20 }),
  sessionId: varchar('session_id', { length: 100 }),
  referrer: varchar('referrer', { length: 500 }),
  userAgent: varchar('user_agent', { length: 500 }),
  ipAddress: varchar('ip_address', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Booking Attempts Table (for analytics)
export const bookingAttempts = pgTable('booking_attempts', {
  id: serial('id').primaryKey(),
  busId: integer('bus_id').references(() => buses.id),
  userPhone: varchar('user_phone', { length: 20 }).notNull(),
  sessionId: varchar('session_id', { length: 100 }),
  status: varchar('status', { length: 50 }).default('attempted'),
  failureReason: text('failure_reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations for new tables
export const bookingAttemptsRelations = relations(bookingAttempts, ({ one }) => ({
  bus: one(buses, {
    fields: [bookingAttempts.busId],
    references: [buses.id],
  }),
}));

// Agent Tables
export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  idType: idTypeEnum('id_type').notNull(),
  idNumber: varchar('id_number', { length: 50 }).notNull().unique(),
  profilePictureUrl: varchar('profile_picture_url', { length: 500 }),
  locationCity: varchar('location_city', { length: 100 }),
  locationAddress: varchar('location_address', { length: 255 }),
  referralCode: varchar('referral_code', { length: 20 }).unique(),
  pinHash: varchar('pin_hash', { length: 255 }), // Bcrypt hashed 4-digit PIN
  agentType: agentTypeEnum('agent_type').default('tied'), // tied or independent
  primaryOperatorId: integer('primary_operator_id').references(() => operators.id), // Primary operator for tied agents
  isOnline: boolean('is_online').default(false),
  lastActiveAt: timestamp('last_active_at'),
  status: agentStatusEnum('status').default('pending_review'),
  approvedBy: integer('approved_by').references(() => adminUsers.id),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  suspendedAt: timestamp('suspended_at'),
  suspensionReason: text('suspension_reason'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agentFloat = pgTable('agent_float', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agents.id).notNull().unique(),
  currentBalance: decimal('current_balance', { precision: 10, scale: 2 }).default('0'),
  dailyQuotaRemaining: integer('daily_quota_remaining').default(0),
  dailyQuotaLimit: integer('daily_quota_limit').default(0),
  lastQuotaReset: timestamp('last_quota_reset').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agentFloatTransactions = pgTable('agent_float_transactions', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agents.id).notNull(),
  transactionType: transactionTypeEnum('transaction_type').notNull(),
  amountZmw: decimal('amount_zmw', { precision: 10, scale: 2 }).notNull(),
  requestsAllocated: integer('requests_allocated'),
  paymentMethod: paymentMethodEnum('payment_method'),
  paymentReference: varchar('payment_reference', { length: 100 }),
  status: transactionStatusEnum('status').default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const ticketRequests = pgTable('ticket_requests', {
  id: serial('id').primaryKey(),
  userPhone: varchar('user_phone', { length: 20 }).notNull(),
  fromCity: varchar('from_city', { length: 100 }).notNull(),
  toCity: varchar('to_city', { length: 100 }).notNull(),
  travelDate: timestamp('travel_date').notNull(),
  passengerCount: integer('passenger_count').notNull(),
  passengerNames: text('passenger_names'), // JSON array
  contactPhone: varchar('contact_phone', { length: 20 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }),
  preferredOperator: varchar('preferred_operator', { length: 255 }),
  status: ticketRequestStatusEnum('status').default('open'),
  agentId: integer('agent_id').references(() => agents.id),
  agentClaimedAt: timestamp('agent_claimed_at'),
  requestExpiresAt: timestamp('request_expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agentProcessedTickets = pgTable('agent_processed_tickets', {
  id: serial('id').primaryKey(),
  ticketRequestId: integer('ticket_request_id').references(() => ticketRequests.id).notNull(),
  agentId: integer('agent_id').references(() => agents.id).notNull(),
  passengerName: varchar('passenger_name', { length: 255 }).notNull(),
  seatNumber: varchar('seat_number', { length: 10 }),
  busId: integer('bus_id').references(() => buses.id),
  bookingReference: varchar('booking_reference', { length: 20 }).unique(),
  receiptImageUrl: varchar('receipt_image_url', { length: 500 }),
  receiptVerificationStatus: receiptStatusEnum('receipt_verification_status').default('pending'),
  verifiedBy: integer('verified_by').references(() => adminUsers.id),
  userSmsSent: boolean('user_sms_sent').default(false),
  userSmsSentAt: timestamp('user_sms_sent_at'),
  notesToUser: text('notes_to_user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agentDailyQuotaLogs = pgTable('agent_daily_quota_logs', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agents.id).notNull(),
  date: varchar('date', { length: 10 }), // YYYY-MM-DD
  requestsViewed: integer('requests_viewed').default(0),
  quotaLimit: integer('quota_limit').default(0),
  floatBalanceOnDate: decimal('float_balance_on_date', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations for Agents
export const agentRelations = relations(agents, ({ one, many }) => ({
  floatAccount: one(agentFloat, {
    fields: [agents.id],
    references: [agentFloat.agentId],
  }),
  floatTransactions: many(agentFloatTransactions),
  claimedRequests: many(ticketRequests),
  processedTickets: many(agentProcessedTickets),
  quotaLogs: many(agentDailyQuotaLogs),
  approvedByAdmin: one(adminUsers, {
    fields: [agents.approvedBy],
    references: [adminUsers.id],
  }),
}));

export const agentFloatRelations = relations(agentFloat, ({ one, many }) => ({
  agent: one(agents, {
    fields: [agentFloat.agentId],
    references: [agents.id],
  }),
  transactions: many(agentFloatTransactions),
}));

export const agentFloatTransactionsRelations = relations(agentFloatTransactions, ({ one }) => ({
  agent: one(agents, {
    fields: [agentFloatTransactions.agentId],
    references: [agents.id],
  }),
}));

export const ticketRequestsRelations = relations(ticketRequests, ({ one, many }) => ({
  agent: one(agents, {
    fields: [ticketRequests.agentId],
    references: [agents.id],
  }),
  processedTicket: one(agentProcessedTickets),
}));

export const agentProcessedTicketsRelations = relations(agentProcessedTickets, ({ one }) => ({
  ticketRequest: one(ticketRequests, {
    fields: [agentProcessedTickets.ticketRequestId],
    references: [ticketRequests.id],
  }),
  agent: one(agents, {
    fields: [agentProcessedTickets.agentId],
    references: [agents.id],
  }),
  bus: one(buses, {
    fields: [agentProcessedTickets.busId],
    references: [buses.id],
  }),
  verifiedByAdmin: one(adminUsers, {
    fields: [agentProcessedTickets.verifiedBy],
    references: [adminUsers.id],
  }),
}));

// Type exports
export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
export type AgentFloat = typeof agentFloat.$inferSelect;
export type NewAgentFloat = typeof agentFloat.$inferInsert;
export type AgentFloatTransaction = typeof agentFloatTransactions.$inferSelect;
export type NewAgentFloatTransaction = typeof agentFloatTransactions.$inferInsert;
export type TicketRequest = typeof ticketRequests.$inferSelect;
export type NewTicketRequest = typeof ticketRequests.$inferInsert;
export type AgentProcessedTicket = typeof agentProcessedTickets.$inferSelect;
export type NewAgentProcessedTicket = typeof agentProcessedTickets.$inferInsert;
export type AgentDailyQuotaLog = typeof agentDailyQuotaLogs.$inferSelect;
export type NewAgentDailyQuotaLog = typeof agentDailyQuotaLogs.$inferInsert;

// Type exports
export type Operator = typeof operators.$inferSelect;
export type NewOperator = typeof operators.$inferInsert;
export type Route = typeof routes.$inferSelect;
export type NewRoute = typeof routes.$inferInsert;
export type Bus = typeof buses.$inferSelect;
export type NewBus = typeof buses.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type SearchAnalytics = typeof searchAnalytics.$inferSelect;
export type NewSearchAnalytics = typeof searchAnalytics.$inferInsert;
export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;
export type BookingAttempt = typeof bookingAttempts.$inferSelect;
export type NewBookingAttempt = typeof bookingAttempts.$inferInsert;

// Agent Referral System
export const agentReferrals = pgTable('agent_referrals', {
  id: serial('id').primaryKey(),
  referrerAgentId: integer('referrer_agent_id').references(() => agents.id).notNull(),
  referredAgentId: integer('referred_agent_id').references(() => agents.id).notNull(),
  bonusZmw: decimal('bonus_zmw', { precision: 10, scale: 2 }).default('50'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, credited, redeemed
  createdAt: timestamp('created_at').defaultNow(),
  creditedAt: timestamp('credited_at'),
});

// Agent Performance Tiers
export const agentPerformanceTiers = pgTable('agent_performance_tiers', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agents.id).notNull().unique(),
  tier: varchar('tier', { length: 20 }).default('bronze'), // bronze, silver, gold, platinum
  totalRequestsCompleted: integer('total_requests_completed').default(0),
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0'),
  costPerRequest: decimal('cost_per_request', { precision: 5, scale: 2 }).default('2'),
  bonusPercentage: integer('bonus_percentage').default(0), // 0 for bronze
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Agent Bonuses & Incentives
export const agentBonuses = pgTable('agent_bonuses', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agents.id).notNull(),
  bonusType: varchar('bonus_type', { length: 50 }), // referral, tier_upgrade, milestone, daily_challenge
  bonusAmountZmw: decimal('bonus_amount_zmw', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  expiresAt: timestamp('expires_at'),
  claimed: boolean('claimed').default(false),
  claimedAt: timestamp('claimed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Type exports for growth mechanics
export type AgentReferral = typeof agentReferrals.$inferSelect;
export type NewAgentReferral = typeof agentReferrals.$inferInsert;
export type AgentPerformanceTier = typeof agentPerformanceTiers.$inferSelect;
export type NewAgentPerformanceTier = typeof agentPerformanceTiers.$inferInsert;
export type AgentBonus = typeof agentBonuses.$inferSelect;
export type NewAgentBonus = typeof agentBonuses.$inferInsert;

// Agent-Operator Assignments (for independent agents with multiple operators)
export const agentOperatorAssignments = pgTable('agent_operator_assignments', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agents.id).notNull(),
  operatorId: integer('operator_id').references(() => operators.id).notNull(),
  assignedAt: timestamp('assigned_at').defaultNow(),
  assignedBy: integer('assigned_by').references(() => adminUsers.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Agent Lifts System (tokens for accessing search analytics)
export const agentLifts = pgTable('agent_lifts', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agents.id).notNull().unique(),
  currentBalance: integer('current_balance').default(0),
  totalPurchased: integer('total_purchased').default(0),
  totalUsed: integer('total_used').default(0),
  lastPurchaseAt: timestamp('last_purchase_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Lifts Purchase Transactions
export const liftsTransactions = pgTable('lifts_transactions', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agents.id).notNull(),
  purchaseType: liftPurchaseTypeEnum('purchase_type').notNull(), // daily, weekly, monthly
  liftsAmount: integer('lifts_amount').notNull(),
  priceZmw: decimal('price_zmw', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method'),
  paymentReference: varchar('payment_reference', { length: 100 }),
  status: transactionStatusEnum('status').default('pending'),
  expiresAt: timestamp('expires_at'), // For daily/weekly/monthly subscriptions
  createdAt: timestamp('created_at').defaultNow(),
});

// Lifts Usage Logs
export const liftsUsageLogs = pgTable('lifts_usage_logs', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agents.id).notNull(),
  liftsUsed: integer('lifts_used').notNull(),
  action: varchar('action', { length: 100 }), // e.g., "view_kitwe_searches", "access_operator_metrics"
  searchAnalyticsId: integer('search_analytics_id').references(() => searchAnalytics.id),
  metadata: text('metadata'), // JSON for additional context
  createdAt: timestamp('created_at').defaultNow(),
});

// Agent Notifications
export const agentNotifications = pgTable('agent_notifications', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agents.id).notNull(),
  notificationType: notificationTypeEnum('notification_type').notNull(),
  bookingId: integer('booking_id').references(() => bookings.id),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  smsSent: boolean('sms_sent').default(false),
  smsSentAt: timestamp('sms_sent_at'),
  smsDeliveryStatus: varchar('sms_delivery_status', { length: 50 }),
  actionUrl: varchar('action_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  readAt: timestamp('read_at'),
});

// Operator Analytics (aggregated metrics for agents)
export const operatorAnalytics = pgTable('operator_analytics', {
  id: serial('id').primaryKey(),
  operatorId: integer('operator_id').references(() => operators.id).notNull(),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  totalSearches: integer('total_searches').default(0),
  totalBookings: integer('total_bookings').default(0),
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0'),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 }).default('0'), // percentage
  popularRoutes: text('popular_routes'), // JSON array of routes
  peakHours: text('peak_hours'), // JSON array of hours
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Booking Assignment History
export const bookingAssignmentHistory = pgTable('booking_assignment_history', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').references(() => bookings.id).notNull(),
  agentId: integer('agent_id').references(() => agents.id).notNull(),
  assignedBy: integer('assigned_by').references(() => adminUsers.id),
  assignmentStatus: assignmentStatusEnum('assignment_status').notNull(),
  responseTime: integer('response_time'), // in seconds
  rejectionReason: text('rejection_reason'),
  escalated: boolean('escalated').default(false),
  escalatedAt: timestamp('escalated_at'),
  notificationSent: boolean('notification_sent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Platform Admin Settings
export const platformSettings = pgTable('platform_settings', {
  id: serial('id').primaryKey(),
  settingKey: varchar('setting_key', { length: 100 }).notNull().unique(),
  settingValue: text('setting_value').notNull(), // JSON or plain text
  description: text('description'),
  category: varchar('category', { length: 50 }), // e.g., 'agents', 'notifications', 'lifts'
  updatedBy: integer('updated_by').references(() => adminUsers.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Agent Leaderboard (cached/computed rankings)
export const agentLeaderboard = pgTable('agent_leaderboard', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agents.id).notNull().unique(),
  rank: integer('rank').notNull(),
  totalBookings: integer('total_bookings').default(0),
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0'),
  avgResponseTime: integer('avg_response_time'), // in seconds
  completionRate: decimal('completion_rate', { precision: 5, scale: 2 }).default('0'), // percentage
  customerRating: decimal('customer_rating', { precision: 3, scale: 2 }), // out of 5
  liftsEarned: integer('lifts_earned').default(0),
  lastCalculatedAt: timestamp('last_calculated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Type exports for new tables
export type AgentOperatorAssignment = typeof agentOperatorAssignments.$inferSelect;
export type NewAgentOperatorAssignment = typeof agentOperatorAssignments.$inferInsert;
export type AgentLifts = typeof agentLifts.$inferSelect;
export type NewAgentLifts = typeof agentLifts.$inferInsert;
export type LiftsTransaction = typeof liftsTransactions.$inferSelect;
export type NewLiftsTransaction = typeof liftsTransactions.$inferInsert;
export type LiftsUsageLog = typeof liftsUsageLogs.$inferSelect;
export type NewLiftsUsageLog = typeof liftsUsageLogs.$inferInsert;
export type AgentNotification = typeof agentNotifications.$inferSelect;
export type NewAgentNotification = typeof agentNotifications.$inferInsert;
export type OperatorAnalytics = typeof operatorAnalytics.$inferSelect;
export type NewOperatorAnalytics = typeof operatorAnalytics.$inferInsert;
export type BookingAssignmentHistory = typeof bookingAssignmentHistory.$inferSelect;
export type NewBookingAssignmentHistory = typeof bookingAssignmentHistory.$inferInsert;
export type PlatformSettings = typeof platformSettings.$inferSelect;
export type NewPlatformSettings = typeof platformSettings.$inferInsert;
export type AgentLeaderboard = typeof agentLeaderboard.$inferSelect;
export type NewAgentLeaderboard = typeof agentLeaderboard.$inferInsert;
