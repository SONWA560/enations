"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalScorer {
  playerId: string;
  playerName: string;
  teamName: string;
  country: string;
  goals: number;
  teamLogo?: string;
}

interface GoalScorersLeaderboardProps {
  scorers: GoalScorer[];
  maxDisplay?: number;
}

export function GoalScorersLeaderboard({
  scorers,
  maxDisplay = 10,
}: GoalScorersLeaderboardProps) {
  // Sort by goals descending
  const sortedScorers = [...scorers].sort((a, b) => b.goals - a.goals);
  const displayScorers = sortedScorers.slice(0, maxDisplay);

  // Find top scorer
  const topScorer = sortedScorers[0];
  const topGoals = topScorer?.goals || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle>Top Goal Scorers</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayScorers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No goals scored yet</p>
          </div>
        ) : (
          displayScorers.map((scorer, index) => {
            const isTopScorer = index === 0;
            const isTopThree = index < 3;

            return (
              <div
                key={`${scorer.playerId}-${index}`}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg transition-all duration-200 hover:bg-muted/50",
                  isTopScorer && "bg-primary/10 border border-primary/20",
                  isTopThree && !isTopScorer && "bg-muted/30"
                )}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                  {index === 0 && (
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  )}
                  {index === 1 && (
                    <Trophy className="h-4 w-4 text-gray-400" />
                  )}
                  {index === 2 && (
                    <Trophy className="h-4 w-4 text-orange-600" />
                  )}
                  {index > 2 && <span>{index + 1}</span>}
                </div>

                {/* Team Logo */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={scorer.teamLogo} />
                  <AvatarFallback className="text-xs">
                    {scorer.country ? scorer.country.slice(0, 2).toUpperCase() : '??'}
                  </AvatarFallback>
                </Avatar>

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {scorer.playerName || 'Unknown Player'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {scorer.teamName || scorer.country || 'Unknown Team'}
                  </p>
                </div>

                {/* Goals Count */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isTopScorer ? "default" : "secondary"}
                    className="font-bold flex items-center gap-1"
                  >
                    {scorer.goals}
                    <Target className="h-3 w-3" />
                  </Badge>
                </div>
              </div>
            );
          })
        )}

        {/* Stats Summary */}
        {sortedScorers.length > 0 && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {sortedScorers.reduce((sum, s) => sum + s.goals, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Goals</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {topGoals}
                </p>
                <p className="text-xs text-muted-foreground">Top Scorer</p>
              </div>
            </div>
          </div>
        )}

        {/* Show More Indicator */}
        {sortedScorers.length > maxDisplay && (
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              + {sortedScorers.length - maxDisplay} more players
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
