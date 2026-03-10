"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Calendar, MapPin, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, getStatusColor, formatCurrency } from "@/lib/utils";
import type { Job } from "@/types";
import { JobStatus } from "@prisma/client";

// Mock jobs data
const mockJobs: any[] = [
  {
    id: "1",
    jobNumber: "JOB-2024-0048",
    title: "AC Installation - 3 Ton Unit",
    status: "IN_PROGRESS",
    type: "INSTALLATION",
    priority: "NORMAL",
    customerId: "c1",
    propertyId: "p1",
    organizationId: "org1",
    description: "Install new 3 ton Carrier AC unit in residential home",
    scheduledDate: new Date(),
    scheduledTimeStart: new Date(),
    estimatedDuration: 240,
    estimatedCost: "3500.00",
    startedAt: new Date(),
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
    description: "Customer reports no cooling. Needs immediate attention.",
    scheduledDate: new Date(),
    scheduledTimeStart: new Date(),
    estimatedDuration: 120,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "u1",
  },
  {
    id: "3",
    jobNumber: "JOB-2024-0046",
    title: "Annual Maintenance - Heat Pump",
    status: "SCHEDULED",
    type: "MAINTENANCE",
    priority: "NORMAL",
    customerId: "c3",
    propertyId: "p3",
    organizationId: "org1",
    description: "Regular maintenance check and filter replacement",
    scheduledDate: new Date(Date.now() + 86400000),
    scheduledTimeStart: new Date(Date.now() + 86400000),
    estimatedDuration: 90,
    estimatedCost: "150.00",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "u1",
  },
  {
    id: "4",
    jobNumber: "JOB-2024-0045",
    title: "Ductwork Repair",
    status: "COMPLETED",
    type: "REPAIR",
    priority: "HIGH",
    customerId: "c4",
    propertyId: "p4",
    organizationId: "org1",
    description: "Repair leaking ductwork in attic",
    scheduledDate: new Date(Date.now() - 86400000),
    completedAt: new Date(Date.now() - 43200000),
    finalCost: "850.00",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "u1",
  },
];

const jobStatuses: JobStatus[] = [
  "NEW",
  "SCHEDULED",
  "ASSIGNED",
  "EN_ROUTE",
  "IN_PROGRESS",
  "COMPLETED",
  "INVOICED",
  "CANCELLED",
];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" &&
        !["COMPLETED", "INVOICED", "PAID", "CANCELLED"].includes(job.status)) ||
      (activeTab === "completed" && ["COMPLETED", "INVOICED", "PAID"].includes(job.status)) ||
      (activeTab === "urgent" && job.priority === "URGENT");

    return matchesSearch && matchesTab;
  });

  const JobCard = ({ job }: { job: Job }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <Link
                href={`/jobs/${job.id}`}
                className="font-medium text-lg hover:text-hvac-600 hover:underline"
              >
                {job.jobNumber}
              </Link>
              <p className="text-sm font-medium">{job.title}</p>
            </div>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className={getStatusColor(job.priority)}
              >
                {job.priority}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={getStatusColor(job.status)}
            >
              {job.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline">{job.type}</Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {job.scheduledDate
                ? formatDate(job.scheduledDate, "MMM d, h:mm a")
                : "Not scheduled"}
            </div>
            {job.estimatedCost && (
              <div className="font-medium text-foreground">
                Est: {formatCurrency(job.estimatedCost)}
              </div>
            )}
            {job.finalCost && (
              <div className="font-medium text-green-600">
                Final: {formatCurrency(job.finalCost)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <div className="flex items-center gap-1 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>John Smith</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>123 Main St</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">
            Manage work orders and track job progress
          </p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs and Grid */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No jobs found. Try adjusting your search or filters.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {jobStatuses.map((status) => (
          <div key={status} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${getStatusColor(status).split(" ")[0].replace("bg-", "bg-").replace("-50", "-500")}`}></span>
            <span className="text-muted-foreground">{status.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
