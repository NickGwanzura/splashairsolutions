"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobType, Priority } from "@prisma/client";

interface CustomerOption {
  id: string;
  firstName: string;
  lastName: string;
  properties: Array<{
    id: string;
    name: string | null;
    address: string;
    city: string;
  }>;
}

export default function NewJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCustomerId = searchParams.get("customerId");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    customerId: requestedCustomerId ?? "",
    propertyId: "",
    title: "",
    type: "REPAIR" as JobType,
    priority: "NORMAL" as Priority,
    description: "",
    instructions: "",
    scheduledAt: "",
    estimatedDuration: "",
    estimatedCost: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadCustomers() {
      setIsLoadingCustomers(true);

      try {
        const response = await fetch("/api/customers?pageSize=200", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to load customers");
        }

        const payload = await response.json();
        const loadedCustomers = payload.data ?? [];

        if (!cancelled) {
          setCustomers(loadedCustomers);

          const selectedCustomer =
            loadedCustomers.find((customer: CustomerOption) => customer.id === (requestedCustomerId ?? "")) ??
            loadedCustomers[0];

          if (selectedCustomer) {
            setForm((current) => ({
              ...current,
              customerId: current.customerId || selectedCustomer.id,
              propertyId: current.propertyId || selectedCustomer.properties[0]?.id || "",
            }));
          }
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Failed to load customers");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCustomers(false);
        }
      }
    }

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, [requestedCustomerId]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === form.customerId) ?? null,
    [customers, form.customerId]
  );

  const updateField = (name: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((item) => item.id === customerId);

    setForm((current) => ({
      ...current,
      customerId,
      propertyId: customer?.properties[0]?.id || "",
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.customerId || !form.propertyId) {
      toast.error("Choose a customer and property before saving");
      return;
    }

    setIsSaving(true);

    try {
      const scheduledDate = form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined;

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: form.customerId,
          propertyId: form.propertyId,
          title: form.title,
          type: form.type,
          priority: form.priority,
          description: form.description || undefined,
          instructions: form.instructions || undefined,
          scheduledDate,
          scheduledTimeStart: scheduledDate,
          estimatedDuration: form.estimatedDuration ? Number(form.estimatedDuration) : undefined,
          estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Failed to create job");
      }

      toast.success("Job saved");
      router.push("/jobs");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create job");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-2 px-0">
            <Link href="/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to jobs
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">New Job</h1>
          <p className="text-muted-foreground">Create a work order that persists to the database.</p>
        </div>
        <Button type="submit" loading={isSaving} disabled={isLoadingCustomers || customers.length === 0}>
          <Save className="mr-2 h-4 w-4" />
          Save Job
        </Button>
      </div>

      {customers.length === 0 && !isLoadingCustomers ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Add a customer with a property before creating a job.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  required
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(event) => updateField("type", event.target.value)}
                >
                  <option value="INSTALLATION">Installation</option>
                  <option value="REPAIR">Repair</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INSPECTION">Inspection</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="QUOTE">Quote</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.priority}
                  onChange={(event) => updateField("priority", event.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Scheduled Time</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(event) => updateField("scheduledAt", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Estimated Minutes</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  min="0"
                  value={form.estimatedDuration}
                  onChange={(event) => updateField("estimatedDuration", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Cost</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.estimatedCost}
                  onChange={(event) => updateField("estimatedCost", event.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="instructions">Internal Instructions</Label>
                <textarea
                  id="instructions"
                  className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.instructions}
                  onChange={(event) => updateField("instructions", event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer & Property</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer</Label>
                <select
                  id="customerId"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.customerId}
                  onChange={(event) => handleCustomerChange(event.target.value)}
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyId">Property</Label>
                <select
                  id="propertyId"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.propertyId}
                  onChange={(event) => updateField("propertyId", event.target.value)}
                >
                  {selectedCustomer?.properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name ? `${property.name} - ` : ""}
                      {property.address}, {property.city}
                    </option>
                  ))}
                </select>
              </div>
              <Button variant="outline" asChild>
                <Link href="/customers/new">Add Customer</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </form>
  );
}
