"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface EmptyStateGuideProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionVariant?: "default" | "outline" | "secondary";
  steps?: Array<{
    number: number;
    title: string;
    description: string;
  }>;
}

export function EmptyStateGuide({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionVariant = "default",
  steps,
}: EmptyStateGuideProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="max-w-md mx-auto">{description}</CardDescription>
      </CardHeader>
      
      {steps && steps.length > 0 && (
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-3 items-start">
                <Badge variant="outline" className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0">
                  {step.number}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {actionLabel && actionHref && (
            <Button asChild variant={actionVariant} className="w-full mt-4">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          )}
        </CardContent>
      )}
      
      {!steps && actionLabel && actionHref && (
        <CardContent className="flex justify-center pb-6">
          <Button asChild variant={actionVariant}>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
