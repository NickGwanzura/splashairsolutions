# HVACOps - Field Service Management Platform

A comprehensive ServiceTitan-style HVAC Field Service Management SaaS platform built with Next.js, TypeScript, and PostgreSQL.

![HVACOps Dashboard](https://placeholder.com/dashboard-screenshot.png)

## Features

### Core Modules

- **Customer CRM** - Manage customer profiles, properties, service history, and equipment
- **Job Management** - Full job lifecycle from creation to completion
- **Dispatch Board** - Drag-and-drop scheduling with real-time technician tracking
- **Technician Mobile Interface** - Mobile-optimized UI for field technicians
- **Estimates & Quotes** - Professional PDF proposals with digital signatures
- **Invoicing & Payments** - Integrated Stripe payments and payment tracking
- **Equipment Tracking** - Track HVAC equipment, warranties, and service history
- **Inventory Management** - Parts catalog, stock levels, and reorder alerts
- **Reports & Analytics** - Dashboard metrics and business intelligence
- **Multi-Tenant SaaS** - Organization isolation with subscription tiers

## Tech Stack

### Frontend
- [Next.js 14+](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [TanStack Query](https://tanstack.com/query) - Server state management
- [Zustand](https://github.com/pmndrs/zustand) - Client state management

### Backend
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Prisma ORM](https://www.prisma.io/) - Database ORM
- [PostgreSQL](https://www.postgresql.org/) - Database

### Integrations
- [Stripe](https://stripe.com/) - Payments
- [Mapbox](https://www.mapbox.com/) - Maps and geocoding
- [Socket.io](https://socket.io/) - Real-time features
- [React PDF](https://react-pdf.org/) - PDF generation
- [AWS S3](https://aws.amazon.com/s3/) - File storage

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/hvacops.git
cd hvacops
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@coolairhvac.com | password123 |
| Admin | admin@coolairhvac.com | password123 |
| Dispatcher | dispatch@coolairhvac.com | password123 |
| Accountant | accounting@coolairhvac.com | password123 |
| Technician | mike.j@coolairhvac.com | password123 |

## Project Structure

```
app/
├── (auth)/           # Auth routes (login, register)
├── (dashboard)/      # Protected dashboard routes
│   ├── dashboard/    # Main dashboard
│   ├── customers/    # Customer CRM
│   ├── jobs/         # Job management
│   ├── dispatch/     # Dispatch board
│   ├── calendar/     # Scheduling calendar
│   ├── invoices/     # Invoicing
│   ├── estimates/    # Estimates
│   ├── equipment/    # Equipment tracking
│   ├── inventory/    # Inventory management
│   ├── reports/      # Reports & analytics
│   └── settings/     # Settings
├── api/              # API routes
└── layout.tsx        # Root layout

components/
├── ui/               # shadcn/ui components
├── layout/           # Layout components
├── forms/            # Form components
└── data-display/     # Data display components

lib/
├── auth/             # Authentication config
├── db/               # Database utilities
├── services/         # Business logic services
└── utils.ts          # Utility functions

prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Seed data

types/                # TypeScript types
```

## Database Schema

The platform uses a comprehensive relational database with the following main entities:

- **Organizations** - Multi-tenant isolation
- **Users** - Authentication and roles
- **Technicians** - Field technician profiles
- **Customers** - Customer CRM
- **Properties** - Customer locations
- **Jobs** - Work orders
- **Schedules** - Technician schedules
- **Equipment** - HVAC equipment tracking
- **Inventory** - Parts and materials
- **Invoices** - Billing and payments
- **Estimates** - Quotes and proposals
- **Audit Logs** - Compliance tracking

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## API Routes

### Jobs
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs/[id]` - Get job details
- `PATCH /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer details
- `PATCH /api/customers/[id]` - Update customer

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get invoice details
- `POST /api/invoices/[id]/send` - Send invoice
- `POST /api/invoices/[id]/payment` - Record payment

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Self-Hosted

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hvacops"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="pk.eyJ1..."

# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="hvacops-uploads"
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@hvacops.com or join our Slack channel.

---

Built with ❤️ for HVAC professionals everywhere.
