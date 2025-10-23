# Hotel Management System

A comprehensive hotel management system built with React/TypeScript frontend and Node.js/Express backend. This system provides complete functionality for managing hotel operations including bookings, guests, rooms, staff, services, and financial reporting.

## 🏗️ Architecture

- **Frontend**: React 19 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript + PostgreSQL
- **Infrastructure**: AWS (EKS, ECR, RDS) with Terraform
- **Authentication**: JWT-based authentication system

## 🚀 Features

### 🏨 Core Hotel Management

#### Guest Management

- **Guest Registration**: Create and manage guest profiles with personal information
- **Guest Database**: Comprehensive guest information storage (name, NIC, contact details)
- **Guest History**: Track guest booking history and preferences
- **Search & Filter**: Advanced search functionality for guest records

#### Room Management

- **Room Inventory**: Manage room details, types, and availability
- **Room Types**: Configure different room categories with pricing
- **Room Status**: Real-time room availability tracking
- **Branch Management**: Multi-branch support with room allocation

#### Booking System

- **Online Reservations**: Create and manage bookings with real-time availability
- **Booking Lifecycle**: Complete workflow from booking to checkout
  - **Booked**: Initial reservation state
  - **Checked-In**: Guest arrival and room assignment
  - **Checked-Out**: Completion with bill generation
  - **Cancelled**: Booking cancellation handling
- **Booking Management**: View, edit, and cancel reservations
- **Availability Checking**: Real-time room availability validation

### 💰 Financial Management

#### Billing & Payments

- **Dynamic Billing**: Automatic bill calculation based on:
  - Room charges (nightly rates × duration)
  - Service charges from additional services used
  - Tax calculations
  - Discount applications
  - Late checkout charges
- **Payment Processing**: Multiple payment methods support
  - Cash payments
  - Card transactions
  - Online payments
  - Bank transfers
- **Payment History**: Complete payment tracking and records
- **Final Bill Generation**: Automated bill generation upon checkout

#### Revenue & Reporting

- **Monthly Revenue Reports**: Track revenue by month and branch
- **Room Occupancy Analytics**: Occupancy rates and trends
- **Service Usage Reports**: Most popular services and revenue breakdown
- **Guest Billing Reports**: Individual and summary billing reports
- **Dashboard Analytics**: Real-time key performance indicators

### 🛎️ Service Management

#### Chargeable Services

- **Service Catalog**: Manage hotel services (spa, restaurant, laundry, etc.)
- **Service Pricing**: Flexible pricing configuration
- **Service Usage Tracking**: Record and track service consumption
- **Service Reports**: Revenue analysis by service type

#### Staff Management

- **Staff Profiles**: Employee information and role management
- **User Authentication**: Secure login system for staff members
- **Role-Based Access**: Different access levels for different staff roles
- **Branch Assignment**: Assign staff to specific hotel branches

### 📊 Advanced Features

#### Multi-Branch Support

- **Branch Management**: Configure and manage multiple hotel locations
- **Branch-Specific Operations**: Separate management for each branch
- **Cross-Branch Reporting**: Consolidated reporting across all branches

#### Discount System

- **Promotional Discounts**: Create and manage discount campaigns
- **Loyalty Programs**: Guest loyalty program support
- **Flexible Discount Rules**: Various discount calculation methods

#### Real-Time Operations

- **Live Updates**: Real-time availability and booking status updates
- **Instant Notifications**: Success/error notifications for all operations
- **Responsive Design**: Fully responsive UI for desktop and mobile

## 🛠️ Technology Stack

### Frontend Technologies

- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Lucide React**: Modern icon library
- **JWT Decode**: Token handling for authentication

### Backend Technologies

- **Node.js**: JavaScript runtime
- **Express**: Web application framework
- **TypeScript**: Type-safe server development
- **PostgreSQL**: Relational database
- **JWT**: JSON Web Token authentication
- **Bcrypt**: Password hashing
- **Joi**: Data validation
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security middleware
- **Morgan**: HTTP request logger

### Infrastructure & DevOps

- **Docker**: Containerization
- **Terraform**: Infrastructure as Code
- **AWS EKS**: Kubernetes orchestration
- **AWS ECR**: Container registry
- **AWS RDS**: Managed PostgreSQL database
- **GitHub Actions**: CI/CD pipeline

## 📋 API Endpoints

### Authentication

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration

### Bookings

- `GET /booking` - Get all bookings
- `POST /booking` - Create new booking
- `GET /booking/:id` - Get booking by ID
- `PUT /booking/:id` - Update booking
- `DELETE /booking/:id` - Delete booking
- `GET /booking/availability` - Check room availability
- `GET /booking/:id/services` - Get booking services

### Guests

- `GET /guest` - Get all guests
- `POST /guest` - Create new guest
- `GET /guest/:id` - Get guest by ID
- `PUT /guest/:id` - Update guest
- `DELETE /guest/:id` - Delete guest
- `GET /guest/:id/bookings` - Get guest bookings

### Rooms & Room Types

- `GET /room` - Get all rooms
- `POST /branch/:id/room` - Create room in branch
- `PUT /room/:id` - Update room
- `DELETE /room/:id` - Delete room
- `GET /room-type` - Get all room types
- `POST /room-type` - Create room type

### Financial Management

- `GET /final-bill/:booking_id` - Get final bill by booking
- `POST /final-bill` - Create final bill
- `GET /payment/bill/:bill_id` - Get payments by bill
- `POST /payment` - Create payment
- `PUT /payment/:id` - Update payment
- `DELETE /payment/:id` - Delete payment

### Services

- `GET /service` - Get all chargeable services
- `POST /service` - Create service
- `GET /service-usage` - Get service usage records
- `POST /service-usage` - Create service usage

### Reporting

- `GET /monthly-revenue` - Monthly revenue reports
- `GET /room-occupancy` - Room occupancy reports
- `GET /guest-billing` - Guest billing reports
- `GET /service-usage-breakdown` - Service usage reports
- `GET /dashboard` - Dashboard statistics

### Staff & Administration

- `GET /staff` - Get all staff members
- `POST /staff` - Create staff member
- `GET /branch` - Get all branches
- `POST /branch` - Create branch
- `GET /discount` - Get all discounts

## 🚀 Getting Started

### Prerequisites

- Node.js (>=16.0.0)
- PostgreSQL
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/specfor/hotel-management-system.git
   cd hotel-management-system
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your database connection in .env
   npm run migrate
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Environment Variables

#### Backend (.env)

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_management
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

#### Frontend

Configure API base URL in `src/config/api.ts`

## 📁 Project Structure

```
hotel-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # Database models
│   │   ├── repos/           # Database repositories
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript type definitions
│   │   └── common/          # Shared utilities
│   ├── migrations/          # Database migrations
│   └── scripts/             # Build and deployment scripts
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── api_connection/  # API service layer
│   │   ├── types/           # TypeScript type definitions
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
├── infrastructure/         # Terraform configuration
└── docs/                   # Documentation
```

## 🔧 Development

### Available Scripts

#### Backend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run migrate` - Run database migrations
- `npm run lint` - Run ESLint
- `npm test` - Run tests

#### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🚢 Deployment

### Local Development

The system runs on:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Production Deployment

The system supports deployment to AWS using Terraform:

- Containerized with Docker
- Orchestrated with Kubernetes (EKS)
- Database on AWS RDS
- Load balancing and auto-scaling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Development Team** - [specfor](https://github.com/specfor)

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for scalability and performance
- Focused on user experience and reliability
