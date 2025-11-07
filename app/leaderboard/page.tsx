"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoalScorersLeaderboard } from "@/components/goal-scorers-leaderboard";
import { getTopGoalScorers } from "@/lib/firebaseService";
import { Loader2, Home } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scorers, setScorers] = useState<any[]>([]);

  useEffect(() => {
    loadLeaderboard();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadLeaderboard();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = async () => {
    try {
      setError(null);
      const topScorers = await getTopGoalScorers(20);
      setScorers(topScorers);
      setLoading(false);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
      setError("Failed to load goal scorers. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/"><Home className="h-4 w-4" /></Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Leaderboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Goal Scorers</h1>
            <p className="text-muted-foreground">
              Top performers in the African Nations League
            </p>
          </div>
          
          <GoalScorersLeaderboard scorers={scorers} maxDisplay={20} />
        </div>
      </div>
    </div>
  );
}
