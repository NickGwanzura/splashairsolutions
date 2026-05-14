"use client";

import { FormEvent, useEffect, useState } from "react";
import { Beaker, Package, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface GasStock {
  id: string;
  gasType: string;
  brand: string;
  quantity: string;
  remaining: string;
  unit: string;
  supplier: string;
  date: string;
}

export default function InventoryPage() {
  const [gasStock, setGasStock] = useState<GasStock[]>([]);
  const [isLoadingGas, setIsLoadingGas] = useState(true);
  const [isAddGasOpen, setIsAddGasOpen] = useState(false);
  const [isSavingGas, setIsSavingGas] = useState(false);
  const [gasForm, setGasForm] = useState({
    gasType: "",
    brand: "",
    quantity: "",
    unit: "kg",
    supplier: "",
    supplierRef: "",
    notes: "",
  });

  async function loadGasStock() {
    setIsLoadingGas(true);

    try {
      const response = await fetch("/api/gas-stock", { cache: "no-store" });
      const payload = await response.json();

      setGasStock(response.ok ? payload.data ?? [] : []);
    } catch {
      toast.error("Failed to load gas stock");
    } finally {
      setIsLoadingGas(false);
    }
  }

  useEffect(() => {
    loadGasStock();
  }, []);

  const handleAddGas = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingGas(true);

    try {
      const response = await fetch("/api/gas-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gasForm),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to add gas stock");
      }

      toast.success("Gas stock added");
      setIsAddGasOpen(false);
      setGasForm({
        gasType: "",
        brand: "",
        quantity: "",
        unit: "kg",
        supplier: "",
        supplierRef: "",
        notes: "",
      });
      await loadGasStock();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add gas stock");
    } finally {
      setIsSavingGas(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage parts, materials, and refrigerant stock</p>
        </div>
        <Button onClick={() => setIsAddGasOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Gas
        </Button>
      </div>

      <Dialog open={isAddGasOpen} onOpenChange={setIsAddGasOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Gas Stock</DialogTitle>
            <DialogDescription>
              Add a refrigerant type and starting quantity for job usage recording.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleAddGas}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gasType">Gas Type</Label>
                <Input
                  id="gasType"
                  required
                  placeholder="R-32"
                  value={gasForm.gasType}
                  onChange={(event) => setGasForm((current) => ({ ...current, gasType: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  required
                  placeholder="Chemours"
                  value={gasForm.brand}
                  onChange={(event) => setGasForm((current) => ({ ...current, brand: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  required
                  min="0.01"
                  step="0.01"
                  type="number"
                  placeholder="13.60"
                  value={gasForm.quantity}
                  onChange={(event) => setGasForm((current) => ({ ...current, quantity: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  required
                  value={gasForm.unit}
                  onChange={(event) => setGasForm((current) => ({ ...current, unit: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  required
                  placeholder="Supplier name"
                  value={gasForm.supplier}
                  onChange={(event) => setGasForm((current) => ({ ...current, supplier: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierRef">Supplier Ref</Label>
                <Input
                  id="supplierRef"
                  placeholder="Invoice or batch"
                  value={gasForm.supplierRef}
                  onChange={(event) => setGasForm((current) => ({ ...current, supplierRef: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Optional notes"
                value={gasForm.notes}
                onChange={(event) => setGasForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddGasOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isSavingGas}>
                <Save className="mr-2 h-4 w-4" />
                Save Gas
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Gas Stock
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gas</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Original Qty</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingGas ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading gas stock...
                  </TableCell>
                </TableRow>
              ) : gasStock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No gas stock recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                gasStock.map((stock) => (
                  <TableRow key={stock.id}>
                    <TableCell className="font-medium">{stock.gasType}</TableCell>
                    <TableCell>{stock.brand}</TableCell>
                    <TableCell>
                      {Number(stock.remaining).toFixed(2)} {stock.unit}
                    </TableCell>
                    <TableCell>
                      {Number(stock.quantity).toFixed(2)} {stock.unit}
                    </TableCell>
                    <TableCell>{stock.supplier}</TableCell>
                    <TableCell>{new Date(stock.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parts Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[220px] items-center justify-center rounded-lg border bg-muted/50">
            <p className="text-muted-foreground">Parts inventory management coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
