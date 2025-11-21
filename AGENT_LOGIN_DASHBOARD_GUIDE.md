# Agent Login & Dashboard Guide

## Test Agent Credentials

```
Agent ID: 10
Phone Number: +260979010638
PIN: 1234
Name: Test Agent
Status: Approved
```

---

## Complete Agent Journey

### 1. Registration → OTP → Approval (Already Completed)
The test agent (ID: 10) has already gone through:
- ✅ Registration with phone number
- ✅ OTP verification
- ✅ Admin approval
- ✅ 50 ZMW welcome bonus received
- ✅ Float account created with 25 daily quota

---

## Agent Login

### Endpoint
```
POST /api/agent/login
```

### Request
```bash
curl -X POST http://localhost:3001/api/agent/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+260979010638",
    "pin": "1234"
  }'
```

### Response
```json
{
  "message": "Login successful",
  "agent": {
    "id": 10,
    "phoneNumber": "+260979010638",
    "firstName": "Test",
    "lastName": "Agent",
    "locationCity": "Lusaka",
    "status": "approved"
  },
  "token": "agent_10_1763761649794"
}
```

### Key Points
- Login requires approved status
- PIN must match stored value
- Token is returned for future requests
- Agent details are returned upon login

---

## Agent Dashboard Data

Once logged in, the agent can view their dashboard with the following information:

### 1. Float Balance
```bash
GET /api/agent/float/balance?agentId=10
```

**Response:**
```json
{
  "agentId": 10,
  "currentBalance": 148,
  "dailyQuotaRemaining": 49,
  "dailyQuotaLimit": 50,
  "lastQuotaReset": "2025-11-21T21:40:50.745Z",
  "requestsPerZMW": 0.5
}
```

**Dashboard Display:**
- Current Balance: **148 ZMW**
- Daily Quota: **49/50 requests** remaining
- Cost per Request: **2 ZMW**
- Balance Composition:
  - 50 ZMW (welcome bonus)
  - 50 ZMW (float purchase)
  - 48 ZMW (from referral bonus, minus 2 ZMW claim cost)

---

### 2. Performance Tier
```bash
GET /api/agent/performance?agentId=10
```

**Response:**
```json
{
  "agentId": 10,
  "currentTier": "bronze",
  "tierLabel": "Bronze",
  "totalRequestsCompleted": 0,
  "totalRevenue": 0,
  "costPerRequest": 2,
  "bonusPercentage": 0,
  "tiers": [
    {
      "tier": "bronze",
      "label": "Bronze",
      "minRequests": 0,
      "costPerRequest": "2",
      "bonusPercentage": 0,
      "benefits": ["Access to booking requests", "Real-time notifications"],
      "unlocked": true
    },
    {
      "tier": "silver",
      "label": "Silver",
      "minRequests": 50,
      "costPerRequest": "1.5",
      "bonusPercentage": 10,
      "benefits": ["25% lower request cost", "10% float bonus on purchases", "Priority support"],
      "unlocked": false
    },
    {
      "tier": "gold",
      "label": "Gold",
      "minRequests": 200,
      "costPerRequest": "1",
      "bonusPercentage": 20,
      "benefits": ["50% lower request cost", "20% float bonus on purchases", "Dedicated account manager"],
      "unlocked": false
    },
    {
      "tier": "platinum",
      "label": "Platinum",
      "minRequests": 500,
      "costPerRequest": "0.5",
      "bonusPercentage": 30,
      "benefits": ["75% lower request cost", "30% float bonus", "Custom commission rates"],
      "unlocked": false
    }
  ],
  "nextTierIn": {
    "tier": "silver",
    "requestsNeeded": 50
  }
}
```

**Dashboard Display:**
- Current Tier: **Bronze**
- Requests Completed: **0**
- Next Milestone: **Silver** (need 50 requests)
- Request Cost at Current Tier: **2 ZMW**
- Tier Benefits: Access to requests, real-time notifications

---

### 3. Referral System
```bash
GET /api/agent/referrals?agentId=10
```

**Response:**
```json
{
  "agentId": 10,
  "referralsMade": 1,
  "referralsReceived": 0,
  "bonusEarned": 50,
  "referralCode": "AG000010",
  "details": {
    "made": [
      {
        "id": 1,
        "referrerAgentId": 10,
        "referredAgentId": 12,
        "bonusZmw": "50.00",
        "status": "credited",
        "createdAt": "2025-11-21T21:42:50.478Z",
        "creditedAt": "2025-11-21T21:42:50.114Z"
      }
    ],
    "received": []
  }
}
```

**Dashboard Display:**
- Referral Code: **AG000010** (share with friends)
- Referrals Made: **1** (Agent 12)
- Bonus Earned: **50 ZMW**
- Referrals Received: **0**
- Next Bonus: 50 ZMW when someone else uses your code

**How to Share:**
- Agent can share code `AG000010` with others
- When they register and are approved
- Both agents get 50 ZMW bonus

---

### 4. Available Requests
```bash
GET /api/agent/requests?agentId=10&page=1&limit=10
```

**Response:**
```json
{
  "requests": [
    {
      "id": 3,
      "fromCity": "Livingstone",
      "toCity": "Lusaka",
      "travelDate": "2025-11-26T20:33:18.593Z",
      "passengerCount": 3,
      "contactPhone": null,
      "contactEmail": null,
      "preferredOperator": "Zambian Eagle Coaches",
      "createdAt": "2025-11-21T20:33:18.920Z",
      "expiresAt": "2025-11-22T20:33:18.593Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "quotaRemaining": 49,
  "costPerRequest": 2
}
```

**Dashboard Display:**
- Available Requests: **1**
- Cost per Request: **2 ZMW**
- Your Quota: **49 requests** can claim today
- Routes shown with dates and passenger info
- Contact info hidden until claimed

---

### 5. Bonuses
```bash
GET /api/agent/bonuses?agentId=10
```

**Response:**
```json
{
  "agentId": 10,
  "bonuses": [],
  "totalUnclaimed": 0
}
```

**Dashboard Display:**
- Active Bonuses: **None currently**
- Total Bonus Value: **0 ZMW**
- Bonuses unlock through:
  - Completing milestones (100, 500, 1000 requests)
  - Daily challenges (complete 10 requests)
  - Referral program bonuses

---

### 6. Transaction History
```bash
GET /api/agent/float/history?agentId=10&limit=10
```

**Response:**
```json
{
  "agentId": 10,
  "transactions": [
    {
      "id": 2,
      "type": "usage",
      "amount": 2,
      "requestsAllocated": 1,
      "status": "completed",
      "createdAt": "2025-11-21T21:41:20.971Z"
    },
    {
      "id": 1,
      "type": "purchase",
      "amount": 50,
      "requestsAllocated": 25,
      "paymentMethod": "airtel_money",
      "paymentReference": "TEST1763761251",
      "status": "pending",
      "notes": "Purchase of 50 ZMW for 25 requests",
      "createdAt": "2025-11-21T21:40:53.406Z"
    }
  ],
  "total": 2
}
```

**Dashboard Display:**
- Transaction History:
  1. **50 ZMW Purchase** (pending payment confirmation)
  2. **2 ZMW Deducted** (claimed 1 request)
- Total Balance Changes: **+48 ZMW** (after welcome bonus and claim)

---

### 7. Processed Tickets
```bash
GET /api/agent/tickets?agentId=10&status=all
```

**Response:**
```json
{
  "agentId": 10,
  "tickets": [
    {
      "id": 1,
      "ticketRequestId": 2,
      "passengerName": "Mary Chipenge",
      "seatNumber": "A5",
      "bookingReference": "ICB2511212769",
      "receiptImageUrl": "https://example.com/receipt.png",
      "receiptVerificationStatus": "verified",
      "userSmsSent": false,
      "createdAt": "2025-11-21T21:41:50.487Z",
      "updatedAt": "2025-11-21T21:42:02.797Z"
    }
  ],
  "total": 1
}
```

**Dashboard Display:**
- Processed Tickets: **1**
- Booking Reference: **ICB2511212769**
- Status: **Verified** by admin
- Passenger: **Mary Chipenge**
- Date Created: **Nov 21, 2025**

---

## Complete Dashboard Summary

### Profile Section
```
👤 Test Agent
   Phone: +260979010638
   Location: Lusaka
   Status: ✅ Approved
   Member Since: Oct 2025
```

### Financial Summary
```
💰 Wallet: 148 ZMW
   Daily Quota: 49/50 requests
   Cost per Request: 2 ZMW

   Breakdown:
   • Welcome Bonus: 50 ZMW
   • Float Purchased: 50 ZMW
   • Referral Bonus: 50 ZMW
   • Claimed Requests: -2 ZMW
```

### Performance
```
📈 Current Tier: Bronze
   Requests Completed: 0
   Next Tier: Silver (need 50 more)

   Tier Progression:
   • Bronze (0 requests): 2 ZMW per request
   • Silver (50 requests): 1.5 ZMW per request
   • Gold (200 requests): 1 ZMW per request
   • Platinum (500 requests): 0.5 ZMW per request
```

### Growth Opportunities
```
🚀 Referral Code: AG000010
   • Share with friends
   • Get 50 ZMW when they register
   • They also get 50 ZMW
   • Referrals Made: 1
   • Bonus Earned: 50 ZMW
```

### Recent Activity
```
📋 Latest Transactions:
   1. Claimed request (#3): -2 ZMW (49 quota remaining)
   2. Purchased float: +50 ZMW (+25 requests)
   3. Received welcome bonus: +50 ZMW (+25 requests)

📝 Processed Tickets:
   • Mary Chipenge (ICB2511212769) - ✅ Verified
```

### Next Actions
```
✅ View more available requests
✅ Claim another request (49 quota remaining)
✅ Purchase more float (need 10 ZMW minimum)
✅ Share referral code AG000010
✅ Track earnings and performance
```

---

## Testing Additional Agent Credentials

### Agent 11
```
Agent ID: 11
Phone: +260979XXXXXX (registered during test)
PIN: 1234
Status: Approved
Balance: 100 ZMW (50 welcome + 50 referral)
```

### Agent 12
```
Agent ID: 12
Phone: +260979XXXXXX (registered during test)
PIN: 1234
Status: Approved
Balance: 100 ZMW (50 welcome + 50 referral)
```

---

## API Endpoints Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/agent/login` | POST | Agent login with PIN |
| `/api/agent/float/balance` | GET | Current balance & quota |
| `/api/agent/float/purchase` | POST | Buy float credit |
| `/api/agent/float/history` | GET | Transaction history |
| `/api/agent/requests` | GET | List available requests |
| `/api/agent/requests/[id]/claim` | POST | Claim a request |
| `/api/agent/performance` | GET | Tier & progress info |
| `/api/agent/referrals` | GET | Referral code & stats |
| `/api/agent/bonuses` | GET | Available bonuses |
| `/api/agent/tickets` | GET | Processed tickets |
| `/api/agent/tickets/upload-receipt` | POST | Upload ticket receipt |

---

## PIN Setup for New Agents

If you register a new agent, you can set their PIN:

```bash
curl -X POST http://localhost:3001/api/agent/set-pin \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": 13,
    "phoneNumber": "+260979123456",
    "pin": "5678"
  }'
```

**Response:**
```json
{
  "message": "PIN set successfully",
  "agentId": 13,
  "phoneNumber": "+260979123456",
  "name": "Agent Name",
  "readyToLogin": true
}
```

---

## Production Checklist

Before deploying to production:

- [ ] Remove test PINs from login endpoint
- [ ] Implement proper PIN hashing (bcrypt)
- [ ] Store PINs in database, not memory
- [ ] Implement JWT tokens with expiration
- [ ] Add rate limiting to login endpoint
- [ ] Implement session management
- [ ] Add password reset flow
- [ ] Implement 2FA for sensitive operations
- [ ] Add request signing/verification
- [ ] Implement proper error logging

---

## Notes

1. **Test Mode**: System is in test mode with demo PINs set to "1234"
2. **Daily Quota Reset**: Automatically resets at midnight UTC
3. **Request Expiry**: Requests expire 24 hours after posting
4. **Float Balance**: Decimal precision for financial accuracy
5. **Referral Code Format**: `AG` + 6-digit agent ID (e.g., AG000010)

