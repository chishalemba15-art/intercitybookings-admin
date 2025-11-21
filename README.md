# IntercityBookings Admin Dashboard 🎛️

Comprehensive admin dashboard for managing the IntercityBookings platform. Monitor analytics, manage buses, routes, operators, and track user activity in real-time.

## ✨ Features

### 📊 Analytics Dashboard
- **Real-time Metrics**: View live bookings, revenue, and user activity
- **Search Analytics**: Track what routes users are searching for
- **Popular Routes**: Identify trending destinations
- **Booking Conversion**: Monitor booking success rates
- **Revenue Tracking**: Daily, weekly, and monthly reports

### 🚌 Bus Management
- Add/Edit/Delete bus schedules
- Manage pricing and availability
- Configure seat capacity
- Set operating days
- Add bus features (AC, WiFi, etc.)

### 🗺️ Route Management
- Create new routes
- Update distances and durations
- Set route status (active/inactive)
- View route performance analytics

### 🏢 Operator Management
- Add bus operators
- Manage operator details
- Track operator ratings
- Monitor operator performance

### 👥 User Activity Monitoring
- Track user searches by phone number
- Monitor booking attempts
- View page visit analytics
- Identify user patterns

### 🔐 Authentication
- Secure login with NextAuth.js
- Role-based access control
- Session management
- Password hashing with bcrypt

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Access to the same Neon database as main app
- Admin user created in database

### 1. Install Dependencies

```bash
cd admin
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
DATABASE_URL=postgresql://your-neon-connection-string
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=generate-a-random-secret-here
NEXT_PUBLIC_MAIN_APP_URL=http://localhost:3000
```

Generate NextAuth secret:
```bash
openssl rand -base64 32
```

### 3. Create Admin User

Run this SQL in Neon console:

```sql
-- Generate password hash for 'admin123'
-- In production, use a real bcrypt hash!
INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
  'admin@intercity.zm',
  '$2a$10$rKJ5vZ8xKxKx8xKxKxKxKO9qKxKxKxKxKxKxKxKxKxKxKxKxKxKx',
  'System Administrator',
  'super_admin'
);
```

**⚠️ IMPORTANT**: Change the password immediately after first login!

### 4. Run Development Server

```bash
npm run dev
```

Visit: **http://localhost:3001**

## 📦 Project Structure

```
admin/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/           # Login page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx       # Dashboard layout
│   │   │   ├── page.tsx         # Analytics dashboard
│   │   │   ├── buses/           # Bus management
│   │   │   ├── routes/          # Route management
│   │   │   ├── operators/       # Operator management
│   │   │   └── analytics/       # Detailed analytics
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth routes
│   │   │   ├── buses/           # Bus CRUD APIs
│   │   │   ├── routes/          # Route CRUD APIs
│   │   │   └── analytics/       # Analytics APIs
│   │   └── globals.css
│   ├── components/
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   ├── StatsCard.tsx        # Metric cards
│   │   ├── BusForm.tsx          # Bus add/edit form
│   │   ├── RouteForm.tsx        # Route add/edit form
│   │   └── OperatorForm.tsx     # Operator add/edit form
│   ├── lib/
│   │   ├── auth.ts              # NextAuth configuration
│   │   └── db.ts                # Database connection
│   └── types/
│       └── index.ts             # TypeScript types
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Default Login Credentials

```
Email: admin@intercity.zm
Password: admin123
```

**⚠️ Change immediately after first login!**

## 🎯 Core Features Implementation

### Dashboard Metrics

The main dashboard shows:
1. **Total Bookings** (last 30 days)
2. **Revenue** (last 30 days)
3. **Active Users** (unique phone numbers)
4. **Popular Routes** (most searched)
5. **Recent Bookings** (live feed)
6. **Booking Success Rate**

### Bus Management Features

- ✅ Add new bus schedules
- ✅ Edit existing buses
- ✅ Delete buses
- ✅ Update pricing
- ✅ Manage seat availability
- ✅ Set operating days
- ✅ Add/remove features

### Analytics Features

1. **Search Analytics**
   - Track search queries
   - Monitor destination trends
   - Identify search patterns
   - Link searches to phone numbers

2. **Booking Analytics**
   - Conversion rates
   - Failed booking reasons
   - Popular times/days
   - Revenue by route

3. **User Analytics**
   - Active users
   - Repeat customers
   - User journey tracking
   - Phone number linking

## 🔗 Database Schema

The admin uses these additional tables:

- `admin_users` - Admin authentication
- `search_analytics` - Search tracking
- `page_views` - Page visit tracking
- `booking_attempts` - Booking attempt tracking

All tables share the same database with the main app.

## 🛡️ Security Features

1. **Authentication**
   - Secure password hashing (bcrypt)
   - Session management
   - Protected routes
   - CSRF protection

2. **Authorization**
   - Role-based access
   - Super admin privileges
   - Action logging

3. **Data Protection**
   - SQL injection prevention (Drizzle ORM)
   - XSS protection
   - Input validation
   - Secure API endpoints

## 📱 User Linking System

Users are tracked by **phone numbers** throughout the system:

```typescript
// Search tracking
{
  destination: "Kitwe",
  userPhone: "+260971234567",
  sessionId: "unique-session-id",
  resultsCount: 5,
  createdAt: "2024-01-15T10:30:00Z"
}

// Booking tracking
{
  busId: 1,
  userPhone: "+260971234567",
  status: "completed",
  createdAt: "2024-01-15T10:35:00Z"
}
```

This allows you to:
- Track user journey
- Identify repeat customers
- Analyze conversion funnels
- Provide personalized experiences

## 🚀 Deployment

### Deploy to Vercel

1. Create new Vercel project for admin
2. Import from GitHub (admin folder)
3. Set root directory to `admin`
4. Add environment variables
5. Deploy!

### Environment Variables

```
DATABASE_URL=your-neon-connection
NEXTAUTH_URL=https://admin.yourdomain.com
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_MAIN_APP_URL=https://yourdomain.com
```

## 📊 Analytics API Endpoints

### GET /api/analytics/overview
Returns dashboard overview metrics

### GET /api/analytics/searches
Returns search analytics with filters

### GET /api/analytics/bookings
Returns booking analytics

### GET /api/analytics/users
Returns user activity data

## 🔧 Customization

### Adding New Metrics

1. Create new query in `/api/analytics/[metric]`
2. Add visualization component
3. Update dashboard to display

### Adding New Management Pages

1. Create route in `app/(dashboard)/[entity]`
2. Build form component
3. Create API endpoints
4. Add to sidebar navigation

## 📝 TODO Features

- [ ] Real-time dashboard updates (WebSocket)
- [ ] Export analytics to CSV/PDF
- [ ] Email notifications
- [ ] Automated reports
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced filtering
- [ ] Bulk operations

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📞 Support

For admin dashboard issues:
- Check logs in Vercel dashboard
- Review database queries
- Verify environment variables
- Contact support: admin@intercity.zm

---

**Admin Dashboard v1.0** - Built for IntercityBookings
