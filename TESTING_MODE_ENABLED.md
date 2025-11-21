# Testing Mode Enabled - Agent System

## Overview

The agent system is now in **TEST MODE** with OTP sending disabled. All features work end-to-end without requiring SMS integration.

---

## Key Changes for Testing

### 1. Agent Registration
**Endpoint**: `POST /api/agent/register`

**Response includes test OTP**:
```json
{
  "message": "Agent registered successfully. Use OTP below for testing (SMS disabled).",
  "agentId": 8,
  "phoneNumber": "+260978888888",
  "testOTP": "994638",
  "testMessage": "This OTP is returned directly for testing. In production, it will be sent via SMS."
}
```

**What changed**:
- OTP is returned directly in response (no SMS sent)
- Console logs: `[TEST MODE] OTP for +260978888888: 994638`
- Easy to copy OTP from response

### 2. OTP Verification
**Endpoint**: `POST /api/agent/verify-otp`

**Test Mode Features**:
- Accepts **any 6-digit OTP** for any phone number
- No need to match stored OTP (in-memory store resets on server restart)
- Console logs: `[TEST MODE] Accepting OTP 994638 for +260978888888`
- Perfect for testing registration flow without SMS provider

**Example**:
```bash
curl -X POST http://localhost:3001/api/agent/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+260978888888","otp":"994638"}'
```

---

## Complete Testing Flow

### Quick Test (5 minutes)

```bash
# Step 1: Register agent (copy the testOTP from response)
curl -X POST http://localhost:3001/api/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+260971111111",
    "firstName": "Test",
    "lastName": "Agent",
    "email": "test@example.com",
    "idType": "national_id",
    "idNumber": "ID123456",
    "locationCity": "Lusaka",
    "locationAddress": "Test Street"
  }'

# Copy the testOTP value (e.g., "994638")

# Step 2: Verify OTP (paste the OTP from step 1)
curl -X POST http://localhost:3001/api/agent/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+260971111111","otp":"994638"}'

# Response should show: "verified": true
```

### Full Testing Checklist

- [ ] **Register Agent**
  ```bash
  POST /api/agent/register
  # Expected: testOTP in response
  ```

- [ ] **Verify OTP**
  ```bash
  POST /api/agent/verify-otp
  # Expected: verified: true
  ```

- [ ] **Admin Approves Agent**
  - Go to `/dashboard/agents`
  - Find pending application
  - Click "Review Application"
  - Click "Approve"
  - Expected: 50 ZMW welcome bonus created

- [ ] **Agent Receives Float**
  ```bash
  GET /api/agent/float/balance?agentId=8
  # Expected: currentBalance: 50, dailyQuotaRemaining: 25
  ```

- [ ] **View Available Requests**
  ```bash
  GET /api/agent/requests?agentId=8&page=1&limit=10
  # Expected: List of open ticket requests
  ```

- [ ] **Purchase Float**
  ```bash
  POST /api/agent/float/purchase
  # Expected: New balance calculated, transaction created
  ```

- [ ] **Claim Request**
  ```bash
  POST /api/agent/requests/1/claim
  # Expected: 2 ZMW deducted, customer contact shown
  ```

- [ ] **Upload Receipt**
  ```bash
  POST /api/agent/tickets/upload-receipt
  # Expected: Booking reference generated, pending verification
  ```

- [ ] **Admin Verifies Receipt**
  - Go to `/dashboard/tickets`
  - Find pending receipt
  - Click "Review Receipt"
  - Click "Verify Receipt"
  - Expected: SMS flagged as sent

- [ ] **Check Referrals**
  ```bash
  GET /api/agent/referrals?agentId=8
  # Expected: Referral code shown
  ```

- [ ] **View Performance Tier**
  ```bash
  GET /api/agent/performance?agentId=8
  # Expected: Current tier: bronze, next: silver at 50 requests
  ```

---

## Test Data

### Sample Agents Created During Testing

| Agent ID | Phone | Name | Status | Float |
|----------|-------|------|--------|-------|
| 7 | +260971234567 | John Doe | pending_review | 0 |
| 8 | +260978888888 | Jane Smith | pending_review | 0 |

### How to Create More Test Agents

Run the registration script multiple times with different phone numbers:

```bash
#!/bin/bash
for i in {1..5}; do
  PHONE="+26097$((1000000 + i))"
  curl -s -X POST http://localhost:3001/api/agent/register \
    -H "Content-Type: application/json" \
    -d "{
      \"phoneNumber\": \"$PHONE\",
      \"firstName\": \"Test\",
      \"lastName\": \"Agent$i\",
      \"email\": \"agent$i@test.com\",
      \"idType\": \"national_id\",
      \"idNumber\": \"ID$i\",
      \"locationCity\": \"Lusaka\",
      \"locationAddress\": \"Street $i\"
    }" | jq '.agentId'
done
```

---

## Console Messages

When testing, watch the server console for:

```
[TEST MODE] OTP for +260971234567: 674080
[TEST MODE] Accepting OTP 674080 for +260971234567
[SMS] Booking confirmed for user. Booking ref: ICB241121001
```

These indicate features working in test mode.

---

## Important: Before Production

Before deploying to production, you MUST:

1. **Remove test mode** from both endpoints:
   - `src/app/api/agent/register/route.ts` - Remove testOTP from response
   - `src/app/api/agent/verify-otp/route.ts` - Remove test OTP acceptance

2. **Integrate SMS Provider**:
   - Replace console.log with Twilio/SMS API call
   - Store OTP in Redis (not in-memory Map)
   - Implement rate limiting on OTP requests

3. **Example Production Code**:
   ```typescript
   // Instead of:
   console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);

   // Do:
   await twilioClient.messages.create({
     body: `Your InterCity verification code: ${otp}`,
     from: process.env.TWILIO_PHONE,
     to: phoneNumber
   });
   ```

---

## Files Modified for Testing

1. **src/app/api/agent/register/route.ts**
   - Returns `testOTP` in response
   - Console: `[TEST MODE] OTP for...`

2. **src/app/api/agent/verify-otp/route.ts**
   - Accepts any 6-digit OTP in test mode
   - Console: `[TEST MODE] Accepting OTP...`

---

## API Reference for Testing

### Register Agent
```bash
POST /api/agent/register
Content-Type: application/json

{
  "phoneNumber": "+260971234567",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "idType": "national_id",
  "idNumber": "123456789",
  "locationCity": "Lusaka",
  "locationAddress": "Main Street"
}

Response:
{
  "message": "Agent registered successfully...",
  "agentId": 7,
  "phoneNumber": "+260971234567",
  "testOTP": "674080",
  "testMessage": "This OTP is returned..."
}
```

### Verify OTP
```bash
POST /api/agent/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+260971234567",
  "otp": "674080"
}

Response:
{
  "message": "OTP verified successfully",
  "phoneNumber": "+260971234567",
  "verified": true
}
```

### Check Float Balance
```bash
GET /api/agent/float/balance?agentId=7

Response:
{
  "agentId": 7,
  "currentBalance": 50,
  "dailyQuotaRemaining": 25,
  "dailyQuotaLimit": 25,
  "lastQuotaReset": "2024-11-21T00:00:00Z",
  "requestsPerZMW": 0.5
}
```

---

## Troubleshooting

### "No OTP found" Error (in production mode)
- You're using the old verify endpoint
- Switch to the new test-mode version
- Or use the testOTP from registration response

### OTP expires immediately
- In-memory store expires after 10 minutes
- For testing, just use any 6-digit number
- In production, implement Redis for persistence

### Phone number already registered
- Test uses actual database inserts
- Use different phone numbers for each test
- Or manually delete from database: `DELETE FROM agents WHERE phone_number = '+260971234567'`

### Agent not showing in dashboard
- Refresh the page
- Check browser console for errors
- Verify agent ID is correct

---

## Summary

✅ **OTP sending disabled** - Returns OTP in response instead
✅ **OTP verification flexible** - Accepts any 6-digit OTP
✅ **Full flow testable** - Register → Verify → Approve → Use
✅ **No SMS integration needed** - Test everything locally
⚠️ **Production-ready** - Just add SMS provider before deploying

You're ready to test the entire agent system! 🚀
