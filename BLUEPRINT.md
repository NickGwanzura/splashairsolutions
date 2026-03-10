# HVACOps - Complete SaaS Implementation Blueprint

## Executive Summary

This document provides the complete technical blueprint for building HVACOps, a ServiceTitan-competing HVAC Field Service Management SaaS platform. It covers all modules, routes, APIs, user management, permissions, and implementation details.

---

## 1. Complete Route Map

### Public Routes
```
/                    → Redirects to /login
/login               → Authentication page
/register            → Organization signup (for owners)
/invite/[token]      → Accept invitation page
/reset-password      → Password reset request
/reset-password/[token] → Set new password
```

### Protected Dashboard Routes
```
/dashboard                    → Main dashboard with KPIs
/dashboard/reports           → Quick reports view

/customers                   → Customer list (CRM)
/customers/new               → Create customer
/customers/[id]              → Customer detail view
/customers/[id]/edit         → Edit customer
/customers/[id]/jobs         → Customer job history
/customers/[id]/equipment    → Customer equipment
/customers/[id]/invoices     → Customer billing history

/jobs                        → Job list
/jobs/new                    → Create job
/jobs/[id]                   → Job detail
/jobs/[id]/edit              → Edit job
/jobs/[id]/dispatch          → Dispatch assignment
/jobs/[id]/checklist         → Job checklist
/jobs/[id]/photos            → Job photos
/jobs/[id]/invoice           → Create invoice from job

/dispatch                    → Main dispatch board
/dispatch/day-view           → Day scheduler
/dispatch/week-view          → Week scheduler
/dispatch/map                → Map view with technician locations
/dispatch/technicians        → Technician availability

/calendar                    → Full calendar view
/calendar/technician/[id]    → Individual technician calendar

/estimates                   → Estimates list
/estimates/new               → Create estimate
/estimates/[id]              → View estimate
/estimates/[id]/edit         → Edit estimate
/estimates/[id]/send         → Send to customer
/estimates/[id]/convert      → Convert to job

/invoices                    → Invoice list
/invoices/new                → Create invoice
/invoices/[id]               → View invoice
/invoices/[id]/edit          → Edit invoice
/invoices/[id]/send          → Send to customer
/invoices/[id]/payment       → Record payment
/invoices/[id]/pdf           → Download PDF

/payments                    → Payment history
/payments/online             → Online payment processing

/equipment                   → Equipment registry
/equipment/new               → Add equipment
/equipment/[id]              → Equipment detail
/equipment/[id]/maintenance  → Maintenance history
/equipment/[id]/warranty     → Warranty info

/inventory                   → Inventory list
/inventory/new               → Add inventory item
/inventory/[id]              → Item detail
/inventory/[id]/adjust       → Stock adjustment
/inventory/low-stock         → Low stock alerts
/inventory/purchase-orders   → Purchase orders

/reports                     → Reports dashboard
/reports/revenue             → Revenue reports
/reports/jobs                → Job analytics
/reports/technicians         → Technician performance
/reports/customers           → Customer analytics
/reports/inventory           → Inventory reports

/settings                    → Settings main
/settings/organization       → Organization details
/settings/users              → User management
/settings/users/invite       → Invite user
/settings/roles              → Role & permissions
/settings/billing            → Billing & subscription
/settings/integrations       → Third-party integrations
/settings/notifications      → Notification preferences
/settings/email              → Email templates
```

### API Routes Structure
```
/api/auth/*                  → NextAuth.js endpoints

/api/customers
  GET    → List customers
  POST   → Create customer
  
/api/customers/[id]
  GET    → Get customer
  PATCH  → Update customer
  DELETE → Delete customer

/api/customers/[id]/properties
  GET    → List properties
  POST   → Add property
  
/api/customers/[id]/equipment
  GET    → List equipment

/api/jobs
  GET    → List jobs
  POST   → Create job
  
/api/jobs/[id]
  GET    → Get job
  PATCH  → Update job
  DELETE → Delete job
  
/api/jobs/[id]/assign
  POST   → Assign technician
  
/api/jobs/[id]/status
  PATCH  → Update status
  
/api/jobs/[id]/photos
  GET    → List photos
  POST   → Upload photo
  
/api/jobs/[id]/notes
  GET    → List notes
  POST   → Add note

/api/dispatch
  GET    → Get dispatch data
  
/api/dispatch/assign
  POST   → Assign job to technician
  
/api/dispatch/schedule
  PATCH  → Update schedule

/api/technicians
  GET    → List technicians
  POST   → Create technician
  
/api/technicians/[id]
  GET    → Get technician
  PATCH  → Update technician
  
/api/technicians/[id]/location
  PATCH  → Update location (mobile)
  
/api/technicians/[id]/schedule
  GET    → Get schedule

/api/estimates
  GET    → List estimates
  POST   → Create estimate

/api/estimates/[id]
  GET    → Get estimate
  PATCH  → Update estimate
  
/api/estimates/[id]/send
  POST   → Send to customer
  
/api/estimates/[id]/convert
  POST   → Convert to job

/api/invoices
  GET    → List invoices
  POST   → Create invoice

/api/invoices/[id]
  GET    → Get invoice
  PATCH  → Update invoice
  
/api/invoices/[id]/send
  POST   → Send invoice
  
/api/invoices/[id]/payment
  POST   → Record payment

/api/payments
  GET    → List payments
  POST   → Process payment

/api/inventory
  GET    → List inventory
  POST   → Create item

/api/inventory/[id]
  GET    → Get item
  PATCH  → Update item
  
/api/inventory/[id]/adjust
  POST   → Adjust stock

/api/equipment
  GET    → List equipment
  POST   → Create equipment

/api/equipment/[id]
  GET    → Get equipment
  PATCH  → Update equipment

/api/reports/*               → Various report endpoints

/api/users
  GET    → List users
  
/api/users/invite
  POST   → Send invitation
  
/api/users/accept-invite
  POST   → Accept invitation

/api/users/[id]
  GET    → Get user
  PATCH  → Update user
  DELETE → Deactivate user

/api/notifications
  GET    → List notifications
  PATCH  → Mark as read

/api/upload                  → File upload
/api/webhooks/stripe         → Stripe webhooks
```

---

## 2. Module Specifications

### Module 1: Customer CRM

**Purpose**: Manage customer relationships, properties, and service history.

**Pages**:
- `/customers` - List view with search, filters, sorting
- `/customers/new` - Create customer form
- `/customers/[id]` - Detail view with tabs (Info, Properties, Jobs, Equipment, Invoices)
- `/customers/[id]/edit` - Edit form

**Key Components**:
- CustomerTable (sortable, filterable)
- CustomerForm (create/edit)
- PropertyCard (display property info)
- ServiceHistoryTimeline
- CustomerSearch (global search component)

**API Calls**:
- `GET /api/customers` - List with pagination
- `POST /api/customers` - Create
- `GET /api/customers/[id]` - Detail
- `PATCH /api/customers/[id]` - Update
- `GET /api/customers/[id]/jobs` - Service history

**Database Models**:
```prisma
model Customer {
  id              String
  organizationId  String
  firstName       String
  lastName        String
  email           String?
  phones          Json[]
  type            CustomerType
  status          CustomerStatus
  source          String?
  paymentTerms    String
  taxExempt       Boolean
  taxId           String?
  internalNotes   String?
  properties      Property[]
  jobs            Job[]
  equipment       Equipment[]
  invoices        Invoice[]
  createdAt       DateTime
  updatedAt       DateTime
}

model Property {
  id              String
  customerId      String
  name            String?
  address         String
  city            String
  state           String
  zipCode         String
  coordinates     Json?
  propertyType    PropertyType
  yearBuilt       Int?
  squareFootage   Int?
  gateCode        String?
  keyLocation     String?
  parkingNotes    String?
  isPrimary       Boolean
  jobs            Job[]
  equipment       Equipment[]
}
```

**Permissions**:
- Owner/Admin: Full CRUD
- Dispatcher: Read, Create, Update
- Technician: Read only
- Accountant: Read only

---

### Module 2: Job Management

**Purpose**: Full job lifecycle management from creation to completion.

**Pages**:
- `/jobs` - Kanban board or list view
- `/jobs/new` - Multi-step job creation
- `/jobs/[id]` - Job detail with all info
- `/jobs/[id]/edit` - Edit job
- `/jobs/[id]/checklist` - Job checklist

**Key Components**:
- JobBoard (Kanban with drag-drop)
- JobCard (compact job info)
- JobForm (creation/editing)
- JobTimeline (status history)
- PhotoGallery (job photos)
- ChecklistComponent
- AssignmentDropdown

**Status Workflow**:
```
NEW → SCHEDULED → ASSIGNED → EN_ROUTE → IN_PROGRESS → COMPLETED → INVOICED → PAID
   ↓        ↓          ↓          ↓            ↓           ↓
CANCELLED  (can go back/forward based on permissions)
```

**API Calls**:
- `GET /api/jobs` - List with filters
- `POST /api/jobs` - Create
- `GET /api/jobs/[id]` - Detail
- `PATCH /api/jobs/[id]` - Update
- `POST /api/jobs/[id]/assign` - Assign technician
- `PATCH /api/jobs/[id]/status` - Update status

**Database Models**:
```prisma
model Job {
  id                String
  jobNumber         String
  organizationId    String
  customerId        String
  propertyId        String
  type              JobType
  priority          Priority
  status            JobStatus
  title             String
  description       String?
  instructions      String?
  scheduledDate     DateTime?
  scheduledTimeStart DateTime?
  scheduledTimeEnd  DateTime?
  estimatedDuration Int?
  estimatedCost     Decimal?
  finalCost         Decimal?
  startedAt         DateTime?
  completedAt       DateTime?
  createdById       String
  assignments       JobAssignment[]
  statusHistory     JobStatusHistory[]
  checklistItems    JobChecklistItem[]
  photos            JobPhoto[]
  notes             JobNote[]
  invoice           Invoice?
}

model JobAssignment {
  id            String
  jobId         String
  technicianId  String
  assignedById  String
  assignedAt    DateTime
  isPrimary     Boolean
}

model JobStatusHistory {
  id          String
  jobId       String
  status      JobStatus
  notes       String?
  location    Json?
  createdAt   DateTime
  createdById String?
}
```

**Permissions**:
- Owner/Admin/Dispatcher: Full workflow control
- Technician: Can update status of assigned jobs only
- Accountant: View only

---

### Module 3: Dispatch Board

**Purpose**: Real-time scheduling and technician dispatch.

**Pages**:
- `/dispatch` - Main drag-and-drop board
- `/dispatch/map` - Map view
- `/dispatch/day-view` - Day schedule

**Key Components**:
- DispatchBoard (main container)
- TechnicianColumn (droppable column)
- JobCardDraggable (draggable job card)
- TimeGrid (time slots)
- MapView (Mapbox integration)
- TechnicianStatusBadge

**Drag & Drop Implementation**:
```typescript
// Using @dnd-kit/core
<DispatchBoard>
  {technicians.map(tech => (
    <Droppable id={tech.id}>
      <TechnicianColumn technician={tech}>
        {jobs.map(job => (
          <Draggable id={job.id}>
            <JobCard job={job} />
          </Draggable>
        ))}
      </TechnicianColumn>
    </Droppable>
  ))}
</DispatchBoard>
```

**Real-time Updates**:
- Socket.io events: `job-assigned`, `job-status-changed`
- Optimistic UI updates
- Conflict detection (double-booking)

**API Calls**:
- `GET /api/dispatch` - Get all data
- `POST /api/dispatch/assign` - Assign job
- `PATCH /api/dispatch/schedule` - Update time

**Permissions**:
- Owner/Admin/Dispatcher: Full control
- Technician: View only own assignments

---

### Module 4: Scheduling Calendar

**Purpose**: Calendar view for jobs and appointments.

**Pages**:
- `/calendar` - Full calendar
- `/calendar/technician/[id]` - Individual view

**Key Components**:
- FullCalendar or react-big-calendar
- CalendarToolbar (view switcher)
- EventCard (job/appointment display)
- NewEventModal

**API Calls**:
- `GET /api/technicians/[id]/schedule` - Get schedule

---

### Module 5: Estimates

**Purpose**: Create and manage customer quotes.

**Pages**:
- `/estimates` - List view
- `/estimates/new` - Create estimate
- `/estimates/[id]` - View/PDF preview
- `/estimates/[id]/edit` - Edit

**Key Components**:
- EstimateBuilder (line items)
- LineItemForm (add/edit items)
- EstimatePDFPreview
- CustomerSignaturePad
- EstimateStatusBadge

**Status Workflow**:
```
DRAFT → SENT → VIEWED → APPROVED → CONVERTED (to job)
   ↓                        ↓
EXPIRED                  REJECTED
```

**API Calls**:
- `GET /api/estimates` - List
- `POST /api/estimates` - Create
- `GET /api/estimates/[id]` - Detail
- `POST /api/estimates/[id]/send` - Send email
- `POST /api/estimates/[id]/convert` - Convert to job

**Database Models**:
```prisma
model Estimate {
  id                String
  estimateNumber    String
  organizationId    String
  customerId        String
  propertyId        String?
  status            EstimateStatus
  title             String
  description       String?
  lineItems         EstimateLineItem[]
  subtotal          Decimal
  discountAmount    Decimal
  discountPercent   Decimal
  taxRate           Decimal
  taxAmount         Decimal
  total             Decimal
  issueDate         DateTime
  expiryDate        DateTime?
  customerSignature Json?
  approvedAt        DateTime?
  convertedToJobId  String?
}

model EstimateLineItem {
  id            String
  estimateId    String
  type          LineItemType
  description   String
  quantity      Decimal
  unitPrice     Decimal
  total         Decimal
  sortOrder     Int
}
```

---

### Module 6: Invoicing & Payments

**Purpose**: Generate invoices and process payments.

**Pages**:
- `/invoices` - List with status filters
- `/invoices/new` - Create invoice
- `/invoices/[id]` - View/print
- `/payments` - Payment history

**Key Components**:
- InvoiceBuilder
- InvoicePDF (React PDF)
- PaymentForm (Stripe integration)
- InvoiceStatusBadge
- PaymentHistoryTable

**Status Workflow**:
```
DRAFT → SENT → VIEWED → PARTIAL → PAID
                   ↓
                OVERDUE
```

**API Calls**:
- `GET /api/invoices` - List
- `POST /api/invoices` - Create
- `POST /api/invoices/[id]/send` - Email invoice
- `POST /api/invoices/[id]/payment` - Record payment

**Database Models**:
```prisma
model Invoice {
  id              String
  invoiceNumber   String
  organizationId  String
  customerId      String
  jobId           String?
  status          InvoiceStatus
  issueDate       DateTime
  dueDate         DateTime
  paidAt          DateTime?
  lineItems       InvoiceLineItem[]
  subtotal        Decimal
  taxAmount       Decimal
  total           Decimal
  amountPaid      Decimal
  balanceDue      Decimal
  stripeInvoiceId String?
  payments        Payment[]
}

model Payment {
  id              String
  invoiceId       String
  amount          Decimal
  method          PaymentMethod
  status          PaymentStatus
  reference       String?
  stripePaymentIntentId String?
  processedAt     DateTime
}
```

**Permissions**:
- Owner/Admin/Accountant: Full control
- Dispatcher: Create invoices from completed jobs
- Technician: View only

---

### Module 7: Equipment Tracking

**Purpose**: Track HVAC equipment, warranties, and service history.

**Pages**:
- `/equipment` - Equipment registry
- `/equipment/new` - Add equipment
- `/equipment/[id]` - Detail view

**Key Components**:
- EquipmentTable
- EquipmentForm
- WarrantyBadge
- ServiceHistoryTimeline

**Database Models**:
```prisma
model Equipment {
  id              String
  organizationId  String
  customerId      String
  propertyId      String
  type            EquipmentType
  make            String
  model           String
  serialNumber    String
  installationDate DateTime?
  warrantyExpiry  DateTime?
  capacity        String?
  lastServiceDate DateTime?
  nextServiceDate DateTime?
  status          EquipmentStatus
  notes           String?
}
```

---

### Module 8: Inventory Management

**Purpose**: Track parts, materials, and stock levels.

**Pages**:
- `/inventory` - Inventory list
- `/inventory/new` - Add item
- `/inventory/low-stock` - Alerts
- `/inventory/purchase-orders` - PO management

**Key Components**:
- InventoryTable
- StockLevelIndicator
- LowStockAlertBanner
- PurchaseOrderForm

**Database Models**:
```prisma
model InventoryItem {
  id              String
  organizationId  String
  sku             String
  name            String
  description     String?
  category        String
  costPrice       Decimal
  salePrice       Decimal
  quantityOnHand  Int
  reorderPoint    Int
  reorderQuantity Int
  supplierId      String?
  isActive        Boolean
}
```

---

### Module 9: Reports & Analytics

**Purpose**: Business intelligence and analytics.

**Pages**:
- `/reports` - Dashboard
- `/reports/revenue` - Revenue analytics
- `/reports/technicians` - Performance metrics
- `/reports/jobs` - Job statistics

**Key Components**:
- ReportCard
- RevenueChart (Recharts)
- TechnicianPerformanceTable
- DateRangePicker

**API Calls**:
- `GET /api/reports/revenue` - Revenue data
- `GET /api/reports/technicians` - Performance data

---

### Module 10: Notifications

**Purpose**: In-app and email notifications.

**Components**:
- NotificationBell (header)
- NotificationPanel (dropdown)
- NotificationList
- NotificationBadge

**Types**:
- Job assigned
- Job status changed
- Estimate approved
- Invoice paid
- Low stock alert

**Database Models**:
```prisma
model Notification {
  id              String
  organizationId  String
  type            NotificationType
  title           String
  message         String
  entityType      String?
  entityId        String?
  channels        NotificationChannel[]
  createdAt       DateTime
  recipients      NotificationUser[]
}

model NotificationUser {
  id              String
  notificationId  String
  userId          String
  isRead          Boolean
  readAt          DateTime?
}
```

---

### Module 11: User Management & Invitations

**Purpose**: Full user lifecycle management.

**Pages**:
- `/settings/users` - User list
- `/settings/users/invite` - Invite modal
- `/invite/[token]` - Accept invitation

**Key Components**:
- UserTable
- InviteUserModal
- RoleSelector
- AcceptInvitationForm

**Email Invitation Flow**:
```
1. Admin enters email + selects role
2. System creates UserInvitation record
3. Email sent with unique token link
4. User clicks link → /invite/[token]
5. User sets password
6. Account activated
```

**Database Models**:
```prisma
model UserInvitation {
  id              String
  email           String
  organizationId  String
  role            UserRole
  token           String    @unique
  invitedById     String
  status          InvitationStatus
  expiresAt       DateTime
  acceptedAt      DateTime?
  createdAt       DateTime
}

model User {
  id              String
  email           String
  password        String?   // null for invite pending
  name            String?
  avatar          String?
  role            UserRole
  status          UserStatus
  organizationId  String
  invitedById     String?
  lastLoginAt     DateTime?
  createdAt       DateTime
}
```

---

## 3. Role-Based Access Control (RBAC)

### Role Definitions

#### Owner
- **Access**: Full system access
- **Capabilities**:
  - Manage organization settings
  - Manage billing/subscription
  - CRUD all users
  - Access all reports
  - Delete anything

#### Admin
- **Access**: All except billing changes
- **Capabilities**:
  - Manage users (except owners)
  - All CRUD operations
  - View all reports
  - Configure settings

#### Dispatcher
- **Access**: Operations-focused
- **Capabilities**:
  - Create/edit customers
  - Create/edit jobs
  - Full dispatch board access
  - Create estimates
  - View technicians
  - Create invoices (from completed jobs)

#### Technician
- **Access**: Field-focused
- **Capabilities**:
  - View assigned jobs only
  - Update job status
  - Add job notes/photos
  - View own schedule
  - Update availability status
- **Cannot**:
  - View financial data
  - Access customer payment info
  - See other technicians' jobs
  - Create invoices

#### Accountant
- **Access**: Financial-focused
- **Capabilities**:
  - View all invoices
  - Create/edit invoices
  - Record payments
  - View financial reports
  - View customers (read-only)
- **Cannot**:
  - Manage jobs
  - Dispatch technicians
  - Access technical job details

### Permission Matrix

| Feature | Owner | Admin | Dispatcher | Technician | Accountant |
|---------|-------|-------|------------|------------|------------|
| Organization Settings | ✓ | ✓ | ✗ | ✗ | ✗ |
| User Management | ✓ | ✓ | ✗ | ✗ | ✗ |
| Billing | ✓ | ✗ | ✗ | ✗ | ✗ |
| All Customers | ✓ | ✓ | ✓ | R | R |
| All Jobs | ✓ | ✓ | ✓ | Own | ✗ |
| Dispatch Board | ✓ | ✓ | ✓ | View | ✗ |
| Estimates | ✓ | ✓ | ✓ | ✗ | R |
| Invoices | ✓ | ✓ | Create | ✗ | ✓ |
| Payments | ✓ | ✓ | ✗ | ✗ | ✓ |
| Equipment | ✓ | ✓ | ✓ | R | R |
| Inventory | ✓ | ✓ | R | R | R |
| All Reports | ✓ | ✓ | Limited | Own | Financial |

---

## 4. Middleware Implementation

```typescript
// middleware.ts
import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

const ROLE_ROUTES = {
  OWNER: ["*"],
  ADMIN: ["*"],
  DISPATCHER: [
    "/dashboard",
    "/customers",
    "/jobs",
    "/dispatch",
    "/calendar",
    "/estimates",
    "/equipment",
  ],
  TECHNICIAN: [
    "/dashboard",
    "/jobs",
    "/schedule",
    "/profile",
  ],
  ACCOUNTANT: [
    "/dashboard",
    "/customers",
    "/invoices",
    "/payments",
    "/reports",
  ],
};

export default auth((req) => {
  const { nextUrl } = req;
  const user = req.auth?.user;

  // Public routes
  if (isPublicRoute(nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Not authenticated
  if (!user) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Check role-based access
  const allowedRoutes = ROLE_ROUTES[user.role] || [];
  
  if (allowedRoutes[0] === "*") {
    return NextResponse.next(); // Full access
  }

  const isAllowed = allowedRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});
```

---

## 5. Email Service Implementation

```typescript
// services/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail({
  to,
  organizationName,
  inviteToken,
  invitedBy,
}: {
  to: string;
  organizationName: string;
  inviteToken: string;
  invitedBy: string;
}) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`;

  await resend.emails.send({
    from: 'HVACOps <invites@hvacops.com>',
    to,
    subject: `You've been invited to join ${organizationName}`,
    html: `
      <h1>You're Invited!</h1>
      <p>${invitedBy} has invited you to join ${organizationName} on HVACOps.</p>
      <a href="${inviteUrl}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 4px;">
        Accept Invitation
      </a>
      <p>This link expires in 7 days.</p>
    `,
  });
}

export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  amount,
  pdfUrl,
}: {
  to: string;
  invoiceNumber: string;
  amount: string;
  pdfUrl: string;
}) {
  await resend.emails.send({
    from: 'HVACOps <invoices@hvacops.com>',
    to,
    subject: `Invoice ${invoiceNumber} - ${amount}`,
    html: `...`,
    attachments: [{ filename: `${invoiceNumber}.pdf`, path: pdfUrl }],
  });
}
```

---

## 6. Complete Folder Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── invite/[token]/page.tsx
│   └── layout.tsx
├── (dashboard)/
│   ├── dashboard/page.tsx
│   ├── customers/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       ├── edit/page.tsx
│   │       └── layout.tsx
│   ├── jobs/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       ├── edit/page.tsx
│   │       └── checklist/page.tsx
│   ├── dispatch/page.tsx
│   ├── calendar/page.tsx
│   ├── estimates/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── invoices/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── equipment/
│   ├── inventory/
│   ├── reports/
│   ├── settings/
│   │   ├── page.tsx
│   │   ├── organization/page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── invite/page.tsx
│   │   ├── billing/page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx
│   └── page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── customers/route.ts
│   ├── customers/[id]/route.ts
│   ├── jobs/route.ts
│   ├── jobs/[id]/route.ts
│   ├── jobs/[id]/assign/route.ts
│   ├── jobs/[id]/status/route.ts
│   ├── dispatch/route.ts
│   ├── technicians/route.ts
│   ├── estimates/route.ts
│   ├── invoices/route.ts
│   ├── users/route.ts
│   ├── users/invite/route.ts
│   ├── users/accept-invite/route.ts
│   └── webhooks/stripe/route.ts
├── layout.tsx
└── page.tsx

components/
├── ui/                    # shadcn components
├── layout/
│   ├── sidebar.tsx
│   ├── header.tsx
│   └── mobile-nav.tsx
├── customers/
│   ├── customer-table.tsx
│   ├── customer-form.tsx
│   └── customer-card.tsx
├── jobs/
│   ├── job-board.tsx
│   ├── job-card.tsx
│   ├── job-form.tsx
│   └── status-badge.tsx
├── dispatch/
│   ├── dispatch-board.tsx
│   ├── technician-column.tsx
│   └── job-draggable.tsx
├── invoices/
│   ├── invoice-builder.tsx
│   ├── invoice-table.tsx
│   └── payment-form.tsx
├── forms/
│   ├── address-input.tsx
│   ├── phone-input.tsx
│   └── money-input.tsx
└── tables/
    ├── data-table.tsx
    ├── pagination.tsx
    └── column-header.tsx

lib/
├── auth/
│   └── auth.ts
├── db/
│   ├── prisma.ts
│   └── queries/
│       ├── customers.ts
│       ├── jobs.ts
│       └── users.ts
├── services/
│   ├── email.ts
│   ├── payments.ts
│   ├── storage.ts
│   └── notifications.ts
├── permissions/
│   ├── roles.ts
│   └── checks.ts
├── utils.ts
└── hooks/
    ├── use-auth.ts
    ├── use-permissions.ts
    └── use-realtime.ts

prisma/
├── schema.prisma
└── seed.ts

types/
├── index.ts
└── next-auth.d.ts

public/
├── logo.svg
└── ...
```

---

## 7. Key Implementation Priorities

### Phase 1: Foundation (Week 1-2)
1. Complete authentication with NextAuth
2. User management & invitations
3. Organization settings
4. Role-based middleware

### Phase 2: Core Operations (Week 3-4)
1. Customer CRM
2. Job management
3. Basic dispatch board
4. Technician assignments

### Phase 3: Financial (Week 5-6)
1. Estimates
2. Invoicing
3. Payment integration (Stripe)
4. Email notifications

### Phase 4: Advanced (Week 7-8)
1. Equipment tracking
2. Inventory management
3. Reports & analytics
4. Mobile optimization

### Phase 5: Polish (Week 9-10)
1. Real-time updates (Socket.io)
2. File uploads (S3)
3. Advanced dispatch features
4. Performance optimization

---

This blueprint provides a complete roadmap for building a production-ready HVAC SaaS platform. Each module is designed to be scalable, secure, and user-friendly.
