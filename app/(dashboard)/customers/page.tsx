"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInitials, formatPhoneNumber, getStatusColor } from "@/lib/utils";
import type { Customer } from "@/types";
import { CustomerType, CustomerStatus } from "@prisma/client";

// Mock customers data
const mockCustomers: any[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phones: [{ number: "555-0123", type: "MOBILE", isPrimary: true }],
    type: "RESIDENTIAL",
    status: "ACTIVE",
    source: "Google",
    paymentTerms: "NET_30",
    taxExempt: false,
    taxId: null,
    internalNotes: null,
    organizationId: "org1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    createdById: "u1",
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@company.com",
    phones: [{ number: "555-0234", type: "WORK", isPrimary: true }],
    type: "COMMERCIAL",
    status: "ACTIVE",
    source: "Referral",
    paymentTerms: "NET_15",
    taxExempt: false,
    taxId: null,
    internalNotes: null,
    organizationId: "org1",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
    createdById: "u1",
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Brown",
    email: null,
    phones: [{ number: "555-0345", type: "HOME", isPrimary: true }],
    type: "RESIDENTIAL",
    status: "LEAD",
    source: "Website",
    paymentTerms: "NET_30",
    taxExempt: false,
    taxId: null,
    internalNotes: null,
    organizationId: "org1",
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
    createdById: "u1",
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@email.com",
    phones: [{ number: "555-0456", type: "MOBILE", isPrimary: true }],
    type: "RESIDENTIAL",
    status: "VIP",
    source: "Referral",
    paymentTerms: "DUE_ON_RECEIPT",
    taxExempt: true,
    taxId: "TX123456",
    internalNotes: "VIP customer, priority service",
    organizationId: "org1",
    createdAt: new Date("2023-06-20"),
    updatedAt: new Date("2024-01-05"),
    createdById: "u1",
  },
];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<CustomerType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "ALL">("ALL");

  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch =
      !searchQuery ||
      customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phones.some((p: any) => p.number.includes(searchQuery));

    const matchesType = typeFilter === "ALL" || customer.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || customer.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships and service history
          </p>
        </div>
        <Button asChild>
          <Link href="/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as CustomerType | "ALL")}
              >
                <option value="ALL">All Types</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="INDUSTRIAL">Industrial</option>
                <option value="GOVERNMENT">Government</option>
              </select>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | "ALL")}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="LEAD">Lead</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No customers found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-hvac-100 text-hvac-700">
                            {getInitials(`${customer.firstName} ${customer.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/customers/${customer.id}`}
                            className="font-medium hover:underline"
                          >
                            {customer.firstName} {customer.lastName}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Customer since {new Date(customer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{customer.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.phones[0] && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {formatPhoneNumber(customer.phones[0].number)}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(customer.status)}
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">12 jobs</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/customers/${customer.id}`}>View Profile</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/jobs/new?customerId=${customer.id}`}>
                              Create Job
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/estimates/new?customerId=${customer.id}`}>
                              Create Estimate
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/customers/${customer.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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
