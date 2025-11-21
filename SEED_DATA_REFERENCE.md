# Seeded Database Reference

## Quick Login Credentials

```
Email:    admin@intercity.zm
Password: admin123
```

---

## Bus Operators

| ID | Name | Slug | Rating | Color | Phone |
|---|---|---|---|---|---|
| 1 | Juldan Motors | juldan-motors | 4.8 | Blue | +260211123456 |
| 2 | Mazhandu Coaches | mazhandu-coaches | 4.5 | Red | +260211234567 |
| 3 | Zambian Eagle Coaches | zambian-eagle | 4.6 | Yellow | +260211345678 |
| 4 | City Cruiser Express | city-cruiser | 4.3 | Green | +260211456789 |

---

## Routes (Sample)

| From City | To City | Distance | Duration |
|---|---|---|---|
| Lusaka | Kitwe | 456 km | 8 hours |
| Lusaka | Ndola | 434 km | 7.5 hours |
| Lusaka | Livingstone | 460 km | 8 hours |
| Lusaka | Kabwe | 145 km | 2 hours |
| Kitwe | Ndola | 50 km | 1 hour |

---

## Bus Schedules (Price in ZMW)

| Route | Operator | Depart | Arrive | Price | Type | Seats | Features |
|---|---|---|---|---|---|---|---|
| Lusaka-Kitwe | Juldan | 06:00 | 14:00 | 850 | Luxury | 32 | WiFi, AC, Toilet, Drinks |
| Lusaka-Kitwe | Mazhandu | 07:30 | 15:30 | 650 | Standard | 52 | AC, Toilet |
| Lusaka-Ndola | Zambian Eagle | 05:30 | 13:00 | 750 | Luxury | 40 | WiFi, AC, Toilet, Snacks |
| Lusaka-Kabwe | Zambian Eagle | 07:00 | 09:00 | 250 | Standard | 60 | AC |
| Lusaka-Livingstone | City Cruiser | 06:00 | 14:00 | 620 | Standard | 48 | AC, Toilet |

---

## Sample Passengers

| Booking Ref | Name | Phone | Email | Status |
|---|---|---|---|---|
| ICB202411001 | John Mwale | +260971234567 | john.mwale@email.com | Confirmed |
| ICB202411002 | Mary Chipenge | +260972345678 | mary.chipenge@email.com | Confirmed |
| ICB202411003 | Chanda Zambia | +260973456789 | chanda.z@email.com | Confirmed |
| ICB202411004 | Ibrahim Hassan | +260974567890 | ibrahim.h@email.com | Pending |
| ICB202411005 | Precious Banda | +260975678901 | precious.banda@email.com | Completed |

---

## Payment Methods (Seeded)
- Airtel Money (airtel_money)
- MTN Mobile Money (mtn_momo)

---

## Search Analytics Summary

Users searched for:
- Lusaka to Kitwe
- Lusaka to Livingstone
- Lusaka to Ndola
- Lusaka to Kabwe
- Kitwe to Ndola

All searches tracked with:
- Session IDs
- IP addresses
- User phone numbers
- Timestamp records

---

## Analytics Overview

After seeding, the dashboard should show:
- **Total Bookings**: 5
- **Revenue**: ~ZMW 4,000 (last 30 days)
- **Active Users**: 4 unique phone numbers
- **Search Volume**: 5 searches
- **Page Views**: 5 visits
- **Booking Success Rate**: 80% (4/5 completed)

---

## Features Seeded by Bus Type

### Luxury Buses
- ✅ WiFi
- ✅ AC
- ✅ Toilet
- ✅ Drinks Service
- ✅ USB Charging (premium)
- Capacity: 32-40 seats
- Price: ZMW 750-900

### Standard Buses
- ✅ AC
- ✅ Toilet (most)
- Capacity: 48-60 seats
- Price: ZMW 240-700

---

## Database Tables Populated

- ✅ operators (4 records)
- ✅ routes (10 records)
- ✅ buses (10 records)
- ✅ bookings (5 records)
- ✅ payments (4 records)
- ✅ admin_users (1 record)
- ✅ search_analytics (5 records)
- ✅ page_views (5 records)
- ✅ booking_attempts (4 records)
- ✅ feedback (3 records)

---

## Dates

All booking dates are set 1-7 days in the future from seed date (Nov 21, 2024).

Example:
- +1 day: Nov 22, 2024
- +2 days: Nov 23, 2024
- +5 days: Nov 26, 2024

This ensures realistic upcoming bookings in the dashboard.

---

## Notes

- All phone numbers follow Zambian format (+260...)
- All prices in ZMW (Zambian Kwacha)
- Operator ratings range from 4.3 to 4.8 stars
- Seat availability varies (12-45 available of total)
- Payment methods reflect mobile money solutions popular in Zambia
