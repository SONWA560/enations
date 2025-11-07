"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Target, 
  AlertCircle, 
  Flag, 
  Square,
  XCircle
} from "lucide-react";

interface MatchStatistics {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  fouls: { home: number; away: number };
  corners: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
}

interface MatchStatisticsDisplayProps {
  homeTeam: string;
  awayTeam: string;
  statistics: MatchStatistics;
  compact?: boolean;
}

export function MatchStatisticsDisplay({
  homeTeam,
  awayTeam,
  statistics,
  compact = false,
}: MatchStatisticsDisplayProps) {
  const stats = [
    {
      label: "Possession",
      icon: Activity,
      home: statistics.possession.home,
      away: statistics.possession.away,
      unit: "%",
      color: "bg-blue-500",
    },
    {
      label: "Shots",
      icon: Target,
      home: statistics.shots.home,
      away: statistics.shots.away,
      unit: "",
      color: "bg-orange-500",
    },
    {
      label: "Shots on Target",
      icon: Target,
      home: statistics.shotsOnTarget.home,
      away: statistics.shotsOnTarget.away,
      unit: "",
      color: "bg-green-500",
    },
    {
      label: "Fouls",
      icon: AlertCircle,
      home: statistics.fouls.home,
      away: statistics.fouls.away,
      unit: "",
      color: "bg-amber-500",
    },
    {
      label: "Corners",
      icon: Flag,
      home: statistics.corners.home,
      away: statistics.corners.away,
      unit: "",
      color: "bg-purple-500",
    },
    {
      label: "Yellow Cards",
      icon: Square,
      home: statistics.yellowCards.home,
      away: statistics.yellowCards.away,
      unit: "",
      color: "bg-yellow-500",
    },
    {
      label: "Red Cards",
      icon: XCircle,
      home: statistics.redCards.home,
      away: statistics.redCards.away,
      unit: "",
      color: "bg-red-500",
    },
  ];

  if (compact) {
    return (
      <div className="space-y-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const total = stat.home + stat.away;
          const homePercentage = total > 0 ? (stat.home / total) * 100 : 50;

          return (
            <div key={stat.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{stat.label}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-12 text-right font-semibold">{stat.home}{stat.unit}</span>
                <Progress value={homePercentage} className="flex-1" />
                <span className="w-12 text-left font-semibold">{stat.away}{stat.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Match Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team Names Header */}
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="text-left">{homeTeam}</span>
          <span className="text-muted-foreground">vs</span>
          <span className="text-right">{awayTeam}</span>
        </div>

        {/* Statistics */}
        <div className="space-y-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const total = stat.home + stat.away;
            const homePercentage = total > 0 ? (stat.home / total) * 100 : 50;

            return (
              <div key={stat.label} className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{stat.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-16 justify-center font-bold">
                    {stat.home}{stat.unit}
                  </Badge>
                  <div className="flex-1 space-y-1">
                    <Progress 
                      value={homePercentage} 
                      className="h-2"
                    />
                  </div>
                  <Badge variant="outline" className="w-16 justify-center font-bold">
                    {stat.away}{stat.unit}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{statistics.shots.home + statistics.shots.away}</p>
            <p className="text-xs text-muted-foreground">Total Shots</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{statistics.fouls.home + statistics.fouls.away}</p>
            <p className="text-xs text-muted-foreground">Total Fouls</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{statistics.corners.home + statistics.corners.away}</p>
            <p className="text-xs text-muted-foreground">Total Corners</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
