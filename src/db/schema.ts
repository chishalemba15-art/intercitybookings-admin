import { pgTable, serial, text, varchar, integer, decimal, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const busTypeEnum = pgEnum('bus_type', ['luxury', 'standard']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled', 'completed']);
export const paymentMethodEnum = pgEnum('payment_method', ['airtel_money', 'mtn_momo']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);

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
