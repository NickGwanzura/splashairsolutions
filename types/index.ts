import {
  JobStatus,
  JobType,
  Priority,
  InvoiceStatus,
  EstimateStatus,
  TechnicianStatus,
  UserRole,
  CustomerType,
  CustomerStatus,
  EquipmentType,
  EquipmentStatus,
  ScheduleType,
  NotificationType,
  PaymentMethod,
  LineItemType,
} from "@prisma/client";

// ============================================
// Base Types
// ============================================

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Organization & User Types
// ============================================

export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  logo: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  timezone: string;
  currency: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  maxUsers: number;
  maxTechnicians: number;
}

export interface User extends BaseEntity {
  email: string;
  name: string | null;
  avatar: string | null;
  phone: string | null;
  role: UserRole;
  status: string;
  organizationId: string;
  lastLoginAt: Date | null;
}

export interface UserWithOrganization extends User {
  organization: Organization;
}

// ============================================
// Customer Types
// ============================================

export interface Customer extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string | null;
  phones: Phone[];
  type: CustomerType;
  status: CustomerStatus;
  source: string | null;
  paymentTerms: string;
  taxExempt: boolean;
  taxId: string | null;
  internalNotes: string | null;
  organizationId: string;
  createdById: string;
}

export interface Phone {
  number: string;
  type: "MOBILE" | "HOME" | "WORK" | "OTHER";
  isPrimary: boolean;
}

export interface Property extends BaseEntity {
  customerId: string;
  name: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: { lat: number; lng: number } | null;
  propertyType: string;
  yearBuilt: number | null;
  squareFootage: number | null;
  notes: string | null;
  gateCode: string | null;
  keyLocation: string | null;
  parkingNotes: string | null;
  isPrimary: boolean;
}

export interface CustomerWithProperties extends Customer {
  properties: Property[];
}

export interface CustomerWithDetails extends Customer {
  properties: Property[];
  equipment: Equipment[];
  jobs: Job[];
  invoices: Invoice[];
}

// ============================================
// Job Types
// ============================================

export interface Job extends BaseEntity {
  jobNumber: string;
  organizationId: string;
  customerId: string;
  propertyId: string;
  type: JobType;
  priority: Priority;
  status: JobStatus;
  title: string;
  description: string | null;
  instructions: string | null;
  scheduledDate: Date | null;
  scheduledTimeStart: Date | null;
  scheduledTimeEnd: Date | null;
  estimatedDuration: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
  estimatedCost: string | null;
  finalCost: string | null;
  sourceEstimateId: string | null;
  createdById: string;
}

export interface JobWithDetails extends Job {
  customer: Customer;
  property: Property;
  assignments: JobAssignment[];
  statusHistory: JobStatusHistory[];
  photos: JobPhoto[];
  notes: JobNote[];
}

export interface JobAssignment {
  id: string;
  jobId: string;
  technicianId: string;
  technician: Technician;
  assignedById: string;
  assignedAt: Date;
  isPrimary: boolean;
}

export interface JobStatusHistory {
  id: string;
  jobId: string;
  status: JobStatus;
  notes: string | null;
  location: { lat: number; lng: number } | null;
  createdAt: Date;
  createdById: string | null;
}

export interface JobPhoto {
  id: string;
  jobId: string;
  url: string;
  caption: string | null;
  category: string | null;
  takenAt: Date;
  takenById: string | null;
  location: { lat: number; lng: number } | null;
}

export interface JobNote {
  id: string;
  jobId: string;
  content: string;
  isInternal: boolean;
  createdAt: Date;
  createdById: string;
}

// ============================================
// Technician Types
// ============================================

export interface Technician extends BaseEntity {
  userId: string;
  user: User;
  organizationId: string;
  employeeId: string | null;
  skills: string[];
  certifications: string[];
  licenseNumber: string | null;
  vehicleInfo: VehicleInfo | null;
  status: TechnicianStatus;
  currentLocation: { lat: number; lng: number; updatedAt: Date } | null;
  workSchedule: WorkSchedule | null;
  rating: number;
  jobsCompleted: number;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

export interface WorkSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isWorking: boolean;
  startTime: string;
  endTime: string;
}

// ============================================
// Schedule Types
// ============================================

export interface Schedule extends BaseEntity {
  organizationId: string;
  technicianId: string;
  technician: Technician;
  title: string;
  type: ScheduleType;
  startTime: Date;
  endTime: Date;
  jobId: string | null;
  notes: string | null;
  isAllDay: boolean;
}

// ============================================
// Equipment Types
// ============================================

export interface Equipment extends BaseEntity {
  organizationId: string;
  customerId: string;
  propertyId: string;
  type: EquipmentType;
  make: string;
  model: string;
  serialNumber: string;
  location: string | null;
  manufactureDate: Date | null;
  installationDate: Date | null;
  warrantyExpiry: Date | null;
  capacity: string | null;
  voltage: string | null;
  fuelType: string | null;
  lastServiceDate: Date | null;
  nextServiceDate: Date | null;
  serviceInterval: number | null;
  status: EquipmentStatus;
  condition: string | null;
  notes: string | null;
}

// ============================================
// Inventory Types
// ============================================

export interface InventoryItem extends BaseEntity {
  organizationId: string;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  costPrice: string;
  salePrice: string;
  quantityOnHand: number;
  quantityReserved: number;
  reorderPoint: number;
  reorderQuantity: number;
  binLocation: string | null;
  supplierId: string | null;
  supplierSku: string | null;
  isActive: boolean;
  trackSerialNumbers: boolean;
}

// ============================================
// Invoice Types
// ============================================

export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  organizationId: string;
  customerId: string;
  customer: Customer;
  jobId: string | null;
  job: Job | null;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidAt: Date | null;
  sentAt: Date | null;
  lineItems: InvoiceLineItem[];
  subtotal: string;
  discountAmount: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  amountPaid: string;
  balanceDue: string;
  customerNotes: string | null;
  internalNotes: string | null;
  terms: string | null;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  type: LineItemType;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
  sortOrder: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: string;
  method: PaymentMethod;
  status: string;
  reference: string | null;
  notes: string | null;
  processedAt: Date;
  processedBy: string | null;
}

// ============================================
// Estimate Types
// ============================================

export interface Estimate extends BaseEntity {
  estimateNumber: string;
  organizationId: string;
  customerId: string;
  customer: Customer;
  propertyId: string | null;
  status: EstimateStatus;
  issueDate: Date;
  expiryDate: Date | null;
  title: string;
  description: string | null;
  lineItems: EstimateLineItem[];
  subtotal: string;
  discountAmount: string;
  discountPercent: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  convertedToJobId: string | null;
  customerSignature: CustomerSignature | null;
  approvedAt: Date | null;
}

export interface EstimateLineItem {
  id: string;
  estimateId: string;
  type: LineItemType;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
  sortOrder: number;
}

export interface CustomerSignature {
  signedAt: Date;
  signatureData: string;
  ipAddress: string;
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  channels: string[];
  scheduledFor: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  isRead: boolean;
  readAt: Date | null;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardMetrics {
  totalRevenue: number;
  revenueChange: number;
  jobsCompleted: number;
  jobsChange: number;
  activeJobs: number;
  invoicesPending: number;
  averageJobValue: number;
  technicianUtilization: number;
}

export interface RevenueChartData {
  labels: string[];
  data: number[];
}

export interface JobStatusCount {
  status: JobStatus;
  count: number;
}

export interface TechnicianPerformance {
  technicianId: string;
  name: string;
  avatar: string | null;
  jobsCompleted: number;
  revenue: number;
  rating: number;
  averageJobTime: number;
}

// ============================================
// Form Types
// ============================================

export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  email?: string;
  phones: Phone[];
  type: CustomerType;
  internalNotes?: string;
}

export interface CreateJobInput {
  customerId: string;
  propertyId: string;
  type: JobType;
  priority: Priority;
  title: string;
  description?: string;
  instructions?: string;
  scheduledDate?: Date;
  scheduledTimeStart?: Date;
  scheduledTimeEnd?: Date;
  estimatedDuration?: number;
  estimatedCost?: number;
}

export interface CreateInvoiceInput {
  customerId: string;
  jobId?: string;
  lineItems: CreateLineItemInput[];
  discountAmount?: number;
  taxRate?: number;
  customerNotes?: string;
  internalNotes?: string;
  terms?: string;
}

export interface CreateLineItemInput {
  type: LineItemType;
  description: string;
  quantity: number;
  unitPrice: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, any>;
}
