"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatDate, getInitials, getStatusColor } from "@/lib/utils";
import type { Job, Technician } from "@/types";
import { JobStatus } from "@prisma/client";

// Mock technicians
const mockTechnicians: any[] = [
  {
    id: "t1",
    userId: "u1",
    organizationId: "org1",
    user: {
      id: "u1",
      email: "tech1@hvacops.com",
      name: "Mike Johnson",
      avatar: null,
      role: "TECHNICIAN",
      status: "ACTIVE",
      organizationId: "org1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    skills: ["AC Repair", "Installation"],
    status: "AVAILABLE",
    rating: 4.8,
    jobsCompleted: 156,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "t2",
    userId: "u2",
    organizationId: "org1",
    user: {
      id: "u2",
      email: "tech2@hvacops.com",
      name: "Sarah Williams",
      avatar: null,
      role: "TECHNICIAN",
      status: "ACTIVE",
      organizationId: "org1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    skills: ["Heat Pump", "Maintenance"],
    status: "BUSY",
    rating: 4.9,
    jobsCompleted: 203,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "t3",
    userId: "u3",
    organizationId: "org1",
    user: {
      id: "u3",
      email: "tech3@hvacops.com",
      name: "David Brown",
      avatar: null,
      role: "TECHNICIAN",
      status: "ACTIVE",
      organizationId: "org1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    skills: ["Commercial", "Refrigeration"],
    status: "AVAILABLE",
    rating: 4.7,
    jobsCompleted: 89,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock scheduled jobs
const mockScheduledJobs: Record<string, any[]> = {
  t1: [
    {
      id: "j1",
      jobNumber: "JOB-2024-0048",
      title: "AC Installation",
      status: "ASSIGNED",
      type: "INSTALLATION",
      priority: "NORMAL",
      customerId: "c1",
      propertyId: "p1",
      organizationId: "org1",
      scheduledDate: new Date(),
      scheduledTimeStart: new Date(new Date().setHours(9, 0)),
      scheduledTimeEnd: new Date(new Date().setHours(12, 0)),
      estimatedDuration: 180,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: "u1",
    },
    {
      id: "j2",
      jobNumber: "JOB-2024-0049",
      title: "Maintenance Check",
      status: "SCHEDULED",
      type: "MAINTENANCE",
      priority: "NORMAL",
      customerId: "c2",
      propertyId: "p2",
      organizationId: "org1",
      scheduledDate: new Date(),
      scheduledTimeStart: new Date(new Date().setHours(14, 0)),
      scheduledTimeEnd: new Date(new Date().setHours(15, 30)),
      estimatedDuration: 90,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: "u1",
    },
  ],
  t2: [
    {
      id: "j3",
      jobNumber: "JOB-2024-0050",
      title: "Emergency Repair",
      status: "IN_PROGRESS",
      type: "REPAIR",
      priority: "URGENT",
      customerId: "c3",
      propertyId: "p3",
      organizationId: "org1",
      scheduledDate: new Date(),
      scheduledTimeStart: new Date(new Date().setHours(8, 0)),
      estimatedDuration: 120,
      startedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: "u1",
    },
  ],
  t3: [],
};

// Time slots for the day
const timeSlots = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

export default function DispatchPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"board" | "list" | "map">("board");

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  const JobCard = ({ job }: { job: Job }) => {
    const startTime = job.scheduledTimeStart
      ? new Date(job.scheduledTimeStart)
      : null;
    const duration = job.estimatedDuration || 60;
    const height = Math.max(80, (duration / 60) * 60);

    return (
      <div
        className="absolute left-1 right-1 rounded-lg border p-2 text-xs cursor-pointer hover:shadow-md transition-shadow bg-white"
        style={{
          top: startTime ? `${(startTime.getHours() - 6) * 60 + startTime.getMinutes()}px` : "0",
          height: `${height}px`,
          zIndex: 10,
        }}
      >
        <Link href={`/jobs/${job.id}`}>
          <div className="flex items-center gap-1 mb-1">
            <Badge
              variant="outline"
              className={`text-[10px] px-1 py-0 ${getStatusColor(job.status)}`}
            >
              {job.status.replace("_", " ")}
            </Badge>
            {job.priority === "URGENT" && (
              <Badge variant="destructive" className="text-[10px] px-1 py-0">
                URGENT
              </Badge>
            )}
          </div>
          <p className="font-medium truncate">{job.jobNumber}</p>
          <p className="text-muted-foreground truncate">{job.title}</p>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{duration} min</span>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)]">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dispatch Board</h1>
          <p className="text-muted-foreground">
            Schedule and assign jobs to technicians
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === "board" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("board")}
            >
              Board
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
            <Button
              variant={viewMode === "map" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("map")}
            >
              Map
            </Button>
          </div>
          <Button asChild>
            <Link href="/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigateDate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="text-lg font-semibold">
              {formatDate(selectedDate, "EEEE, MMMM d, yyyy")}
            </p>
            <p className="text-sm text-muted-foreground">
              {mockTechnicians.filter((t) => t.status !== "OFFLINE").length} technicians available
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => navigateDate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
          Today
        </Button>
      </div>

      {/* Dispatch Board */}
      {viewMode === "board" && (
        <Card className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-[200px_1fr] border-b sticky top-0 bg-card z-20">
                <div className="p-4 font-semibold border-r">Technician</div>
                <div className="grid" style={{ gridTemplateColumns: `repeat(${timeSlots.length}, minmax(80px, 1fr))` }}>
                  {timeSlots.map((time) => (
                    <div key={time} className="p-2 text-center text-sm border-r last:border-r-0">
                      {time}
                    </div>
                  ))}
                </div>
              </div>

              {/* Technician Rows */}
              {mockTechnicians.map((tech) => (
                <div key={tech.id} className="grid grid-cols-[200px_1fr] border-b last:border-b-0">
                  {/* Technician Info */}
                  <div className="p-4 border-r bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-hvac-100 text-hvac-700">
                          {getInitials(tech.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{tech.user.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${getStatusColor(tech.status)}`}
                          >
                            {tech.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>555-0000</span>
                    </div>
                  </div>

                  {/* Schedule Grid */}
                  <div className="relative" style={{ height: "240px" }}>
                    {/* Time Grid Lines */}
                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${timeSlots.length}, 1fr)` }}>
                      {timeSlots.map((_, i) => (
                        <div key={i} className="border-r last:border-r-0" />
                      ))}
                    </div>

                    {/* Current Time Line */}
                    <div
                      className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
                      style={{ top: `${(new Date().getHours() - 6) * 60 + new Date().getMinutes()}px` }}
                    >
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-red-500 rounded-full" />
                    </div>

                    {/* Jobs */}
                    {mockScheduledJobs[tech.id]?.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Card>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Technician</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockTechnicians.map((tech) => (
                <div key={tech.id}>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-hvac-100 text-hvac-700 text-xs">
                        {getInitials(tech.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{tech.user.name}</span>
                    <Badge variant="outline" className={getStatusColor(tech.status)}>
                      {tech.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="ml-11 space-y-2">
                    {mockScheduledJobs[tech.id]?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No jobs scheduled</p>
                    ) : (
                      mockScheduledJobs[tech.id]?.map((job) => (
                        <div
                          key={job.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(job.status)}>
                              {job.status.replace("_", " ")}
                            </Badge>
                            <div>
                              <p className="font-medium">{job.jobNumber}</p>
                              <p className="text-sm text-muted-foreground">{job.title}</p>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {job.scheduledTimeStart
                              ? formatDate(job.scheduledTimeStart, "h:mm a")
                              : "Not scheduled"}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map View Placeholder */}
      {viewMode === "map" && (
        <Card className="h-[calc(100vh-20rem)]">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Map View</p>
              <p className="text-muted-foreground">
                Real-time technician tracking with Mapbox integration
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
