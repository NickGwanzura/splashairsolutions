"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Download, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import type { Invoice } from "@/types";
import { InvoiceStatus } from "@prisma/client";

// Mock invoices
const mockInvoices: any[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-0021",
    status: "SENT",
    total: "3250.00",
    balanceDue: "3250.00",
    amountPaid: "0",
    customerId: "c1",
    organizationId: "org1",
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    subtotal: "3000.00",
    taxAmount: "250.00",
    taxRate: "8.33",
    discountAmount: "0",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "u1",
    lineItems: [],
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-0020",
    status: "PAID",
    total: "1850.00",
    balanceDue: "0",
    amountPaid: "1850.00",
    customerId: "c2",
    organizationId: "org1",
    issueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
    paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    subtotal: "1700.00",
    taxAmount: "150.00",
    taxRate: "8.82",
    discountAmount: "0",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "u1",
    lineItems: [],
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-0019",
    status: "OVERDUE",
    total: "4500.00",
    balanceDue: "4500.00",
    amountPaid: "0",
    customerId: "c3",
    organizationId: "org1",
    issueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    subtotal: "4200.00",
    taxAmount: "300.00",
    taxRate: "7.14",
    discountAmount: "0",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "u1",
    lineItems: [],
  },
];

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch =
      !searchQuery ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "outstanding" &&
        ["SENT", "VIEWED", "PARTIAL", "OVERDUE"].includes(invoice.status)) ||
      (activeTab === "paid" && invoice.status === "PAID") ||
      (activeTab === "overdue" && invoice.status === "OVERDUE");

    return matchesSearch && matchesTab;
  });

  const totals = {
    total: filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0),
    outstanding: filteredInvoices
      .filter((inv) => ["SENT", "VIEWED", "PARTIAL", "OVERDUE"].includes(inv.status))
      .reduce((sum, inv) => sum + parseFloat(inv.balanceDue), 0),
    overdue: filteredInvoices
      .filter((inv) => inv.status === "OVERDUE")
      .reduce((sum, inv) => sum + parseFloat(inv.balanceDue), 0),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage billing and track payments
          </p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Invoiced</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.outstanding)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.overdue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs and Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="font-medium hover:underline"
                          >
                            {invoice.invoiceNumber}
                          </Link>
                        </TableCell>
                        <TableCell>John Smith</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(invoice.status)}
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(invoice.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          {parseFloat(invoice.balanceDue) > 0 ? (
                            <span className="text-red-600">
                              {formatCurrency(invoice.balanceDue)}
                            </span>
                          ) : (
                            <span className="text-green-600">Paid</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
