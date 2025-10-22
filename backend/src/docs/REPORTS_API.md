# Hotel Management System - Reports API Documentation

This document provides comprehensive documentation for all reporting endpoints in the Hotel Management System.

---

## Table of Contents

1. [Room Occupancy Report](#1-room-occupancy-report)
2. [Guest Billing Summary](#2-guest-billing-summary)
3. [Service Usage Breakdown](#3-service-usage-breakdown)
4. [Top Services & Customer Trends](#4-top-services--customer-trends)
5. [Monthly Revenue Per Branch](#5-monthly-revenue-per-branch)

---

## 1. Room Occupancy Report

**Endpoint:** `GET /api/reports/room-occupancy`

**Description:** Get detailed room occupancy status for a selected date or period. Shows which rooms are occupied, available, reserved, or pending check-in.

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `branchId` | number | No | Filter by specific branch | `1` |
| `roomId` | number | No | Filter by specific room | `101` |
| `roomStatus` | string | No | Filter by room status | `Available`, `Occupied`, `Maintenance`, `Cleaning` |
| `occupancyStatus` | string | No | Filter by occupancy status | `Occupied`, `Available`, `Pending Check-in`, `Reserved` |
| `checkInDate` | string | No | Filter by check-in date (YYYY-MM-DD) | `2025-10-22` |
| `checkOutDate` | string | No | Filter by check-out date (YYYY-MM-DD) | `2025-10-25` |
| `startDate` | string | No | Date range start (YYYY-MM-DD) | `2025-10-01` |
| `endDate` | string | No | Date range end (YYYY-MM-DD) | `2025-10-31` |

### Response Example

```json
{
  "success": true,
  "data": {
    "occupancyData": [
      {
        "roomId": 1,
        "roomNumber": "101",
        "roomType": "Deluxe Suite",
        "dailyRate": 15000.00,
        "branchId": 1,
        "branchName": "Colombo Central",
        "bookingId": 123,
        "guestName": "John Doe",
        "guestContact": "+94771234567",
        "checkInDate": "2025-10-20T00:00:00.000Z",
        "checkOutDate": "2025-10-25T00:00:00.000Z",
        "bookingStatus": "Checked-In",
        "roomStatus": "Occupied",
        "occupancyStatus": "Occupied",
        "nightsBooked": 5,
        "roomRevenue": 75000.00,
        "bookingCreatedAt": "2025-10-15T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### Use Cases

- Check room availability for a specific date
- View occupancy report for a date range
- Monitor current occupancy status across all branches
- Identify pending check-ins for today
- Track reserved rooms for future dates

---

## 2. Guest Billing Summary

**Endpoint:** `GET /api/reports/guest-billing`

**Description:** Get comprehensive guest billing information including unpaid balances, payment status, and overdue bills.

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `guestId` | number | No | Filter by specific guest | `5` |
| `bookingId` | number | No | Filter by specific booking | `123` |
| `paymentStatus` | string | No | Filter by payment status | `Paid`, `Unpaid`, `Pending` |
| `hasOutstanding` | boolean | No | Show only bills with outstanding balance | `true` |
| `minOutstanding` | number | No | Minimum outstanding amount | `1000` |
| `startDate` | string | No | Bill date range start (YYYY-MM-DD) | `2025-10-01` |
| `endDate` | string | No | Bill date range end (YYYY-MM-DD) | `2025-10-31` |

### Response Example

```json
{
  "success": true,
  "data": {
    "billingData": [
      {
        "guestId": 5,
        "guestName": "Jane Smith",
        "guestNic": "199512345678",
        "guestContact": "+94772345678",
        "guestEmail": "jane@example.com",
        "bookingId": 123,
        "checkInDate": "2025-10-20T00:00:00.000Z",
        "checkOutDate": "2025-10-25T00:00:00.000Z",
        "bookingStatus": "Checked-Out",
        "nightsStayed": 5,
        "billId": 45,
        "roomCharges": 75000.00,
        "totalServiceCharges": 5000.00,
        "totalTax": 8000.00,
        "lateCheckoutCharge": 0.00,
        "totalDiscount": 2000.00,
        "totalAmount": 86000.00,
        "paidAmount": 50000.00,
        "outstandingAmount": 36000.00,
        "paymentStatus": "Unpaid",
        "billDate": "2025-10-25T14:30:00.000Z",
        "daysOverdue": 5
      }
    ],
    "count": 1
  }
}
```

### Use Cases

- Track unpaid guest balances
- Generate billing statements for specific guests
- Identify overdue payments
- Monitor payment collection status
- Generate financial reports for accounting

---

## 3. Service Usage Breakdown

**Endpoint:** `GET /api/reports/service-usage-breakdown`

**Description:** Analyze service consumption patterns per room and service type. Shows detailed breakdown of all services used during stays.

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `bookingId` | number | No | Filter by specific booking | `123` |
| `roomId` | number | No | Filter by specific room | `101` |
| `branchId` | number | No | Filter by specific branch | `1` |
| `serviceId` | number | No | Filter by specific service | `5` |
| `guestId` | number | No | Filter by specific guest | `10` |
| `serviceName` | string | No | Filter by service name (partial match) | `laundry` |
| `startDate` | string | No | Usage date range start (YYYY-MM-DD) | `2025-10-01` |
| `endDate` | string | No | Usage date range end (YYYY-MM-DD) | `2025-10-31` |

### Response Example

```json
{
  "success": true,
  "data": {
    "usageData": [
      {
        "bookingId": 123,
        "roomId": 1,
        "roomNumber": "101",
        "roomType": "Deluxe Suite",
        "branchId": 1,
        "branchName": "Colombo Central",
        "guestId": 5,
        "guestName": "Jane Smith",
        "checkIn": "2025-10-20T00:00:00.000Z",
        "checkOut": "2025-10-25T00:00:00.000Z",
        "serviceId": 3,
        "serviceName": "Room Service - Breakfast",
        "unitType": "meal",
        "unitPrice": 1500.00,
        "recordId": 234,
        "quantity": 5,
        "usageDate": "2025-10-22T08:00:00.000Z",
        "totalPrice": 7500.00,
        "stayDuration": 5,
        "totalServicesForBooking": 12500.00,
        "roomServiceTotal": 15000.00
      }
    ],
    "count": 1
  }
}
```

### Use Cases

- Analyze service consumption patterns
- Generate detailed billing for service charges
- Track popular services by room type
- Monitor service revenue per guest
- Identify high-value service consumers

---

## 4. Top Services & Customer Trends

**Endpoint:** `GET /api/reports/top-services`

**Description:** Identify top-used services and analyze customer preference trends. Includes ranking by revenue and popularity.

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `branchId` | number | No | Filter by specific branch | `1` |
| `serviceId` | number | No | Filter by specific service | `3` |
| `monthYear` | string | No | Filter by specific month (YYYY-MM) | `2025-10` |
| `startDate` | string | No | Month range start (YYYY-MM-DD) | `2025-01-01` |
| `endDate` | string | No | Month range end (YYYY-MM-DD) | `2025-12-31` |
| `topN` | number | No | Get top N services (by revenue) | `10` |

### Response Example

```json
{
  "success": true,
  "data": {
    "servicesData": [
      {
        "serviceId": 3,
        "serviceName": "Room Service - Breakfast",
        "unitType": "meal",
        "unitPrice": 1500.00,
        "branchId": 1,
        "branchName": "Colombo Central",
        "monthStart": "2025-10-01T00:00:00.000Z",
        "monthYear": "2025-10",
        "bookingsUsingService": 45,
        "uniqueCustomers": 38,
        "totalQuantityUsed": 180,
        "totalRevenueFromService": 270000.00,
        "avgQuantityPerUsage": 4.00,
        "avgPricePerUsage": 6000.00,
        "serviceRankByRevenue": 1,
        "serviceRankByPopularity": 2
      }
    ],
    "count": 1
  }
}
```

### Use Cases

- Identify most profitable services
- Analyze service popularity trends
- Optimize service offerings based on demand
- Track monthly service performance
- Compare service performance across branches

---

## 5. Monthly Revenue Per Branch

**Endpoint:** `GET /api/monthly-revenue`

**Description:** Track monthly revenue from room charges and services per branch. Includes payment collection metrics.

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `branchId` | number | No | Filter by specific branch | `1` |
| `monthYear` | string | No | Filter by specific month (YYYY-MM) | `2025-10` |
| `startDate` | string | No | Date range start (YYYY-MM-DD) | `2025-01-01` |
| `endDate` | string | No | Date range end (YYYY-MM-DD) | `2025-12-31` |
| `city` | string | No | Filter by city name | `Colombo` |

### Response Example

```json
{
  "success": true,
  "data": {
    "revenueData": [
      {
        "monthStart": "2025-10-01T00:00:00.000Z",
        "monthEnd": "2025-10-31T00:00:00.000Z",
        "monthYear": "2025-10",
        "branchId": 1,
        "branchName": "Colombo Central",
        "city": "Colombo",
        "totalBookings": 120,
        "uniqueGuests": 95,
        "totalRoomCharges": 1800000.00,
        "totalServiceCharges": 450000.00,
        "totalTax": 225000.00,
        "totalDiscounts": 50000.00,
        "lateCheckoutCharges": 15000.00,
        "grossRevenue": 2440000.00,
        "totalPaid": 2200000.00,
        "outstandingRevenue": 240000.00,
        "paymentCollectionRate": 90.16,
        "occupiedRoomsCount": 45,
        "totalRoomsInBranch": 50
      }
    ],
    "count": 1
  }
}
```

### Use Cases

- Track monthly revenue performance
- Compare branch performance
- Monitor payment collection rates
- Generate financial reports
- Analyze revenue trends over time

---

## Error Handling

All endpoints return consistent error responses:

### Validation Error (400)
```json
{
  "success": false,
  "status": 400,
  "data": {
    "message": "Invalid branchId. Must be a number."
  }
}
```

### Server Error (500)
```json
{
  "success": false,
  "status": 500,
  "data": {
    "message": "Server error retrieving data"
  }
}
```

---

## Database Views

All reports are powered by optimized database views:

- `room_occupancy_report_view` - Room occupancy data
- `guest_billing_summary_view` - Guest billing information
- `service_usage_breakdown_view` - Service usage details
- `top_services_trends_view` - Top services analytics
- `monthly_revenue_per_branch_view` - Revenue aggregation

These views are created in the migration file: `20251005T124048_create_views.sql`

---

## Testing Examples

### 1. Get Today's Room Occupancy
```bash
GET /api/reports/room-occupancy?checkInDate=2025-10-22
```

### 2. Get Unpaid Bills
```bash
GET /api/reports/guest-billing?paymentStatus=Unpaid&hasOutstanding=true
```

### 3. Get Service Usage for October
```bash
GET /api/reports/service-usage-breakdown?startDate=2025-10-01&endDate=2025-10-31
```

### 4. Get Top 10 Services This Month
```bash
GET /api/reports/top-services?monthYear=2025-10&topN=10
```

### 5. Get Branch Revenue for Q4
```bash
GET /api/monthly-revenue?startDate=2025-10-01&endDate=2025-12-31&branchId=1
```

---

## Notes

- All date parameters use format: `YYYY-MM-DD`
- Month parameters use format: `YYYY-MM`
- All monetary values are in decimal format with 2 decimal places
- Timestamps are returned in ISO 8601 format
- All endpoints support multiple filter combinations
- Empty results return `count: 0` with empty arrays

---

**Last Updated:** October 22, 2025  
**API Version:** 1.0.0
