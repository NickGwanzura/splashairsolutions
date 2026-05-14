"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Beaker, Calendar, MapPin, Save, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, getStatusColor } from "@/lib/utils";
import { JobStatus, JobType, Priority } from "@prisma/client";

interface JobDetail {
  id: string;
  jobNumber: string;
  title: string;
  status: JobStatus;
  type: JobType;
  priority: Priority;
  description: string | null;
  scheduledDate: string | null;
  customer: {
    firstName: string;
    lastName: string;
    email: string | null;
  };
  property: {
    address: string;
    city: string;
    state: string;
  };
}

interface GasStock {
  id: string;
  gasType: string;
  brand: string;
  remaining: string;
  unit: string;
  supplier: string;
}

interface GasUsage {
  id: string;
  gasType: string;
  quantityUsed: string;
  purpose: string;
  usedAt: string;
  stock: {
    brand: string;
    unit: string;
  };
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = params.id;
  const [job, setJob] = useState<JobDetail | null>(null);
  const [gasStock, setGasStock] = useState<GasStock[]>([]);
  const [gasUsage, setGasUsage] = useState<GasUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    stockId: "",
    quantityUsed: "",
    purpose: "System recharge",
  });

  const selectedStock = useMemo(
    () => gasStock.find((stock) => stock.id === form.stockId) ?? null,
    [form.stockId, gasStock]
  );

  async function loadJobData() {
    setIsLoading(true);

    try {
      const [jobsResponse, stockResponse, usageResponse] = await Promise.all([
        fetch("/api/jobs?pageSize=200", { cache: "no-store" }),
        fetch("/api/gas-stock", { cache: "no-store" }),
        fetch(`/api/jobs/${jobId}/gas-usage`, { cache: "no-store" }),
      ]);

      if (!jobsResponse.ok || !stockResponse.ok || !usageResponse.ok) {
        throw new Error("Failed to load job gas data");
      }

      const jobsPayload = await jobsResponse.json();
      const stockPayload = await stockResponse.json();
      const usagePayload = await usageResponse.json();
      const loadedJob = (jobsPayload.data ?? []).find((item: JobDetail) => item.id === jobId) ?? null;
      const loadedStock = stockPayload.data ?? [];

      setJob(loadedJob);
      setGasStock(loadedStock);
      setGasUsage(usagePayload.data ?? []);

      if (!form.stockId && loadedStock[0]) {
        setForm((current) => ({ ...current, stockId: loadedStock[0].id }));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load job gas data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadJobData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/jobs/${jobId}/gas-usage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockId: form.stockId,
          quantityUsed: form.quantityUsed,
          purpose: form.purpose,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Failed to record gas usage");
      }

      toast.success("Gas usage recorded and stock reduced");
      setForm((current) => ({ ...current, quantityUsed: "" }));
      await loadJobData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to record gas usage");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading job...
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Job not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-2 px-0">
            <Link href="/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to jobs
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{job.jobNumber}</h1>
            <Badge variant="outline" className={getStatusColor(job.status)}>
              {job.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className={getStatusColor(job.priority)}>
              {job.priority}
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground">{job.title}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Job Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline">{job.type}</Badge>
              {job.scheduledDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(new Date(job.scheduledDate), "MMM d, yyyy h:mm a")}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {job.description || "No description provided."}
            </p>
            <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>
                  {job.customer.firstName} {job.customer.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {job.property.address}, {job.property.city}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5" />
              Record Gas Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="stockId">Gas Stock</Label>
                <select
                  id="stockId"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.stockId}
                  onChange={(event) => setForm((current) => ({ ...current, stockId: event.target.value }))}
                >
                  {gasStock.map((stock) => (
                    <option key={stock.id} value={stock.id}>
                      {stock.gasType} - {stock.brand} ({Number(stock.remaining).toFixed(2)} {stock.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantityUsed">Quantity Used</Label>
                  <Input
                    id="quantityUsed"
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.quantityUsed}
                    onChange={(event) => setForm((current) => ({ ...current, quantityUsed: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Remaining</Label>
                  <div className="flex h-10 items-center rounded-md border border-input px-3 text-sm">
                    {selectedStock
                      ? `${Number(selectedStock.remaining).toFixed(2)} ${selectedStock.unit}`
                      : "No stock"}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  required
                  value={form.purpose}
                  onChange={(event) => setForm((current) => ({ ...current, purpose: event.target.value }))}
                />
              </div>
              <Button type="submit" loading={isSaving} disabled={gasStock.length === 0}>
                <Save className="mr-2 h-4 w-4" />
                Record Usage
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gas Usage History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gas</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Recorded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gasUsage.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No gas usage recorded for this job yet.
                  </TableCell>
                </TableRow>
              ) : (
                gasUsage.map((usage) => (
                  <TableRow key={usage.id}>
                    <TableCell>
                      {usage.gasType} - {usage.stock.brand}
                    </TableCell>
                    <TableCell>
                      {Number(usage.quantityUsed).toFixed(2)} {usage.stock.unit}
                    </TableCell>
                    <TableCell>{usage.purpose}</TableCell>
                    <TableCell>{new Date(usage.usedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
