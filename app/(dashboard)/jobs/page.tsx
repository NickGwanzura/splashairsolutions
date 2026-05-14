"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Plus, Search, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, getStatusColor, formatCurrency } from "@/lib/utils";
import { JobStatus, JobType, Priority } from "@prisma/client";

interface JobRow {
  id: string;
  jobNumber: string;
  title: string;
  status: JobStatus;
  type: JobType;
  priority: Priority;
  description: string | null;
  scheduledDate: string | null;
  estimatedCost: string | null;
  finalCost: string | null;
  customer: {
    firstName: string;
    lastName: string;
  };
  property: {
    address: string;
    city: string;
  };
}

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
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/jobs?pageSize=100", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to load jobs");
        }

        const payload = await response.json();

        if (!cancelled) {
          setJobs(payload.data ?? []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load jobs");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return jobs.filter((job) => {
      const customerName = `${job.customer?.firstName ?? ""} ${job.customer?.lastName ?? ""}`;
      const matchesSearch =
        !normalizedSearch ||
        job.jobNumber.toLowerCase().includes(normalizedSearch) ||
        job.title.toLowerCase().includes(normalizedSearch) ||
        job.description?.toLowerCase().includes(normalizedSearch) ||
        customerName.toLowerCase().includes(normalizedSearch);

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "active" &&
          !["COMPLETED", "INVOICED", "PAID", "CANCELLED"].includes(job.status)) ||
        (activeTab === "completed" && ["COMPLETED", "INVOICED", "PAID"].includes(job.status)) ||
        (activeTab === "urgent" && job.priority === "URGENT");

      return matchesSearch && matchesTab;
    });
  }, [activeTab, jobs, searchQuery]);

  const JobCard = ({ job }: { job: JobRow }) => (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link
                href={`/jobs/${job.id}`}
                className="font-medium text-lg hover:text-hvac-600 hover:underline"
              >
                {job.jobNumber}
              </Link>
              <p className="text-sm font-medium">{job.title}</p>
            </div>
            <Badge variant="outline" className={getStatusColor(job.priority)}>
              {job.priority}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description || "No description provided."}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getStatusColor(job.status)}>
              {job.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline">{job.type}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {job.scheduledDate ? formatDate(new Date(job.scheduledDate), "MMM d, h:mm a") : "Not scheduled"}
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

          <div className="flex items-center gap-2 border-t pt-2">
            <div className="flex items-center gap-1 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>
                {job.customer?.firstName} {job.customer?.lastName}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {job.property?.address}
                {job.property?.city ? `, ${job.property.city}` : ""}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">Manage work orders and track job progress</p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Link>
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-9"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Loading jobs...
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-12 text-center text-destructive">{error}</CardContent>
            </Card>
          ) : filteredJobs.length === 0 ? (
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

      <div className="flex flex-wrap gap-4 text-sm">
        {jobStatuses.map((status) => (
          <div key={status} className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${getStatusColor(status)
                .split(" ")[0]
                .replace("bg-", "bg-")
                .replace("-50", "-500")}`}
            />
            <span className="text-muted-foreground">{status.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
