import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeaturePlaceholderProps {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}

export function FeaturePlaceholder({
  title,
  description,
  backHref,
  backLabel,
}: FeaturePlaceholderProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This route is intentionally in placeholder mode until the live workflow and data model are completed.
          </p>
          <Button asChild>
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
