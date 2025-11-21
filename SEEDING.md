# Database Seeding Guide

## Overview

This document describes the seed data created for the IntercityBookings admin dashboard. The data is realistic for the Lusaka, Zambia intercity bus booking system.

## What Was Seeded

### 1. Bus Operators (4 companies)
- **Juldan Motors** - Premium luxury service, ZMW 850 per ticket
- **Mazhandu Coaches** - Affordable service, ZMW 580-650 per ticket
- **Zambian Eagle Coaches** - Fast service, ZMW 700-900 per ticket
- **City Cruiser Express** - Budget-friendly, ZMW 240-700 per ticket

### 2. Routes (10 major routes)
All routes originating from or within Zambia:
- Lusaka ↔ Kitwe (456 km, 8 hours)
- Lusaka ↔ Ndola (434 km, 7.5 hours)
- Lusaka ↔ Livingstone (460 km, 8 hours)
- Lusaka ↔ Chipata (520 km, 9 hours)
- Lusaka ↔ Kabwe (145 km, 2 hours)
- Lusaka ↔ Chingola (490 km, 8.5 hours)
- Kitwe ↔ Ndola (50 km, 1 hour)
- Livingstone ↔ Kazungula (65 km, 1.5 hours)
- Lusaka ↔ Kasama (610 km, 10.5 hours)
- Lusaka ↔ Mansa (580 km, 10 hours)

### 3. Bus Schedules (10 schedules)
- Mix of luxury (32 seats) and standard (48-60 seats) buses
- Multiple departure times per route
- Operating days configured (weekdays and weekends)
- Realistic pricing in ZMW:
  - Luxury: ZMW 750-900
  - Standard: ZMW 240-700

Features included:
- WiFi (luxury buses)
- AC (all buses)
- Toilet (most buses)
- Drinks Service (luxury buses)
- USB Charging (premium luxury)

### 4. Bookings (5 confirmed/pending)
Sample passenger data with:
- Phone numbers in Zambian format (+260...)
- Realistic names
- Seat assignments
- Travel dates 1-7 days from now
- Booking references (ICB202411001-005)

### 5. Payments (4 transactions)
- Payment methods: Airtel Money, MTN Mobile Money
- Transaction references
- Status tracking (pending/completed)

### 6. Admin User
```
Email: admin@intercity.zm
Password: admin123
Role: super_admin
```
**⚠️ Change password immediately after first login!**

### 7. Analytics Data

#### Search Analytics (5 entries)
- Tracks user searches for different routes
- Includes session IDs and IP addresses
- Links to passenger phone numbers

#### Page Views (5 entries)
- /search - Initial route search
- /bus-details/1,3 - Bus detail pages
- /checkout - Checkout page

Includes:
- User phone numbers
- Session IDs
- Referrers
- User agents

#### Booking Attempts (4 entries)
- Successful bookings
- Failed attempts with reasons
- User phone and session tracking

#### Feedback (3 entries)
- 5-star review from John Mwale
- 4-star review from Chanda Zambia
- Anonymous feedback

## Running the Seed

### First Time Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment** (already done):
   - `.env.local` with your Neon database URL

3. **Generate migrations:**
   ```bash
   npm run db:generate
   ```

4. **Push to database:**
   ```bash
   npm run db:push
   ```

5. **Run seed script:**
   ```bash
   npm run db:seed
   ```

### Re-seeding (Clear and Reload)

If you want to re-seed the database with fresh data:

```bash
# The seed script uses onConflictDoNothing, so it won't overwrite existing data
# To truly reset, delete rows manually first or create a reset script
```

## Realistic Data Notes

### Zambian Pricing
- All prices in ZMW (Zambian Kwacha)
- Standard buses: 240-700 ZMW
- Luxury buses: 750-900 ZMW
- Reflects real intercity routes

### Phone Numbers
- All use Zambian format: +260...
- Different operators (097, 096, etc.)
- Matches sample passenger data

### Routes
- Real Zambian intercity routes
- Accurate distances and estimated durations
- Covers major cities: Lusaka, Kitwe, Ndola, Livingstone, Chipata, Kabwe

### Operators
- Realistic company names
- Actual service characteristics
- Ratings and contact information
- Operating hours and features

### Booking Data
- Dates 1-7 days in future
- Realistic seat assignments
- Mixed booking statuses
- Real passenger names (Zambian)

## Customizing the Seed

To modify the seed data, edit `/scripts/seed.ts`:

```typescript
// 1. Bus Operators - Add more companies or change pricing
// 2. Routes - Add new routes or modify distances
// 3. Bus Schedules - Adjust times, capacity, features
// 4. Bookings - Change passenger data
// 5. Payments - Modify payment methods or amounts
// 6. Analytics - Adjust search patterns or page visits
```

## Admin Dashboard Access

After seeding, start the dev server:

```bash
npm run dev
```

Visit: **http://localhost:3001**

Login with:
- **Email:** admin@intercity.zm
- **Password:** admin123

## Data Relationships

```
Operators (4)
└─ Buses (10)
   ├─ Bookings (5)
   │  ├─ Payments (4)
   │  └─ Feedback (3)
   └─ Booking Attempts (4)

Routes (10)
└─ Buses (10)

Search Analytics (5) → linked to phone numbers
Page Views (5) → linked to sessions
Booking Attempts (4) → linked to buses
Admin Users (1) → authentication
```

## Notes for Development

- The seed script uses `onConflictDoNothing()` to avoid duplicate errors
- All data is non-destructive - re-running won't delete existing data
- Relationships are properly configured with foreign keys
- JSON fields (features, operatesOn) are stringified
- Timestamps use current date/time plus offsets for realism

## Troubleshooting

### Tables don't exist
```bash
npm run db:push
```

### Environment variable not found
Ensure `.env.local` exists and contains `DATABASE_URL`

### Permission denied
Check that your Neon database user has CREATE TABLE permissions

### Data already exists
The seed script won't overwrite. Delete data manually if needed.
