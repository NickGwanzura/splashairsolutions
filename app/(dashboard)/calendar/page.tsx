"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          Schedule and manage appointments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Schedule Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              Calendar view coming soon. Use the <a href="/dispatch" className="text-hvac-600 underline">Dispatch Board</a> for now.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
