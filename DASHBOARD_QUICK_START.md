# Agent Dashboard - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Login to Agent Portal
1. Navigate to: `http://localhost:3001/agent`
2. Click "Login" button
3. Enter credentials:
   ```
   Phone: +260961234567
   PIN: 1234
   ```
4. Click "Login"

### Step 2: View Dashboard
You'll see your dashboard with:
- **Balance**: 250 ZMW
- **Daily Quota**: 20/25 requests
- **Tier**: Silver
- **Referral Bonus**: 50 ZMW

### Step 3: Explore Earnings Metrics
Scroll down to see:
- **Total Earnings**: 30 ZMW from 15 completed tickets
- **This Month**: 15 ZMW
- **Average per Ticket**: 2 ZMW

### Step 4: View Recent Activity
Check the "Recent Activity" section to see:
- Float purchases
- Float usage
- Processed tickets

### Step 5: Test Float Purchase
1. Click **"Buy Float"** button (green button at top right)
2. Choose package (e.g., 100 ZMW)
3. Click **"Continue to Payment"**
4. Select payment method (MTN or Airtel)
5. Enter any phone number
6. Click **"Complete Payment"**
7. See success confirmation
8. Balance updates automatically

---

## 📊 Dashboard Sections Overview

### Top Navigation Bar
```
InterCity Agent Portal          Welcome, Emmanuel    Logout
```

### Header with CTA
```
Dashboard
Manage your agent profile, earnings, and requests    [+ Buy Float]
```

### Key Metrics Row (4 Cards)
| Balance | Daily Quota | Current Tier | Referral Bonus |
|---------|------------|--------------|----------------|
| 250 ZMW | 20/25 | Silver | 50 ZMW |

### Action Buttons Row (3 Cards)
| View Requests | Buy Float | Referrals |
|---|---|---|
| See available booking requests | Purchase more request credits | Share code: AG000010 |

### Earnings Row (3 Cards)
| Total Earnings | This Month | Avg Per Ticket |
|---|---|---|
| 30 ZMW from 15 tickets | 15 ZMW | 2 ZMW |

### Recent Activity Section
Shows last 5 activities:
- 💳 Transactions (purchases/usage)
- 🎫 Tickets (processed bookings)

### Quick Stats Panel
- Completion Rate: Progress bar (15/20 target)
- Balance Health: Indicator (Healthy/Good/Low)
- Performance Tier: Current level (Silver)

---

## 🎮 Features to Try

### 1. Check Your Earnings
- See total earnings from all completed tickets
- View monthly earnings breakdown
- Calculate average earnings per ticket

### 2. Monitor Balance
- Current float balance: 250 ZMW
- Balance health status (green/yellow/orange)
- Daily quota usage (20/25 requests)

### 3. Track Performance
- Performance tier: Silver
- Completion rate: 75% (15/20)
- Tier progression details

### 4. Review Activity
- See recent float purchases
- View ticket processing history
- Check transaction dates

### 5. Purchase More Float
- Buy in preset packages
- Choose payment method
- Quick completion process

---

## 💳 Float Purchase Packages

| Package | ZMW | Requests | Best For |
|---------|-----|----------|----------|
| Small | 50 | 25 | Quick top-up |
| Standard | 100 | 50 | Regular use |
| Large | 250 | 125 | High volume |
| Premium | 500 | 250 | Power users |

### Payment Methods
- ✅ MTN Mobile Money
- ✅ Airtel Money

### Test Mode
In test mode, all payments are simulated. Use any phone number to complete the flow.

---

## 🔍 Understanding the Metrics

### Total Earnings
Sum of all float used by the agent for successful ticket bookings.
```
Example: 30 ZMW earned from 15 completed bookings
```

### This Month Earnings
Total earnings from the current calendar month only.
```
Example: 15 ZMW earned in November 2025
```

### Average Per Ticket
Total earnings divided by number of completed tickets.
```
Calculation: 30 ZMW ÷ 15 tickets = 2 ZMW per ticket
```

### Balance Health
Color-coded indicator based on current balance:
- 🟢 **Healthy**: > 200 ZMW (green)
- 🟡 **Good**: 100-200 ZMW (yellow)
- 🔴 **Low**: < 100 ZMW (orange)

### Completion Rate
Shows progress towards 20-ticket completion target.
```
Example: 15/20 = 75% progress
```

### Performance Tier
Levels: Bronze → Silver → Gold → Platinum

Benefits increase with tier:
- Bronze: 0% bonus
- Silver: 10% bonus
- Gold: 25% bonus
- Platinum: 30% bonus

---

## 🎯 Test Scenarios

### Scenario 1: First-Time Login
1. Go to `/agent`
2. Click "Login"
3. Enter: +260961234567 / 1234
4. See dashboard with all metrics loaded

### Scenario 2: Check Earnings
1. Login (see above)
2. Scroll to "Earnings" section
3. Verify:
   - Total Earnings: 30 ZMW
   - This Month: 15 ZMW
   - Avg Per Ticket: 2 ZMW
   - Completed Tickets: 15

### Scenario 3: Purchase Float
1. Login
2. Click "Buy Float" button
3. Select 100 ZMW package
4. Click "Continue to Payment"
5. Select "MTN Mobile Money"
6. Enter any phone number (e.g., +260971234567)
7. Click "Complete Payment"
8. See success message
9. Balance updates to 350 ZMW

### Scenario 4: View Activity
1. Login
2. Scroll to "Recent Activity" section
3. See transactions and tickets
4. Click different items to see details

### Scenario 5: Check Quick Stats
1. Login
2. Look at right sidebar "Quick Stats"
3. Verify:
   - Completion Rate: 75% (15/20)
   - Balance Health: Healthy (green)
   - Performance Tier: Silver

---

## 📋 What You'll See

### Initial Load
- Loading spinner while data fetches
- Takes 1-2 seconds to load all metrics

### After Login
All sections populated with:
- ✅ Float balance: 250 ZMW
- ✅ Daily quota: 20/25
- ✅ Performance tier: Silver
- ✅ Referral bonus: 50 ZMW
- ✅ Total earnings: 30 ZMW
- ✅ Monthly earnings: 15 ZMW
- ✅ Recent activity: 5-10 items
- ✅ Completion rate: 75%
- ✅ Balance health: Healthy

### After Float Purchase
- ✅ Balance updates automatically
- ✅ Modal closes
- ✅ Success notification shows
- ✅ Dashboard refreshes

---

## ❓ Troubleshooting

### Login Not Working
- **Issue**: Can't login with provided credentials
- **Solution**: Verify phone number is exactly `+260961234567` and PIN is `1234`

### Dashboard Shows Empty Metrics
- **Issue**: All values are 0 or N/A
- **Solution**: Check browser console for errors, verify internet connection

### Float Purchase Not Working
- **Issue**: Modal appears but payment fails
- **Solution**: Check browser console, verify all fields are filled correctly

### Activity Feed Empty
- **Issue**: No recent transactions showing
- **Solution**: This is normal for new agents. The test agent has sample data included.

### Logout Issues
- **Issue**: Can't logout or session persists
- **Solution**: Clear browser cookies/localStorage or try different browser

---

## 🔑 Test Accounts

### Primary Test Agent
```
Phone: +260961234567
Name: Emmanuel Mwale
PIN: 1234
Balance: 250 ZMW
Status: Approved
Tier: Silver
```

### Secondary Test Agent
```
Phone: +260962345678
Name: Patricia Banda
PIN: 1234
Balance: 250 ZMW
Status: Approved
Tier: Bronze
```

Both accounts have full test data including:
- Transaction history
- Processed tickets
- Earnings data
- Recent activity

---

## 💡 Tips & Tricks

1. **Refresh Dashboard**: Press F5 to reload and see latest data
2. **Check Balance**: Top-left card shows current float balance
3. **Quick Stats**: Look at right sidebar for quick overview
4. **Recent Activity**: Scroll down to see transaction history
5. **Buy Float**: Use green "Buy Float" button for quick access
6. **Check Tier**: Right sidebar shows current performance tier
7. **View Referral**: Referral code shown on 4th metric card
8. **Mobile Friendly**: Dashboard works on mobile devices

---

## 📈 Expected Data

When you login, you should see:

**Key Metrics:**
- Balance: 250 ZMW
- Quota: 20/25
- Tier: Silver
- Referral: 50 ZMW

**Earnings:**
- Total: 30 ZMW
- This Month: 15 ZMW
- Per Ticket: 2 ZMW
- Completed: 15 tickets

**Activity:**
- 5-10 recent transactions/tickets
- Includes MTN and Airtel purchases
- Includes processed tickets
- Dated from past 10 days

**Quick Stats:**
- Completion: 75% (15/20)
- Health: Healthy (green)
- Tier: Silver

---

## 🎓 Learning Path

1. **Day 1**: Login and explore dashboard
2. **Day 2**: Test float purchase flow
3. **Day 3**: Review earnings metrics
4. **Day 4**: Check recent activity
5. **Day 5**: Ready to deploy!

---

## 🚀 Production Checklist

Before going live:
- [ ] Integrate with real payment provider
- [ ] Test with real payment credentials
- [ ] Implement webhook for payment confirmations
- [ ] Setup proper error handling
- [ ] Add security validations
- [ ] Test with real agents
- [ ] Monitor system performance
- [ ] Setup logging and analytics

---

*Last Updated: 2025-11-21*
*Ready for Testing!*
