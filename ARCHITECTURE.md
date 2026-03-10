# HVACOps - System Architecture

## Overview

HVACOps is a comprehensive Field Service Management (FSM) SaaS platform built for HVAC companies. This document outlines the system architecture, design decisions, and technical implementation details.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Web App (Next.js)    │    Mobile Web    │    PWA    │    Future: Native   │
│  React + TypeScript   │    Responsive    │    App    │    iOS/Android      │
└───────────────────────┴──────────────────┴───────────┴─────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Next.js App Router API Routes                                               │
│  ├── /api/auth/*          - Authentication (NextAuth.js)                     │
│  ├── /api/jobs/*          - Job management                                   │
│  ├── /api/customers/*     - Customer CRM                                     │
│  ├── /api/technicians/*   - Technician management                            │
│  ├── /api/schedules/*     - Scheduling                                       │
│  ├── /api/invoices/*      - Invoicing                                        │
│  ├── /api/estimates/*     - Estimates                                        │
│  ├── /api/inventory/*     - Inventory management                             │
│  ├── /api/equipment/*     - Equipment tracking                               │
│  └── /api/webhooks/*      - Stripe, external integrations                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVICE LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Job Service  │  │ Customer Svc │  │ Dispatch Svc │  │ Invoice Svc  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Schedule Svc │  │ Payment Svc  │  │ PDF Svc      │  │ Notify Svc   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL + Prisma ORM                                                     │
│  ├── Multi-tenant data isolation (organization_id)                           │
│  ├── Row-level security                                                      │
│  └── Soft deletes for audit compliance                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Stripe       │  │ Mapbox       │  │ AWS S3       │  │ SendGrid     │    │
│  │ Payments     │  │ Maps         │  │ File Storage │  │ Email        │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                       │
│  │ Twilio       │  │ Socket.io    │  │ React PDF    │                       │
│  │ SMS          │  │ Real-time    │  │ PDF Gen      │                       │
│  └──────────────┘  └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Multi-Tenant Architecture

### Organization Isolation

Every data entity includes an `organizationId` field for complete data isolation:

```prisma
model Job {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  // ... other fields
  @@index([organizationId])
}
```

### Access Control Pattern

All API routes enforce organization-based access:

```typescript
const session = await auth();
if (!session?.user?.organizationId) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// All queries include organization filter
const jobs = await prisma.job.findMany({
  where: { organizationId: session.user.organizationId },
});
```

## Core Modules

### 1. Customer CRM
- Customer profiles with multiple properties
- Service history tracking
- Equipment association
- Communication history

### 2. Job Management
- Work order lifecycle: New → Scheduled → Assigned → In Progress → Completed → Invoiced
- Priority levels: Low, Normal, High, Urgent
- Job types: Installation, Repair, Maintenance, Inspection, Emergency, Quote
- Photo uploads and checklist items

### 3. Dispatch System
- Drag-and-drop scheduling interface
- Real-time technician availability
- Route optimization (Mapbox integration)
- Status tracking (Available, Busy, On Break, Offline)

### 4. Technician Mobile Interface
- Job queue view
- Navigation to job sites
- Time tracking
- Photo capture
- Digital signatures
- Offline capability (PWA)

### 5. Estimates & Invoicing
- Professional PDF generation
- Line items (labor, parts, materials)
- Discounts and tax calculations
- Online payment (Stripe integration)
- Payment status tracking

### 6. Equipment Tracking
- Equipment registry by customer/property
- Installation and warranty dates
- Service history
- Maintenance schedules

### 7. Inventory Management
- Part catalog with SKUs
- Stock level tracking
- Reorder alerts
- Parts usage per job

### 8. Reporting & Analytics
- Revenue dashboards
- Technician performance metrics
- Job completion rates
- Customer analytics

## Database Schema Highlights

### Key Relationships

```
Organization
├── Users[]
├── Customers[]
│   ├── Properties[]
│   ├── Equipment[]
│   └── Jobs[]
│       ├── JobAssignments[] → Technicians
│       ├── JobStatusHistory[]
│       ├── JobPhotos[]
│       └── Invoice?
├── Technicians[]
│   ├── Schedules[]
│   └── JobAssignments[]
├── InventoryItems[]
├── Estimates[]
└── AuditLogs[]
```

### Audit Logging

All changes are tracked for compliance:

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  organizationId String
  userId      String?
  action      AuditAction  // CREATE, UPDATE, DELETE, VIEW
  entityType  String
  entityId    String?
  oldValues   Json?
  newValues   Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
}
```

## Security

### Authentication
- NextAuth.js with credentials provider
- JWT-based sessions
- Secure password hashing (bcrypt)

### Authorization
- Role-based access control (RBAC):
  - OWNER: Full access
  - ADMIN: Full access except billing
  - DISPATCHER: Jobs, schedules, technicians
  - TECHNICIAN: Assigned jobs only
  - ACCOUNTANT: Invoices, estimates, reports

### Data Security
- All database queries filtered by organization
- Prepared statements via Prisma
- Input validation with Zod schemas
- HTTPS-only cookies

## Real-Time Features

### Socket.io Integration
```typescript
// Server-side
io.on("connection", (socket) => {
  socket.on("join-organization", (orgId) => {
    socket.join(`org:${orgId}`);
  });
});

// Broadcasting updates
io.to(`org:${organizationId}`).emit("job-status-changed", {
  jobId,
  status,
  timestamp: new Date(),
});
```

### Events
- Technician location updates
- Job status changes
- New assignments
- Schedule changes

## Frontend Architecture

### Component Structure
```
components/
├── ui/              # shadcn/ui base components
├── layout/          # Layout components (Sidebar, Header)
├── forms/           # Form components
├── data-display/    # Tables, lists, cards
└── map/             # Mapbox integration
```

### State Management
- Server state: TanStack Query (React Query)
- Client state: Zustand for global state
- Form state: React Hook Form

### Key Libraries
- Next.js 14+ with App Router
- React Server Components
- Tailwind CSS for styling
- shadcn/ui component library
- React DnD for drag-and-drop

## Deployment

### Recommended Infrastructure
- **Hosting**: Vercel (Next.js optimized)
- **Database**: PostgreSQL (Railway, Supabase, or AWS RDS)
- **File Storage**: AWS S3 or Cloudflare R2
- **CDN**: Cloudflare or Vercel Edge Network

### Environment Variables
```bash
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://yourdomain.com"

# Optional Integrations
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_MAPBOX_TOKEN="pk...."
AWS_ACCESS_KEY_ID="..."
```

## Future Enhancements

1. **Mobile Apps**: React Native or Flutter apps
2. **AI Features**: Predictive maintenance, smart scheduling
3. **IoT Integration**: Smart thermostat connections
4. **Voice Integration**: Alexa/Google Assistant for field techs
5. **Advanced Analytics**: ML-based insights

## Development

### Getting Started
```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Run dev server
npm run dev
```

### Test Accounts (Seed Data)
- owner@coolairhvac.com / password123
- admin@coolairhvac.com / password123
- dispatch@coolairhvac.com / password123

---

*This architecture is designed for scalability, security, and maintainability. The modular structure allows for incremental feature development and easy third-party integrations.*
