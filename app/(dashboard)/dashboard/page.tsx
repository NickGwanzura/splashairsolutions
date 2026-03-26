"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button as CarbonButton,
  Column,
  Grid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Tile,
} from "@carbon/react";
import {
  ArrowRight,
  CurrencyDollar,
  Add,
  ChartLine,
  CheckmarkOutline,
  Pending,
  Time,
} from "@carbon/icons-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DashboardMetrics } from "@/types";

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

const mockRecentJobs = [
  {
    id: "1",
    jobNumber: "JOB-2024-0048",
    title: "AC Installation - Residential",
    status: "IN_PROGRESS",
    priority: "NORMAL",
    scheduledDate: new Date(),
  },
  {
    id: "2",
    jobNumber: "JOB-2024-0047",
    title: "Emergency Repair - No Cooling",
    status: "ASSIGNED",
    priority: "URGENT",
    scheduledDate: new Date(),
  },
  {
    id: "3",
    jobNumber: "JOB-2024-0046",
    title: "Annual Maintenance Contract",
    status: "SCHEDULED",
    priority: "NORMAL",
    scheduledDate: new Date(),
  },
];

const mockPendingInvoices = [
  {
    id: "1",
    invoiceNumber: "INV-2024-0021",
    status: "SENT",
    total: "3250.00",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
];

type CarbonTagType = "blue" | "cool-gray" | "green" | "red" | "teal" | "warm-gray";

function getStatusTagType(status: string): CarbonTagType {
  switch (status) {
    case "IN_PROGRESS":
      return "blue";
    case "ASSIGNED":
      return "teal";
    case "SCHEDULED":
    case "SENT":
      return "cool-gray";
    case "COMPLETED":
      return "green";
    default:
      return "warm-gray";
  }
}

function getPriorityTagType(priority: string): CarbonTagType {
  switch (priority) {
    case "URGENT":
      return "red";
    case "HIGH":
      return "blue";
    default:
      return "warm-gray";
  }
}

function MetricTile({
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
}) {
  return (
    <Tile className="flex h-full flex-col justify-between border-t-4 border-t-[#0f62fe] !bg-white !p-6 shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {title}
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-foreground">
            {value}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center bg-[#edf5ff] text-[#0f62fe]">
          <Icon size={24} />
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-6 flex items-center gap-2 text-sm">
          {change >= 0 ? (
            <TrendingUp className="h-4 w-4 text-[#198038]" />
          ) : (
            <TrendingDown className="h-4 w-4 text-[#da1e28]" />
          )}
          <span className={change >= 0 ? "text-[#198038]" : "text-[#da1e28]"}>
            {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground">{changeLabel}</span>
        </div>
      )}
    </Tile>
  );
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, []);

  if (loading || !metrics) {
    return (
      <Grid fullWidth condensed className="gap-y-4">
        {[0, 1, 2, 3].map((item) => (
          <Column key={item} sm={4} md={4} lg={4}>
            <div className="h-48 animate-pulse bg-white" />
          </Column>
        ))}
        <Column sm={4} md={8} lg={16}>
          <div className="h-[28rem] animate-pulse bg-white" />
        </Column>
      </Grid>
    );
  }

  return (
    <div className="space-y-8">
      <Grid fullWidth condensed className="items-end gap-y-6">
        <Column sm={4} md={5} lg={10}>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
              Service operations
            </p>
            <h1 className="text-5xl font-semibold tracking-[-0.04em] text-foreground">
              Dashboard
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              A Carbon-aligned operations overview for dispatch, service throughput,
              invoice flow, and technician momentum.
            </p>
          </div>
        </Column>
        <Column sm={4} md={3} lg={6} className="flex justify-start lg:justify-end">
          <CarbonButton as={Link} href="/jobs/new" renderIcon={Add} size="lg">
            Create work order
          </CarbonButton>
        </Column>
      </Grid>

      <Grid fullWidth condensed className="gap-y-4">
        <Column sm={4} md={4} lg={4}>
          <MetricTile
            title="Total Revenue"
            value={formatCurrency(metrics.totalRevenue)}
            change={metrics.revenueChange}
            changeLabel="vs last month"
            icon={CurrencyDollar}
          />
        </Column>
        <Column sm={4} md={4} lg={4}>
          <MetricTile
            title="Jobs Completed"
            value={metrics.jobsCompleted.toString()}
            change={metrics.jobsChange}
            changeLabel="vs last month"
            icon={CheckmarkOutline}
          />
        </Column>
        <Column sm={4} md={4} lg={4}>
          <MetricTile
            title="Active Jobs"
            value={metrics.activeJobs.toString()}
            icon={Time}
          />
        </Column>
        <Column sm={4} md={4} lg={4}>
          <MetricTile
            title="Pending Invoices"
            value={metrics.invoicesPending.toString()}
            icon={Pending}
          />
        </Column>
      </Grid>

      <Grid fullWidth condensed className="gap-y-4">
        <Column sm={4} md={8} lg={12}>
          <Tile className="!bg-white !p-0 shadow-none">
            <div className="border-b border-border px-6 py-5">
              <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
                Control center
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                Work in motion
              </h2>
            </div>

            <Tabs defaultSelectedIndex={0}>
              <TabList aria-label="Dashboard views" contained>
                <Tab>Active jobs</Tab>
                <Tab>Pending invoices</Tab>
                <Tab>Technicians</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <div className="divide-y divide-border">
                    {mockRecentJobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="text-lg font-semibold tracking-[-0.02em] text-foreground transition-colors hover:text-primary"
                            >
                              {job.jobNumber}
                            </Link>
                            <Tag type={getStatusTagType(job.status)} size="sm">
                              {job.status.replace("_", " ")}
                            </Tag>
                            <Tag type={getPriorityTagType(job.priority)} size="sm">
                              {job.priority}
                            </Tag>
                          </div>
                          <p className="text-sm text-foreground">{job.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Scheduled for {formatDate(job.scheduledDate)}
                          </p>
                        </div>
                        <CarbonButton
                          as={Link}
                          href={`/jobs/${job.id}`}
                          kind="ghost"
                          renderIcon={ArrowRight}
                          iconDescription="Open job"
                        >
                          View job
                        </CarbonButton>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border px-6 py-5">
                    <CarbonButton as={Link} href="/jobs" kind="tertiary" renderIcon={ChartLine}>
                      View all jobs
                    </CarbonButton>
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="divide-y divide-border">
                    {mockPendingInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="text-lg font-semibold tracking-[-0.02em] text-foreground transition-colors hover:text-primary"
                            >
                              {invoice.invoiceNumber}
                            </Link>
                            <Tag type={getStatusTagType(invoice.status)} size="sm">
                              {invoice.status}
                            </Tag>
                          </div>
                          <p className="text-3xl font-semibold tracking-[-0.03em]">
                            {formatCurrency(invoice.total)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Due by {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                        <CarbonButton
                          as={Link}
                          href={`/invoices/${invoice.id}`}
                          kind="ghost"
                          renderIcon={ArrowRight}
                          iconDescription="Open invoice"
                        >
                          Review invoice
                        </CarbonButton>
                      </div>
                    ))}
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="px-6 py-10 text-sm leading-7 text-muted-foreground">
                    Technician presence, dispatch utilization, and route readiness are
                    the next Carbon module to wire in here.
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Tile>
        </Column>

        <Column sm={4} md={8} lg={4}>
          <Tile className="flex h-full flex-col !bg-white !p-6 shadow-none">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
              Planning signal
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              Revenue outlook
            </h2>
            <div className="mt-8 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground">Average job value</p>
                <p className="mt-2 text-4xl font-semibold tracking-[-0.03em]">
                  {formatCurrency(metrics.averageJobValue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Technician utilization</p>
                <p className="mt-2 text-4xl font-semibold tracking-[-0.03em]">
                  {metrics.technicianUtilization}%
                </p>
              </div>
              <div className="border-t border-border pt-6 text-sm leading-7 text-muted-foreground">
                Carbon’s structured spacing makes the high-priority numbers immediate,
                while the supporting context stays readable and calm.
              </div>
            </div>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
}
