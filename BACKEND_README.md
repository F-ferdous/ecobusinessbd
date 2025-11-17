# EcoBusiness Backend System

A comprehensive backend system for business formation services built with Next.js, Firebase, and Stripe.

## 🏗️ Architecture Overview

This backend system provides:
- **Role-based authentication** (Admin, Employee, Client)
- **Package management** (USA, UK, Custom services)
- **Document management** with Firebase Storage
- **Payment processing** with Stripe integration
- **Order management** and tracking
- **Notification system** (in-app and email)
- **Admin panel** for business management

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Payments**: Stripe
- **Language**: TypeScript
- **Deployment**: Firebase Hosting

## 📁 Project Structure

```
src/
├── app/api/                    # API Routes
│   ├── admin/                  # Admin-only endpoints
│   │   ├── users/             # User management
│   │   ├── packages/          # Package management
│   │   └── orders/            # Order management
│   ├── client/                 # Client endpoints
│   │   ├── orders/            # Client orders
│   │   ├── documents/         # Document management
│   │   ├── packages/          # Available packages
│   │   └── checkout/          # Order creation & payment
│   └── webhooks/              # External webhooks
│       └── stripe/            # Stripe payment webhooks
├── lib/                        # Core libraries
│   ├── firebase.ts            # Firebase client config
│   ├── firebase-admin.ts      # Firebase admin config
│   ├── apiMiddleware.ts       # API authentication & utilities
│   ├── rbac.ts               # Role-based access control
│   ├── documentManager.ts    # Document handling
│   ├── paymentSystem.ts      # Payment processing
│   ├── notificationSystem.ts # Notifications
│   └── dbSeed.ts             # Database seeding
├── types/                     # TypeScript definitions
└── hooks/                     # React hooks
    └── useAuth.ts            # Authentication hook
```

## 🔧 Setup Instructions

### 1. Environment Variables

Create `.env.local`:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecureAdminPassword123!
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Database

```bash
# Seed initial data
npm run seed

# Create sample users for testing
npm run seed:sample-users

# Reset and reseed database
npm run seed:reset

# View database statistics
npm run seed:stats
```

### 4. Start Development Server

```bash
npm run dev
```

## 👥 User Roles & Permissions

### Admin
- Full system access
- User management
- Package management
- Payment management
- Document access (all)
- Order management

### Employee
- Limited admin access
- Document management
- Order processing
- Client support
- Payment viewing

### Client
- Place orders
- Upload/download documents
- View order status
- Basic account management

## 🛡️ API Authentication

All API routes use JWT token authentication via Firebase Auth:

```javascript
// Example API call
const token = await user.getIdToken();
const response = await fetch('/api/client/orders', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 📋 API Endpoints

### Client Endpoints

#### Orders
- `GET /api/client/orders` - Get client orders
- `GET /api/client/orders/[orderId]` - Get order details
- `POST /api/client/checkout` - Create order & checkout

#### Documents  
- `GET /api/client/documents` - Get client documents
- `POST /api/client/documents` - Upload document

#### Packages
- `GET /api/client/packages` - Get available packages

### Admin Endpoints

#### User Management
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user

#### Package Management
- `GET /api/admin/packages` - List packages
- `POST /api/admin/packages` - Create package

#### Order Management
- `GET /api/admin/orders` - List orders
- `GET /api/admin/orders/[orderId]` - Get order details
- `PUT /api/admin/orders/[orderId]` - Update order

## 💳 Payment Flow

1. **Order Creation**: Client creates order via `/api/client/checkout`
2. **Stripe Session**: System creates Stripe checkout session
3. **Payment**: Client completes payment via Stripe
4. **Webhook**: Stripe sends webhook to `/api/webhooks/stripe`
5. **Processing**: System processes payment and updates order
6. **Notifications**: Client receives confirmation

## 📄 Document Management

### Upload Process
1. Client uploads file via API
2. File validated (type, size)
3. Stored in Firebase Storage
4. Metadata saved to Firestore
5. Notifications sent to relevant users

### Security
- File type validation
- Size limits (10MB)
- Access control based on user roles
- Secure download URLs

## 🔔 Notification System

### Types
- Order status updates
- Document uploads
- Payment confirmations
- System messages

### Delivery
- In-app notifications (Firestore)
- Email notifications (configurable)

## 📊 Database Schema

### Collections

#### Users
```typescript
{
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'employee' | 'client';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  permissions: Permission[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Orders
```typescript
{
  id: string;
  clientId: string;
  packageId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: 'USD' | 'GBP';
  invoiceNumber: string;
  createdAt: Timestamp;
  // ... additional fields
}
```

#### Documents
```typescript
{
  id: string;
  name: string;
  type: DocumentType;
  downloadURL: string;
  userId: string;
  orderId?: string;
  isPublic: boolean;
  createdAt: Timestamp;
  // ... additional fields
}
```

## 🧪 Testing

### Sample Data
The seeding system creates:
- 6 service packages (USA, UK, Custom)
- 15+ state fees
- Admin user account
- Sample client/employee accounts (optional)

### Test Accounts
After running `npm run seed:sample-users`:

- **Admin**: admin@ecobusiness.com / AdminPassword123!
- **Client**: client@example.com / ClientPassword123!
- **Employee**: employee@ecobusiness.com / EmployeePassword123!

### Stripe Testing
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Failure: `4000 0000 0000 0002`

## 🚀 Deployment

### Firebase Setup
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize project: `firebase init`
4. Deploy: `firebase deploy`

### Stripe Webhooks
1. Configure webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
2. Add webhook secret to environment variables
3. Enable required events in Stripe dashboard

## 🔒 Security Features

- **Authentication**: Firebase Auth with JWT tokens
- **Authorization**: Role-based permissions system
- **API Security**: Request validation and sanitization
- **File Security**: Type and size validation
- **Payment Security**: Stripe handles sensitive data
- **Webhook Security**: Signature verification

## 📈 Monitoring & Analytics

- Firebase Analytics integration
- Error logging and monitoring
- Payment tracking
- User activity tracking

## 🛠️ Development Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server

# Database
npm run seed               # Initialize database
npm run seed:reset         # Reset and reseed
npm run seed:sample-users  # Create test users
npm run seed:stats         # View database stats

# Deployment
firebase deploy            # Deploy to Firebase
firebase deploy --only hosting  # Deploy only frontend
```

## 📝 License

This project is proprietary and confidential.

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use proper error handling
3. Add proper logging
4. Test all API endpoints
5. Update documentation

## 📞 Support

For technical support or questions, contact the development team.

---

**Built with ❤️ for EcoBusiness**