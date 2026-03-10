import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number | string | null | undefined, currency = "USD"): string {
  if (amount === null || amount === undefined) return "$0.00";
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(numAmount);
}

// Format date
export function formatDate(date: string | Date | null | undefined, pattern = "MMM d, yyyy"): string {
  if (!date) return "—";
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, pattern);
}

// Format relative time
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  
  if (isToday(dateObj)) return `Today at ${format(dateObj, "h:mm a")}`;
  if (isYesterday(dateObj)) return `Yesterday at ${format(dateObj, "h:mm a")}`;
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

// Format phone number
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "—";
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

// Generate unique ID
export function generateId(prefix = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate job number
export function generateJobNumber(sequence: number, year = new Date().getFullYear()): string {
  return `JOB-${year}-${String(sequence).padStart(4, "0")}`;
}

// Generate invoice number
export function generateInvoiceNumber(sequence: number, year = new Date().getFullYear()): string {
  return `INV-${year}-${String(sequence).padStart(4, "0")}`;
}

// Generate estimate number
export function generateEstimateNumber(sequence: number, year = new Date().getFullYear()): string {
  return `EST-${year}-${String(sequence).padStart(4, "0")}`;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Deep clone
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Safe JSON parse
export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// Calculate time difference in hours
export function getHoursDiff(start: Date | string, end: Date | string): number {
  const startDate = typeof start === "string" ? parseISO(start) : start;
  const endDate = typeof end === "string" ? parseISO(end) : end;
  return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
}

// Format duration
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

// Get initials from name
export function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Slugify text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// File size formatter
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Color helpers for status badges
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: "bg-gray-100 text-gray-800 border-gray-200",
    SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
    ASSIGNED: "bg-indigo-50 text-indigo-700 border-indigo-200",
    EN_ROUTE: "bg-amber-50 text-amber-700 border-amber-200",
    IN_PROGRESS: "bg-orange-50 text-orange-700 border-orange-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    INVOICED: "bg-purple-50 text-purple-700 border-purple-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
    DRAFT: "bg-gray-100 text-gray-800 border-gray-200",
    SENT: "bg-blue-50 text-blue-700 border-blue-200",
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
    OVERDUE: "bg-red-50 text-red-700 border-red-200",
    APPROVED: "bg-green-50 text-green-700 border-green-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    LOW: "bg-gray-100 text-gray-800 border-gray-200",
    NORMAL: "bg-blue-50 text-blue-700 border-blue-200",
    HIGH: "bg-orange-50 text-orange-700 border-orange-200",
    URGENT: "bg-red-50 text-red-700 border-red-200",
    AVAILABLE: "bg-green-50 text-green-700 border-green-200",
    BUSY: "bg-orange-50 text-orange-700 border-orange-200",
    OFFLINE: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
}
