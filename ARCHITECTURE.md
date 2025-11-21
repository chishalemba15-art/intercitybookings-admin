# InterCity Agent Platform - System Architecture

## High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS (Main App)                        │
│                                                                 │
│  Browse buses → Create booking request → Wait for agent        │
│                 (stored in ticket_requests table)              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │      CENTRAL DATABASE (PostgreSQL)      │
        │                                        │
        │  ├─ operators                          │
        │  ├─ routes                             │
        │  ├─ buses                              │
        │  ├─ bookings                           │
        │  ├─ agents                             │
        │  ├─ agent_float                        │
        │  ├─ agent_float_transactions           │
        │  ├─ ticket_requests                    │
        │  ├─ agent_processed_tickets            │
        │  ├─ agent_daily_quota_logs             │
        │  ├─ agent_referrals                    │
        │  ├─ agent_performance_tiers            │
        │  └─ agent_bonuses                      │
        └────┬─────────────────┬─────────────────┘
             │                 │
             ▼                 ▼
    ┌──────────────────┐  ┌──────────────────┐
    │  Admin Dashboard │  │   Agent App      │
    │   (Next.js)      │  │  (Mobile/Web)    │
    │                  │  │                  │
    │ ├─ Agents        │  │ ├─ Registration  │
    │ ├─ Tickets       │  │ ├─ Login         │
    │ ├─ Verification  │  │ ├─ Float mgmt    │
    │ └─ Growth        │  │ ├─ Requests      │
    │                  │  │ ├─ Receipt upload│
    │                  │  │ └─ Performance   │
    └──────────────────┘  └──────────────────┘
             │                      │
             └──────────┬───────────┘
                        ▼
            ┌─────────────────────────┐
            │   Backend APIs (Next.js) │
            │                         │
            │ /api/agent/*            │
            │ /api/admin/tickets/*    │
            │ /api/admin/agents/*     │
            └────────┬────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌────────┐ ┌─────────┐ ┌──────────┐
    │  SMS   │ │ Payment │ │  Image   │
    │Provider│ │ Provider│ │ Storage  │
    │        │ │         │ │          │
    │Twilio/ │ │Airtel   │ │ S3/      │
    │Local   │ │MTN      │ │Cloudinary│
    └────────┘ └─────────┘ └──────────┘
```

---

## Component Architecture

### 1. Agent Public Facing

```
www.intercity.zm/agent (Landing Page)
│
├─ Hero Section
│  └─ CTA: Register Button
│
├─ Value Proposition
│  ├─ Real-Time Requests
│  ├─ Flexible Pricing
│  └─ Instant Payments
│
├─ How It Works (4 Steps)
│  ├─ Register Free
│  ├─ Buy Float
│  ├─ See Requests
│  └─ Earn Commission
│
├─ Earnings Showcase
│  ├─ Part-Time Tier
│  ├─ Full-Time Tier
│  └─ Top Agents Tier
│
├─ Social Proof
│  └─ 3 Agent Testimonials
│
├─ FAQ Section
│  └─ 6 Common Questions
│
└─ Registration Modal
   ├─ Step 1: Form
   │  ├─ Personal Info (name, email)
   │  ├─ Phone Number
   │  ├─ ID Details
   │  ├─ Location
   │  └─ Optional Referral Code
   ├─ Step 2: OTP Verification
   │  └─ 6-digit SMS code
   └─ Step 3: Success
      ├─ Application submitted
      └─ Next steps (admin review)
```

### 2. Admin Dashboard

```
/dashboard/agents (Existing)
│
├─ Pending Applications Tab
│  └─ Card Grid: Agent Details + Review Button
│
├─ Approved Agents Tab
│  └─ Table: Agent performance metrics
│
└─ Suspended Agents Tab
   └─ Table: Inactive agents

/dashboard/tickets (New)
│
├─ Pending Verification Tab
│  └─ Card Grid: Receipt images + Review Button
│
├─ Verified Tab
│  └─ Table: Processed tickets
│
└─ Rejected Tab
   └─ Table: Failed receipts with reason

/dashboard/growth (New)
│
├─ Key Metrics (6 cards)
│  ├─ Total Agents
│  ├─ Approved Agents
│  ├─ Requests Processed
│  ├─ Revenue Generated
│  ├─ Avg Earnings/Agent
│  └─ Churn Rate
│
├─ Growth Mechanics (2 cards)
│  ├─ Referral Program Status
│  └─ Performance Tiers Breakdown
│
├─ Active Bonus Programs (4 cards)
│  ├─ Referral Bonus
│  ├─ Tier Upgrade Bonus
│  ├─ Milestone Bonus
│  └─ Daily Challenge
│
└─ Top Agents Table
   └─ Leaderboard with filters
```

---

## API Architecture

### Agent APIs

```
POST /api/agent/register
├─ Input: Personal info, ID, location
├─ Process: Create agent, generate OTP
└─ Output: Agent ID, OTP sent message

POST /api/agent/verify-otp
├─ Input: Phone, OTP code
├─ Process: Validate OTP, update status
└─ Output: Verification success

POST /api/agent/login
├─ Input: Phone, PIN
├─ Process: Check status, validate credentials
└─ Output: Agent details, session token

GET /api/agent/float/balance
├─ Input: Agent ID
├─ Process: Get float account, check quota reset
└─ Output: Balance, daily quota, cost per request

GET /api/agent/float/history
├─ Input: Agent ID, limit
├─ Process: Query transactions
└─ Output: Transaction list (purchase, usage, refund)

POST /api/agent/float/purchase
├─ Input: Agent ID, amount, payment method
├─ Process: Create transaction, update balance
└─ Output: Transaction ID, new balance, payment steps

GET /api/agent/requests
├─ Input: Agent ID, page, limit
├─ Process: Query open requests, check quota
└─ Output: Request list (minimal info - no contact details)

GET /api/agent/requests/{id}
├─ Input: Agent ID, request ID
├─ Process: Get full request details
└─ Output: Full request with contact phone/email

POST /api/agent/requests/{id}/claim
├─ Input: Agent ID, request ID
├─ Process: Deduct float, update request status
├─ Side Effects:
│  ├─ Update agent_float (-2 ZMW, -1 quota)
│  ├─ Create agent_float_transactions (usage)
│  ├─ Update ticket_requests (claimed_by_agent)
│  └─ Create agent_daily_quota_logs
└─ Output: Full customer details, new balance

POST /api/agent/tickets/upload-receipt
├─ Input: Request ID, agent ID, passenger info, image URL
├─ Process: Create processed ticket, generate booking ref
└─ Output: Ticket ID, booking reference, "pending verification"

GET /api/agent/tickets
├─ Input: Agent ID, status filter, limit
├─ Process: Query processed tickets
└─ Output: Ticket list with verification status

GET /api/agent/referrals
├─ Input: Agent ID
├─ Process: Count referrals, calculate bonuses
└─ Output: Referral code, referrals made/received, bonus earned

POST /api/agent/referrals
├─ Input: Referrer Agent ID, referral code
├─ Process: Validate, create referral, add bonuses
├─ Side Effects:
│  ├─ Create agent_referrals
│  ├─ Update agent_float for both agents (+50 ZMW)
│  └─ Create agent_float_transactions
└─ Output: Referral created, bonuses awarded

GET /api/agent/performance
├─ Input: Agent ID
├─ Process: Calculate tier, get config
└─ Output: Current tier, benefits, next tier requirements

GET /api/agent/bonuses
├─ Input: Agent ID, unclaimed filter
├─ Process: Query bonuses
└─ Output: Bonus list with expiration/claim status

POST /api/agent/bonuses
├─ Input: Agent ID, bonus ID
├─ Process: Claim bonus, add to float
├─ Side Effects:
│  ├─ Mark bonus as claimed
│  └─ Update agent_float (+bonus amount)
└─ Output: Bonus claimed, float added
```

### Admin APIs

```
GET /api/admin/agents
├─ Input: Optional status filter
├─ Process: Query agents
└─ Output: Agent list

POST /api/admin/agents/{id}/approve
├─ Input: Agent ID, verification notes
├─ Process: Update status, create float account, add welcome bonus
├─ Side Effects:
│  ├─ Update agents (approved, approved_at, approvedBy)
│  ├─ Create agent_float (+50 ZMW)
│  └─ Send SMS to agent
└─ Output: Approval confirmed, welcome bonus

GET /api/admin/tickets
├─ Input: Optional status filter
├─ Process: Query processed tickets, enrich with agent/request info
└─ Output: Ticket list with full details

POST /api/admin/tickets/{id}/verify
├─ Input: Ticket ID, sendSMS flag
├─ Process: Update status, optionally send SMS
├─ Side Effects:
│  ├─ Update agentProcessedTickets (verified)
│  └─ Send SMS to user if enabled
└─ Output: Verification success

POST /api/admin/tickets/{id}/reject
├─ Input: Ticket ID, rejection reason
├─ Process: Update status, record reason
└─ Output: Rejection recorded
```

---

## Data Flow Examples

### Agent Registration & Approval Flow

```
┌─ User Registration (Frontend)
│  └─ POST /api/agent/register
│     ├─ Validate input
│     ├─ Check phone uniqueness
│     ├─ Check ID uniqueness
│     ├─ CREATE agents (status: pending_review)
│     ├─ Generate referral code (AGXXXXXX)
│     ├─ Generate OTP
│     ├─ Store OTP for 10 min
│     ├─ Send OTP via SMS
│     └─ Return agentId
│
├─ OTP Verification (Frontend)
│  └─ POST /api/agent/verify-otp
│     ├─ Validate OTP
│     ├─ Check expiration
│     ├─ Delete OTP from store
│     └─ Return verified: true
│
├─ Admin Review (Admin Dashboard)
│  └─ GET /dashboard/agents → shows pending list
│     └─ Click "Review Application"
│        └─ Modal shows:
│           ├─ ID details to verify
│           ├─ Location for verification call
│           └─ Options: Approve / Reject / Request Info
│
└─ Admin Approval
   └─ POST /api/admin/agents/{id}/approve
      ├─ Transaction:
      │  ├─ UPDATE agents (approved, approved_at)
      │  ├─ CREATE agent_float (balance: 50 ZMW)
      │  ├─ CREATE agentFloatTransactions (welcome bonus)
      │  └─ Send SMS: "Welcome! Your application approved..."
      └─ Return success, bonus details

   Now agent can:
   ├─ LOGIN with phone + PIN
   ├─ See float balance (50 ZMW)
   ├─ View available requests (25 per day)
   └─ Start claiming and processing bookings
```

### Agent Earning Flow

```
┌─ Agent logs in
│  └─ POST /api/agent/login
│     └─ Return: Agent details + token
│
├─ Check float balance
│  └─ GET /api/agent/float/balance?agentId=1
│     └─ Return: 50 ZMW, 25 requests available
│
├─ View available requests
│  └─ GET /api/agent/requests?agentId=1
│     └─ Return: List of 10 open requests (minimal info)
│
├─ View request details (customer contact info)
│  └─ GET /api/agent/requests/1?agentId=1
│     └─ Return: Full details including phone
│
├─ Claim request (contact customer)
│  └─ POST /api/agent/requests/1/claim
│     ├─ Transaction:
│     │  ├─ UPDATE agent_float (-2 ZMW)
│     │  ├─ UPDATE ticket_requests (claimed_by_agent)
│     │  ├─ CREATE agent_float_transactions (usage)
│     │  └─ CREATE agent_daily_quota_logs
│     ├─ Deduct 2 ZMW from balance (48 remaining)
│     ├─ Reduce daily quota by 1 (24 remaining)
│     └─ Return: Customer contact details, balance
│
├─ Agent WhatsApps customer (outside platform)
│  └─ Discusses bus options
│     └─ Customer confirms seats, pays agent
│
├─ Agent uploads receipt
│  └─ POST /api/agent/tickets/upload-receipt
│     ├─ CREATE agent_processed_tickets (status: pending)
│     ├─ Generate booking reference (ICB241121001)
│     ├─ UPDATE ticket_requests (completed)
│     └─ Return: Booking ref, "pending verification"
│
└─ Admin verifies receipt
   └─ GET /dashboard/tickets
      └─ Reviews receipt image
         └─ POST /api/admin/tickets/1/verify
            ├─ UPDATE agent_processed_tickets (verified)
            ├─ Send SMS to user: "Booking confirmed - ref: ICB..."
            └─ User receives notification

Agent completes first earning! 🎉
Agent can now claim more requests with remaining 48 ZMW
```

### Growth Through Referrals

```
Agent A (ID: 1, Referral Code: AG000001)
│
└─ Shares code with friend: "Use AG000001 when you register"
   │
   └─ Agent B registers with referral code: AG000001
      ├─ POST /api/agent/register (with referralCode: AG000001)
      └─ CREATE agents (status: pending_review, referralCode from input)
   │
   └─ Admin approves Agent B
      └─ Now both agents get referral bonus!
         │
         └─ POST /api/agent/referrals
            ├─ Transaction:
            │  ├─ CREATE agent_referrals (A→B, credited)
            │  ├─ UPDATE agent_float[A] (+50 ZMW)
            │  ├─ UPDATE agent_float[B] (+50 ZMW)
            │  ├─ CREATE agent_float_transactions for A (referral)
            │  └─ CREATE agent_float_transactions for B (referral)
            └─ Both agents get +50 ZMW instantly!

Agent A sees:
├─ +50 ZMW bonus in account
├─ Referral credit in referrals list
└─ Can now buy more float or process more requests

Agent B gets:
├─ +50 ZMW (welcome bonus from approval + referral bonus)
├─ 50 ZMW total to start = 25 requests/day
└─ Notification: "Thanks for the referral!"
```

### Performance Tier Progression

```
Agent starts as Bronze (0 requests completed)
│
├─ After 10 requests → Still Bronze
├─ After 25 requests → Still Bronze
├─ After 50 requests → AUTO UPGRADE TO SILVER ✨
│  ├─ GET /api/agent/performance
│  │  └─ Returns: tier: "silver", cost: 1.5 ZMW (25% savings)
│  │
│  ├─ CREATE agent_bonuses (silver_upgrade, 100 ZMW bonus)
│  │
│  ├─ Agent sees notification: "Tier upgraded! +100 ZMW bonus"
│  │
│  └─ POST /api/agent/bonuses/{bonusId}
│     └─ Bonus claimed, +100 ZMW added to float
│
├─ After 100 requests → Still Silver
├─ After 150 requests → Still Silver
├─ After 200 requests → AUTO UPGRADE TO GOLD ✨
│  └─ Cost drops to 1 ZMW (50% savings)
│     └─ Next 50 requests effectively free with savings!
│
└─ After 500 requests → AUTO UPGRADE TO PLATINUM ✨
   └─ Cost drops to 0.5 ZMW (75% savings!)
      └─ Top agents get massive return on investment
```

---

## Performance & Scalability

### Database Indexing Strategy

```
agents
├─ PRIMARY: id
├─ UNIQUE: phone_number
├─ UNIQUE: id_number
├─ UNIQUE: referral_code
└─ INDEX: status, created_at

agent_float
├─ PRIMARY: id
├─ UNIQUE: agent_id

agent_float_transactions
├─ PRIMARY: id
├─ INDEX: agent_id, created_at
└─ INDEX: status, transaction_type

ticket_requests
├─ PRIMARY: id
├─ INDEX: status, agent_id, request_expires_at
└─ INDEX: from_city, to_city, travel_date

agent_processed_tickets
├─ PRIMARY: id
├─ INDEX: agent_id, receipt_verification_status
└─ UNIQUE: booking_reference

agent_daily_quota_logs
├─ PRIMARY: id
├─ INDEX: agent_id, date

agent_referrals
├─ PRIMARY: id
├─ INDEX: referrer_agent_id, referred_agent_id
└─ INDEX: status
```

### Query Optimization

```
High-Frequency Queries:

1. GET /api/agent/float/balance
   ├─ SELECT agentFloat WHERE agentId = ?
   └─ Cached for 5 minutes

2. GET /api/agent/requests
   ├─ SELECT ticketRequests WHERE status='open'
   │  AND requestExpiresAt > NOW()
   ├─ LIMIT 20
   └─ Paginated, cached

3. GET /api/admin/tickets
   ├─ SELECT agentProcessedTickets WHERE status = ?
   ├─ JOIN agents, ticketRequests
   └─ Cached for 1 minute

Rate Limiting:
├─ Agent endpoints: 100 requests/min
├─ Admin endpoints: 500 requests/min
└─ Public endpoints: 10 requests/min
```

---

## Error Handling & Validation

```
Validation Layers:

1. Frontend (React)
   └─ Zod schema validation
      ├─ Phone number format
      ├─ OTP length
      └─ Form field required

2. API (Next.js)
   ├─ Type checking (TypeScript)
   ├─ Input validation (manual + Zod)
   ├─ Business logic validation
   └─ Database constraint validation

Error Responses:

400 Bad Request
├─ Validation failed
├─ Invalid input format
└─ Missing required fields

402 Payment Required
├─ Insufficient float
└─ Daily quota exceeded

403 Forbidden
├─ Agent not approved
├─ Accessing other agent's data
└─ Non-admin accessing admin endpoints

404 Not Found
├─ Agent not found
├─ Request expired
└─ Ticket not found

409 Conflict
├─ Phone already registered
├─ ID number already exists
└─ Request already claimed

500 Server Error
├─ Database error
├─ SMS provider error
└─ Unexpected error
```

---

## Security Architecture

```
Authentication
├─ Agent registration: Phone + OTP
├─ Agent login: Phone + PIN
└─ Admin: NextAuth (email + password)

Authorization
├─ Agent can only see own:
│  ├─ Float account
│  ├─ Claimed requests
│  ├─ Processed tickets
│  ├─ Referrals
│  └─ Performance data
└─ Admin can see all data

Data Protection
├─ User personal data hidden until agent claims
├─ Passwords hashed (bcrypt)
├─ OTP single-use, 10-min expiry
└─ Session tokens time-limited

Rate Limiting
├─ Registration: 5 per IP/hour
├─ Login attempts: 5 per hour
├─ OTP verification: 3 attempts
└─ API calls: 100 per agent/min

Audit Trail
├─ All float transactions logged
├─ Receipt verification recorded
├─ Admin actions tracked
└─ Referral bonuses documented
```

---

This architecture is designed for **growth**, **reliability**, and **auditability**.

Key principles:
- **Separation of concerns**: Agent, Admin, and Public APIs
- **Event-driven**: Major actions create audit logs
- **Incentive-aligned**: Growth mechanics built into data model
- **Scalable**: Proper indexing and caching
- **Secure**: Multi-layer validation and authorization
