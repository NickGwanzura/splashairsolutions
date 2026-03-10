"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Briefcase,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import type { DashboardMetrics, Job, Invoice } from "@/types";
import { JobStatus, Priority, InvoiceStatus } from "@prisma/client";

// Mock data for initial UI
const mockMetrics: DashboardMetrics = {
  totalRevenue: 125430,
  revenueChange: 12.5,
  jobsCompleted: 48,
  jobsChange: 8.2,
  activeJobs: 15,
  invoicesPending: 12,
  averageJobValue: 2613,
  technicianUtilization: 78,
};

const mockRecentJobs: any[] = [
  {
    id: "1",
    jobNumber: "JOB-2024-0048",
    title: "AC Installation - Residential",
    status: "IN_PROGRESS",
    type: "INSTALLATION",
    priority: "NORMAL",
    customerId: "c1",
    propertyId: "p1",
    organizationId: "org1",
    scheduledDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "u1",
  },
  {
    id: "2",
    jobNumber: "JOB-2024-0047",
    title: "Emergency Repair - No Cooling",
    status: "ASSIGNED",
    type: "REPAIR",
    priority: "URGENT",
    customerId: "c2",
    propertyId: "p2",
    organizationId: "org1",
    scheduledDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "u1",
  },
  {
    id: "3",
    jobNumber: "JOB-2024-0046",
    title: "Annual Maintenance Contract",
    status: "SCHEDULED",
    type: "MAINTENANCE",
    priority: "NORMAL",
    customerId: "c3",
    propertyId: "p3",
    organizationId: "org1",
    scheduledDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "u1",
  },
];

const mockPendingInvoices: any[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-0021",
    status: "SENT",
    total: "3250.00",
    customerId: "c1",
    organizationId: "org1",
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    amountPaid: "0",
    balanceDue: "3250.00",
    subtotal: "3000.00",
    taxAmount: "250.00",
    taxRate: "8.33",
    discountAmount: "0",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "u1",
    lineItems: [],
  },
];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 500);
  }, []);

  const MetricCard = ({
    title,
    value,
    change,
    changeLabel,
    icon: Icon,
  }: {
    title: string;
    value: string;
    change?: number;
    changeLabel?: string;
    icon: React.ElementType;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center text-xs">
            {change >= 0 ? (
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span className={change >= 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(change)}%
            </span>
            <span className="text-muted-foreground ml-1">{changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-28 animate-pulse" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="h-96 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              New Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={metrics.revenueChange}
          changeLabel="vs last month"
          icon={DollarSign}
        />
        <MetricCard
          title="Jobs Completed"
          value={metrics.jobsCompleted.toString()}
          change={metrics.jobsChange}
          changeLabel="vs last month"
          icon={Briefcase}
        />
        <MetricCard
          title="Active Jobs"
          value={metrics.activeJobs.toString()}
          icon={Clock}
        />
        <MetricCard
          title="Pending Invoices"
          value={metrics.invoicesPending.toString()}
          icon={Clock}
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="invoices">Pending Invoices</TabsTrigger>
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Latest jobs and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="font-medium hover:underline"
                        >
                          {job.jobNumber}
                        </Link>
                        <Badge
                          variant="outline"
                          className={getStatusColor(job.status)}
                        >
                          {job.status.replace("_", " ")}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getStatusColor(job.priority)}
                        >
                          {job.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{job.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Scheduled: {formatDate(job.scheduledDate)}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/jobs/${job.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="outline" asChild>
                  <Link href="/jobs">View All Jobs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invoices</CardTitle>
              <CardDescription>Invoices awaiting payment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPendingInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="font-medium hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                        <Badge
                          variant="outline"
                          className={getStatusColor(invoice.status)}
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(invoice.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due: {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/invoices/${invoice.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technician Status</CardTitle>
              <CardDescription>Current technician availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Technician tracking coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
