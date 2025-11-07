"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Clock,
  Users,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCountryFlagUrl } from "@/lib/utils/countryLogos";

interface TournamentStats {
  totalTeams: number;
  totalMatches: number;
  completedMatches: number;
  remainingMatches: number;
  currentRound: "QF" | "SF" | "F" | "Complete";
  totalGoals: number;
  topScorer?: {
    name: string;
    goals: number;
  };
}

interface NextMatch {
  id: string;
  round: string;
  homeTeam: string;
  awayTeam: string;
}

interface TournamentControlPanelProps {
  stats: TournamentStats;
  nextMatch?: NextMatch | null;
  onStartTournament?: () => void;
  onPlayNextMatch?: () => void;
  onResetTournament?: () => void;
  tournamentStarted: boolean;
  tournamentComplete: boolean;
}

export function TournamentControlPanel({
  stats,
  nextMatch,
  onStartTournament,
  onPlayNextMatch,
  onResetTournament,
  tournamentStarted,
  tournamentComplete,
}: TournamentControlPanelProps) {
  const progressPercentage = stats.totalMatches > 0 
    ? (stats.completedMatches / stats.totalMatches) * 100 
    : 0;

  const getRoundLabel = (round: string) => {
    switch (round) {
      case "QF": return "Quarter Final";
      case "SF": return "Semi Final";
      case "F": return "Final";
      case "Complete": return "Tournament Complete";
      default: return round;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Tournament Control
            </CardTitle>
            <CardDescription>
              Manage tournament matches and progression
            </CardDescription>
          </div>
          {tournamentStarted && (
            <Badge variant={tournamentComplete ? "default" : "secondary"}>
              {getRoundLabel(stats.currentRound)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tournament Not Started */}
        {!tournamentStarted && (
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Ready to Start?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start the tournament to create the bracket and begin matches
            </p>
            <Button size="lg" onClick={onStartTournament}>
              <Play className="mr-2 h-4 w-4" />
              Start Tournament
            </Button>
          </div>
        )}

        {/* Tournament Started */}
        {tournamentStarted && !tournamentComplete && (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tournament Progress</span>
                <span className="font-semibold">
                  {stats.completedMatches} / {stats.totalMatches}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <Separator />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Teams</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalTeams}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-xs">Total Goals</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalGoals}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs">Completed</span>
                </div>
                <p className="text-2xl font-bold">{stats.completedMatches}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">Remaining</span>
                </div>
                <p className="text-2xl font-bold">{stats.remainingMatches}</p>
              </div>
            </div>

            <Separator />

            {/* Next Match */}
            {nextMatch ? (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Next Match</h4>
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <Badge variant="outline">{getRoundLabel(nextMatch.round)}</Badge>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Image 
                        src={getCountryFlagUrl(nextMatch.homeTeam)} 
                        alt={`${nextMatch.homeTeam} flag`}
                        width={24}
                        height={16}
                        className="rounded object-cover"
                      />
                      <span className="font-medium text-sm">{nextMatch.homeTeam}</span>
                    </div>
                    <span className="text-muted-foreground text-sm">vs</span>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="font-medium text-sm">{nextMatch.awayTeam}</span>
                      <Image 
                        src={getCountryFlagUrl(nextMatch.awayTeam)} 
                        alt={`${nextMatch.awayTeam} flag`}
                        width={24}
                        height={16}
                        className="rounded object-cover"
                      />
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={onPlayNextMatch}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Play Next Match
                </Button>
              </div>
            ) : (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Waiting for previous matches to complete
                </p>
              </div>
            )}
          </>
        )}

        {/* Tournament Complete */}
        {tournamentComplete && (
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
              Tournament Complete! <span className="text-2xl">🎉</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              All matches have been played
            </p>
            {stats.topScorer && (
              <div className="mb-4 p-3 bg-primary/10 rounded-lg inline-block">
                <p className="text-xs text-muted-foreground mb-1">Top Scorer</p>
                <p className="font-semibold">{stats.topScorer.name}</p>
                <Badge variant="default">{stats.topScorer.goals} goals</Badge>
              </div>
            )}
            <Separator className="my-4" />
            <Button 
              variant="outline" 
              onClick={onResetTournament}
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Tournament
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
