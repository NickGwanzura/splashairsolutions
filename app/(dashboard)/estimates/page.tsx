"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EstimatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
          <p className="text-muted-foreground">
            Create and manage customer quotes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Estimate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Recent Estimates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              Estimates module coming soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
