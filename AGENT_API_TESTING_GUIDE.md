# Agent System API Testing Guide

## Quick Start

### 1. Agent Registration

```bash
curl -X POST http://localhost:3001/api/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+260971234567",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "idType": "national_id",
    "idNumber": "123456789",
    "locationCity": "Lusaka",
    "locationAddress": "Main Street",
    "referralCode": ""
  }'
```

**Response**:
```json
{
  "message": "Agent registered successfully. OTP sent to phone.",
  "agentId": 1,
  "phoneNumber": "+260971234567"
}
```

**Console Output** (Development):
```
[DEV] OTP for +260971234567: 123456
```

---

### 2. OTP Verification

```bash
curl -X POST http://localhost:3001/api/agent/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+260971234567",
    "otp": "123456"
  }'
```

**Response**:
```json
{
  "message": "OTP verified successfully",
  "phoneNumber": "+260971234567",
  "verified": true
}
```

---

### 3. Agent Login

After admin approval, agent can login:

```bash
curl -X POST http://localhost:3001/api/agent/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+260971234567",
    "pin": "1234"
  }'
```

**Response**:
```json
{
  "message": "Login successful",
  "agent": {
    "id": 1,
    "phoneNumber": "+260971234567",
    "firstName": "John",
    "lastName": "Doe",
    "locationCity": "Lusaka",
    "status": "approved"
  },
  "token": "agent_1_1732190400000"
}
```

---

### 4. Check Float Balance

```bash
curl http://localhost:3001/api/agent/float/balance?agentId=1
```

**Response** (after approval with 50 ZMW welcome bonus):
```json
{
  "agentId": 1,
  "currentBalance": 50,
  "dailyQuotaRemaining": 25,
  "dailyQuotaLimit": 25,
  "lastQuotaReset": "2024-11-21T00:00:00Z",
  "requestsPerZMW": 0.5
}
```

---

### 5. View Available Requests

```bash
curl "http://localhost:3001/api/agent/requests?agentId=1&page=1&limit=10"
```

**Response**:
```json
{
  "requests": [
    {
      "id": 1,
      "fromCity": "Lusaka",
      "toCity": "Kitwe",
      "travelDate": "2024-11-23T06:00:00Z",
      "passengerCount": 2,
      "contactPhone": null,
      "contactEmail": null,
      "preferredOperator": "Juldan Motors",
      "createdAt": "2024-11-21T10:00:00Z",
      "expiresAt": "2024-11-22T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "quotaRemaining": 25,
  "costPerRequest": 2
}
```

---

### 6. View Request Details

```bash
curl "http://localhost:3001/api/agent/requests/1?agentId=1"
```

**Response** (contact details now visible):
```json
{
  "id": 1,
  "fromCity": "Lusaka",
  "toCity": "Kitwe",
  "travelDate": "2024-11-23T06:00:00Z",
  "passengerCount": 2,
  "passengerNames": ["Jane Doe", "John Doe Jr."],
  "contactPhone": "+260971234567",
  "contactEmail": "jane@example.com",
  "preferredOperator": "Juldan Motors",
  "status": "open",
  "createdAt": "2024-11-21T10:00:00Z",
  "expiresAt": "2024-11-22T10:00:00Z",
  "costPerRequest": 2,
  "message": "You can now view full contact details. Click 'Claim Request' to proceed."
}
```

---

### 7. Claim Request

```bash
curl -X POST http://localhost:3001/api/agent/requests/1/claim \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": 1
  }'
```

**Response**:
```json
{
  "message": "Request claimed successfully",
  "requestId": 1,
  "contactPhone": "+260971234567",
  "contactEmail": "jane@example.com",
  "passengerNames": ["Jane Doe", "John Doe Jr."],
  "fromCity": "Lusaka",
  "toCity": "Kitwe",
  "travelDate": "2024-11-23T06:00:00Z",
  "passengerCount": 2,
  "newBalance": 48,
  "quotaRemaining": 24,
  "nextSteps": "Contact the customer via WhatsApp to discuss bus options and complete the booking."
}
```

**What happened**:
- 2 ZMW deducted from balance (48 remaining)
- Daily quota reduced by 1 (24 remaining)
- Request marked as "claimed_by_agent"
- Floating transaction recorded
- Daily quota log created

---

### 8. Purchase Float

```bash
curl -X POST http://localhost:3001/api/agent/float/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": 1,
    "amountZmw": 100,
    "paymentMethod": "airtel_money",
    "paymentReference": "TXN123456"
  }'
```

**Response**:
```json
{
  "message": "Float purchase initiated",
  "transactionId": 1,
  "amountZmw": "100",
  "requestsAllocated": 50,
  "newBalance": "148",
  "status": "pending",
  "nextSteps": "Send payment to +260773962307 via Airtel Money or MTN Mobile Money. Payment will be confirmed within minutes."
}
```

---

### 9. View Float History

```bash
curl "http://localhost:3001/api/agent/float/history?agentId=1&limit=50"
```

**Response**:
```json
{
  "agentId": 1,
  "transactions": [
    {
      "id": 1,
      "type": "purchase",
      "amount": 100,
      "requestsAllocated": 50,
      "paymentMethod": "airtel_money",
      "paymentReference": "TXN123456",
      "status": "pending",
      "notes": "Purchase of 100 ZMW for 50 requests",
      "createdAt": "2024-11-21T12:00:00Z"
    },
    {
      "id": 2,
      "type": "usage",
      "amount": 2,
      "requestsAllocated": 1,
      "paymentMethod": null,
      "paymentReference": null,
      "status": "completed",
      "notes": "Claimed request #1",
      "createdAt": "2024-11-21T13:00:00Z"
    }
  ],
  "total": 2
}
```

---

### 10. Upload Receipt

After completing booking, upload receipt:

```bash
curl -X POST http://localhost:3001/api/agent/tickets/upload-receipt \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": 1,
    "ticketRequestId": 1,
    "passengerName": "Jane Doe",
    "seatNumber": "12A",
    "busId": 1,
    "receiptImageUrl": "https://example.com/receipt-photo.jpg"
  }'
```

**Response**:
```json
{
  "message": "Receipt uploaded successfully",
  "processedTicketId": 1,
  "bookingReference": "ICB241121001",
  "status": "pending_verification",
  "nextSteps": "Your receipt is under review. You will receive SMS confirmation once verified."
}
```

---

### 11. View Processed Tickets

```bash
curl "http://localhost:3001/api/agent/tickets?agentId=1&status=pending&limit=50"
```

**Response**:
```json
{
  "agentId": 1,
  "tickets": [
    {
      "id": 1,
      "bookingReference": "ICB241121001",
      "passengerName": "Jane Doe",
      "seatNumber": "12A",
      "receiptImageUrl": "https://example.com/receipt-photo.jpg",
      "status": "pending",
      "userSmsSent": false,
      "createdAt": "2024-11-21T14:00:00Z",
      "updatedAt": "2024-11-21T14:00:00Z"
    }
  ],
  "total": 1
}
```

---

### 12. Check Referrals

```bash
curl "http://localhost:3001/api/agent/referrals?agentId=1"
```

**Response**:
```json
{
  "agentId": 1,
  "referralsMade": 0,
  "referralsReceived": 0,
  "bonusEarned": 0,
  "referralCode": "AG000001",
  "details": {
    "made": [],
    "received": []
  }
}
```

---

### 13. Record Referral

```bash
curl -X POST http://localhost:3001/api/agent/referrals \
  -H "Content-Type: application/json" \
  -d '{
    "referrerAgentId": 1,
    "referralCode": "AG000002"
  }'
```

**Response**:
```json
{
  "message": "Referral recorded successfully",
  "referral": {
    "id": 1,
    "referrerAgentId": 1,
    "referredAgentId": 2,
    "bonusZmw": "50",
    "status": "credited",
    "createdAt": "2024-11-21T15:00:00Z",
    "creditedAt": "2024-11-21T15:00:00Z"
  },
  "bonusAwarded": {
    "referrer": "50 ZMW",
    "referred": "50 ZMW"
  }
}
```

---

### 14. Check Performance Tier

```bash
curl "http://localhost:3001/api/agent/performance?agentId=1"
```

**Response**:
```json
{
  "agentId": 1,
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
    }
  ],
  "nextTierIn": {
    "tier": "silver",
    "requestsNeeded": 50
  }
}
```

---

### 15. View Bonuses

```bash
curl "http://localhost:3001/api/agent/bonuses?agentId=1&unclaimed=true"
```

**Response**:
```json
{
  "agentId": 1,
  "bonuses": [
    {
      "id": 1,
      "type": "referral",
      "amount": 50,
      "description": "Referred Agent #2",
      "expiresAt": "2024-12-21T23:59:59Z",
      "claimed": false,
      "claimedAt": null,
      "createdAt": "2024-11-21T15:00:00Z"
    }
  ],
  "totalUnclaimed": 50
}
```

---

### 16. Claim Bonus

```bash
curl -X POST http://localhost:3001/api/agent/bonuses \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": 1,
    "bonusId": 1
  }'
```

**Response**:
```json
{
  "message": "Bonus claimed successfully",
  "bonusId": 1,
  "amount": 50,
  "message2": "Float has been added to your account"
}
```

---

## Admin APIs

### 1. Get All Tickets for Verification

```bash
curl "http://localhost:3001/api/admin/tickets?status=pending"
```

### 2. Verify Receipt

```bash
curl -X POST http://localhost:3001/api/admin/tickets/1/verify \
  -H "Content-Type: application/json" \
  -d '{
    "sendSMS": true
  }'
```

**Response**:
```json
{
  "message": "Ticket verified successfully",
  "ticketId": 1,
  "smsSent": true
}
```

### 3. Reject Receipt

```bash
curl -X POST http://localhost:3001/api/admin/tickets/1/reject \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Receipt image is unclear, please resubmit with better lighting"
  }'
```

**Response**:
```json
{
  "message": "Ticket rejected",
  "ticketId": 1,
  "reason": "Receipt image is unclear, please resubmit with better lighting"
}
```

---

## Common Test Scenarios

### Scenario 1: Complete Agent Journey (Agent Earns)

1. **Register**: Agent creates account
2. **OTP Verify**: Confirms phone
3. **Wait for approval**: Admin approves → 50 ZMW welcome bonus
4. **Login**: Agent logs in
5. **Check balance**: 50 ZMW available
6. **View requests**: 10 booking requests available
7. **View details**: Click request 1, see customer details
8. **Claim**: Book the request (2 ZMW deducted)
9. **WhatsApp**: Contact customer (happens outside platform)
10. **Complete**: Agent collects payment, uploads receipt
11. **Verify**: Admin verifies receipt, sends SMS to customer
12. **Earn**: Agent gets commission from customer

### Scenario 2: Agent Upgrades Tier

1. Agent completes 50 requests
2. Tier automatically upgrades to "Silver"
3. Cost drops from 2 ZMW to 1.5 ZMW per request
4. Bonus: Next purchases get +10% float
5. Bonus notification sent
6. Agent can claim bonus from dashboard

### Scenario 3: Referral Growth Loop

1. Agent 1 shares code "AG000001"
2. Agent 2 registers with code
3. Agent 2 gets approved
4. Both agents get +50 ZMW bonus
5. Agent 1 sees referral in dashboard
6. Agent 1 can earn up to 10 referrals = 500 ZMW total

---

## Error Cases to Test

### 400 Bad Request
```bash
# Missing required field
curl -X POST http://localhost:3001/api/agent/register \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+260971234567"}'
# Error: Missing required fields
```

### 404 Not Found
```bash
curl "http://localhost:3001/api/agent/requests/999?agentId=1"
# Error: Request not found
```

### 402 Payment Required
```bash
curl -X POST http://localhost:3001/api/agent/requests/1/claim \
  -H "Content-Type: application/json" \
  -d '{"agentId": 1}'
# Error: Insufficient float or daily quota (when balance < 2 ZMW)
```

### 403 Forbidden
```bash
# Non-approved agent tries to login
curl -X POST http://localhost:3001/api/agent/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+260971234567", "pin": "1234"}'
# Error: Agent status is pending_review. Only approved agents can login.
```

---

## Tips for Testing

1. **OTP Code**: Printed to console in development mode `[DEV] OTP for...`
2. **Agent ID**: Returned from registration endpoint
3. **Booking Reference**: Format `ICBYYMMDDxxxx` generated on receipt upload
4. **Referral Code**: Format `AGXXXXXX` where X = agent ID padded to 6 digits
5. **Dates**: All returned as ISO 8601 format
6. **Amounts**: Returned as numbers or decimals (strings for large amounts)

---

## Browser Testing

Landing page: http://localhost:3001/agent
Admin agents: http://localhost:3001/dashboard/agents
Admin tickets: http://localhost:3001/dashboard/tickets
Admin growth: http://localhost:3001/dashboard/growth

---

## Production Checklist

- [ ] Connect real SMS provider (Twilio/local)
- [ ] Set up payment provider webhooks (Airtel/MTN)
- [ ] Configure image storage (S3/Cloudinary)
- [ ] Set rate limiting on APIs
- [ ] Add request validation
- [ ] Implement logging & monitoring
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Create admin user accounts
- [ ] Test SMS delivery
- [ ] Test payment processing
- [ ] Load testing on APIs
