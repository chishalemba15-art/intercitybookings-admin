# Agent System Design Document

## 1. Overview

A distributed ticket sales agent system where approved agents can purchase float (credits) to access customer booking requests. Agents use float to see ticket requests and manually process sales via WhatsApp.

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Frontend App                      │
│  - Browse buses, make booking requests (stored in platform) │
│  - Receive SMS notification when agent processes ticket     │
│  - Track ticket status                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Central Database                          │
│  - Agents (pending/approved/suspended)                       │
│  - Agent Float (credits/daily quota)                        │
│  - Ticket Requests (user bookings awaiting agent processing)│
│  - Processed Tickets (completed sales with receipt scans)   │
│  - Agent Transactions (float purchases, usage logs)         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                  Agent Mobile App                            │
│  - Agent login/registration with phone number               │
│  - Float management & purchase                              │
│  - View available ticket requests (float-dependent)         │
│  - Process bookings → receipt upload                        │
│  - Daily quota tracking                                     │
│  - WhatsApp integration for user contact                    │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                  Admin Dashboard                             │
│  - Agent applications review & approval                     │
│  - Agent float/transaction audit                            │
│  - Agent performance metrics                                │
│  - Processed tickets review (receipt verification)          │
│  - SMS notification triggers                                │
└──────────────────────────────────────────────────────────────┘
```

## 3. Agent Float System

### Float Pricing Model
- **10 ZMW = 5 request views per day** (2 ZMW per request)
- Float does NOT expire but can be tracked by purchase date
- Daily quota resets at 00:00 Zambian time
- Agents can purchase float via mobile money (future integration)

### Float Usage
```
Agent purchases 100 ZMW float
  → Can see 50 requests per day
  → After 50 views = float depleted for that day
  → Quota resets next day (float balance unchanged)
  → Agent can purchase more float anytime
```

## 4. Database Schema Changes

### New Tables

#### `agents`
```sql
- id (PK)
- phone_number (unique, national/international format)
- first_name
- last_name
- email (optional)
- id_type (national_id, drivers_license, passport)
- id_number (unique)
- profile_picture_url
- location_city
- location_address
- referral_code (optional)
- status (pending_review, approved, suspended, rejected)
- approved_by (admin user id, FK)
- approved_at (timestamp)
- rejection_reason (text, if rejected)
- suspended_at (timestamp, if suspended)
- suspension_reason (text)
- created_at
- updated_at
```

#### `agent_float`
```sql
- id (PK)
- agent_id (FK to agents)
- current_balance (decimal)
- daily_quota_remaining (integer) - resets daily
- daily_quota_limit (integer) - calculated from balance
- last_quota_reset (timestamp)
- created_at
- updated_at
```

#### `agent_float_transactions`
```sql
- id (PK)
- agent_id (FK to agents)
- transaction_type (purchase, refund, usage)
- amount_zmw (decimal)
- requests_allocated (integer)
- payment_method (mobile_money, bank, manual)
- payment_reference
- status (pending, completed, failed)
- notes
- created_at
- updated_at
```

#### `ticket_requests`
```sql
- id (PK)
- user_id (FK to users - main app)
- from_city
- to_city
- travel_date
- passenger_count
- passenger_names (JSON array)
- contact_phone
- contact_email
- preferred_operator (optional)
- status (open, claimed_by_agent, completed, expired)
- agent_id (FK to agents - null until claimed)
- agent_claimed_at (timestamp)
- request_expires_at (24 hours from creation)
- created_at
```

#### `agent_processed_tickets`
```sql
- id (PK)
- ticket_request_id (FK)
- agent_id (FK)
- passenger_name
- seat_number
- bus_id (FK - selected bus)
- booking_reference (generated)
- receipt_image_url (uploaded receipt/ticket photo)
- receipt_verification_status (pending, verified, rejected)
- verified_by (admin user id)
- user_sms_sent (boolean)
- user_sms_sent_at (timestamp)
- notes_to_user
- created_at
- updated_at
```

#### `agent_daily_quota_logs`
```sql
- id (PK)
- agent_id (FK)
- date (date field, for daily tracking)
- requests_viewed (integer)
- quota_limit (integer)
- float_balance_on_date (decimal)
- created_at
```

## 5. Key Features

### 5.1 Agent Registration Flow
1. Agent enters phone number on agent app
2. Optional: Profile details (name, ID type, ID number, location)
3. Application marked as "pending_review"
4. Admin reviews and calls operator to verify agent legitimacy
5. Admin approves/rejects with reason
6. Agent notified via SMS
7. Approved agents receive welcome package with float instructions

### 5.2 Float Purchase Flow
1. Agent goes to "Buy Float" section
2. Shows current balance and daily quota
3. Offers packages: 10 ZMW (5 requests), 50 ZMW (25 requests), 100 ZMW (50 requests)
4. Payment via mobile money (Airtel Money/MTN Mobile)
5. Transaction logged immediately (pending status)
6. Webhook from payment provider confirms → float added
7. Agent receives SMS confirmation

### 5.3 Ticket Request Flow
1. User on main app creates booking request
   - From city, to city, travel date, passenger count
   - Contact details (phone, email)
   - Does NOT complete booking - just creates request
2. Request stored in `ticket_requests` table
3. Request expires after 24 hours if unclaimed
4. Request appears in agent app (if agent has float)

### 5.4 Agent Claiming Request Flow
1. Agent sees available requests (sorted by date, destination)
2. Agent taps request to view full details
   - Route, date, passenger names, contact phone
   - But NOT user identity (just "User #123")
3. System deducts 2 ZMW equivalent from daily quota
4. Request marked as "claimed_by_agent"
5. Agent now has full user contact to WhatsApp
6. Agent should:
   - Contact user on WhatsApp with bus options
   - Show bus times, prices, availability
   - Take passenger photo ID copy
   - Take payment (cash/mobile money - handled separately)
   - Generate receipt from physical receipt book
   - Upload receipt image to system
   - Send user WhatsApp message with ticket details + receipt image

### 5.5 Ticket Processing
1. Agent uploads receipt image to processed ticket
2. System stores receipt with date, agent, user, bus details
3. Admin reviews receipt (verification step)
4. Admin triggers SMS to user:
   - "Your booking for [BUS] on [DATE] has been confirmed"
   - "Booking reference: [REFERENCE]"
   - "Ticket receipt will be shared by [AGENT_NAME]"
5. User also receives email notification

### 5.6 Admin Review System
- Dashboard showing:
  - Pending agent applications with verification button
  - Recent agent transactions
  - Processed tickets awaiting verification
  - Agent performance (requests handled, completion rate)
  - Float audit trail

## 6. User Experience Flow

### Main App User (Booking Request)
```
Browse buses → Request booking (doesn't complete)
    ↓
Wait 1-5 minutes for agent to see request
    ↓
Agent WhatsApps user with ticket options
    ↓
User confirms seat, passenger details
    ↓
User pays agent (cash/mobile money)
    ↓
Agent uploads receipt to platform
    ↓
Admin verifies receipt
    ↓
User receives SMS: "Booking confirmed - reference: ICB202411050"
    ↓
User shares SMS with others as proof
    ↓
User sees booking in "My Bookings" on app
```

### Agent Experience (Processing Booking)
```
Agent buys 50 ZMW float → can see 25 requests/day
    ↓
Agent opens app → sees list of available requests
    ↓
Agent taps request → sees route, date, passenger names, user phone
    ↓
Agent WhatsApps user: "Hi, I can help you book a bus..."
    ↓
User confirms: "I need 2 seats on 12:00 Kitwe Express"
    ↓
Agent takes:
  - User payment
  - Passenger ID copies
  - Writes receipt in physical book
    ↓
Agent takes photo of receipt page
    ↓
Agent uploads receipt image in app
    ↓
System shows: "Receipt uploaded, awaiting verification"
    ↓
Admin reviews receipt (usually same day)
    ↓
Admin approves → SMS sent to user automatically
```

## 7. Admin Approval Workflow

### Agent Application Review
1. Admin sees "Pending Applications" tab
2. Shows: Phone, name, location, date submitted
3. Admin clicks to verify:
   - Calls operator to confirm agent legitimacy
   - Checks ID number in database
   - Calls agent to confirm phone number
4. Options: Approve, Reject (with reason), Request More Info
5. If approved:
   - Agent marked as "approved"
   - SMS sent to agent: "Welcome! Your application approved. First 50 ZMW float as welcome bonus"
   - 50 ZMW float added to agent account
6. If rejected:
   - SMS sent: "Your application was not approved. Reason: [reason]"

### Ticket Verification Workflow
1. Admin sees "Pending Receipts" tab
2. Shows: Agent name, user, route, date, receipt image
3. Admin verifies receipt:
   - Check passenger names match request
   - Check receipt has date, amount, agent signature
   - Check format is legitimate
4. Options: Approve Receipt, Request Clarification, Reject
5. If approved:
   - Create booking reference (ICB202411XXX)
   - Send SMS to user
   - Update ticket request status to "completed"

## 8. API Endpoints (Agent App Backend)

### Authentication
- POST /api/agent/register - Agent phone registration
- POST /api/agent/verify-otp - OTP verification
- POST /api/agent/login - Login with phone + PIN
- POST /api/agent/logout

### Float Management
- GET /api/agent/float/balance - Current balance & daily quota
- GET /api/agent/float/history - Transaction history
- POST /api/agent/float/purchase - Initiate float purchase
- POST /api/agent/float/purchase-webhook - Payment provider callback

### Ticket Requests
- GET /api/agent/requests - Available requests (paginated)
- GET /api/agent/requests/{id} - Request details
- POST /api/agent/requests/{id}/claim - Claim a request
- GET /api/agent/my-requests - Agent's claimed requests

### Ticket Processing
- POST /api/agent/tickets/{id}/upload-receipt - Upload receipt image
- GET /api/agent/tickets - Processed tickets by agent
- POST /api/agent/tickets/{id}/note - Add internal note

### Agent Profile
- GET /api/agent/profile - Agent details
- PUT /api/agent/profile - Update profile
- GET /api/agent/stats - Performance stats

## 9. Admin API Endpoints

### Agent Management
- GET /api/admin/agents/pending - Pending applications
- GET /api/admin/agents/{id} - Agent details
- POST /api/admin/agents/{id}/approve - Approve agent
- POST /api/admin/agents/{id}/reject - Reject application
- POST /api/admin/agents/{id}/suspend - Suspend agent
- GET /api/admin/agents/{id}/transactions - Agent float transactions

### Ticket Verification
- GET /api/admin/tickets/pending-verification - Pending receipts
- GET /api/admin/tickets/{id} - Receipt details
- POST /api/admin/tickets/{id}/verify - Verify receipt
- POST /api/admin/tickets/{id}/reject - Reject receipt
- POST /api/admin/tickets/{id}/send-sms - Send SMS to user

### Reporting
- GET /api/admin/agents/stats - Agent performance
- GET /api/admin/floats/audit - Float transactions audit
- GET /api/admin/tickets/stats - Ticket processing stats

## 10. SMS Integration

### User Notifications
1. Booking request created: "Your booking request posted. Agent will contact you in minutes."
2. Agent processing: Auto-sent after admin verification
3. Booking confirmed: "Your [ROUTE] booking is confirmed. Ref: [REF]"

### Agent Notifications
1. Approved: "Welcome to IntercityBookings! Your agent account approved."
2. Float purchased: "100 ZMW float added. Can now see 50 requests/day."
3. Request available: "New request available: Lusaka→Kitwe, 2 passengers"

## 11. Security Considerations

- Agent phone numbers are unique and verified
- Agent IDs are verified against government databases
- Float transactions are audited
- Receipt images are stored securely
- User personal info not visible to unapproved agents
- Admin approval required before agents see real requests
- Rate limiting on request viewing
- SMS opt-in by users

## 12. Rollout Plan

Phase 1: Admin system (agent applications, verification)
Phase 2: Agent app backend (authentication, float, requests)
Phase 3: Agent mobile app UI (React Native/Flutter)
Phase 4: User app integration (booking requests instead of direct booking)
Phase 5: SMS provider integration
Phase 6: Payment provider integration (mobile money)

---

**Status**: Ready for implementation
