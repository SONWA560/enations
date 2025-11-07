"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Lightbulb } from "lucide-react";

interface HelpBannerProps {
  storageKey: string;
  title: string;
  description: string;
  tips?: string[];
}

export function HelpBanner({ storageKey, title, description, tips }: HelpBannerProps) {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(storageKey) !== "dismissed";
    }
    return true;
  });

  const handleDismiss = () => {
    localStorage.setItem(storageKey, "dismissed");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Alert className="relative border-primary/20 bg-primary/5">
      <Lightbulb className="h-4 w-4 text-primary" />
      <AlertTitle className="flex items-center justify-between">
        {title}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 absolute top-2 right-2"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm">{description}</p>
        {tips && tips.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm list-disc list-inside">
            {tips.map((tip, index) => (
              <li key={index} className="text-muted-foreground">{tip}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}
