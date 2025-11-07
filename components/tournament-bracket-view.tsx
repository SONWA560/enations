"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Trophy, Play, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Team {
  id: string;
  name: string;
  country: string;
  teamRating: number;
  logo?: string;
}

interface BracketMatch {
  id: string;
  round: "QF" | "SF" | "F";
  matchNumber: number;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore?: number;
  awayScore?: number;
  winner?: Team;
  completed: boolean;
  nextMatchId?: string;
}

interface TournamentBracketProps {
  quarterFinals: BracketMatch[];
  semiFinals: BracketMatch[];
  final: BracketMatch;
  champion?: Team;
  onPlayMatch?: (matchId: string) => void;
  isAdmin?: boolean;
}

function MatchCard({
  match,
  onPlayMatch,
  isAdmin,
}: {
  match: BracketMatch;
  onPlayMatch?: (matchId: string) => void;
  isAdmin?: boolean;
}) {
  const canPlay = isAdmin && !match.completed && match.homeTeam && match.awayTeam;

  return (
    <Card
      className={cn(
        "w-full transition-all duration-200",
        match.completed && "border-primary/50 bg-primary/5",
        !match.homeTeam || !match.awayTeam ? "opacity-50" : ""
      )}
    >
      <CardContent className="p-4">
        {/* Home Team */}
        <div
          className={cn(
            "flex items-center justify-between mb-2 p-2 rounded-lg transition-colors",
            match.completed &&
              match.winner?.id === match.homeTeam?.id &&
              "bg-primary/10 border border-primary/20"
          )}
        >
          <div className="flex items-center gap-2 flex-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src={match.homeTeam?.logo} />
              <AvatarFallback className="text-xs">
                {match.homeTeam?.country.slice(0, 2).toUpperCase() || "TBD"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">
              {match.homeTeam?.name || "TBD"}
            </span>
          </div>
          {match.completed && (
            <Badge variant={match.homeScore! > match.awayScore! ? "default" : "secondary"}>
              {match.homeScore}
            </Badge>
          )}
        </div>

        {/* Away Team */}
        <div
          className={cn(
            "flex items-center justify-between p-2 rounded-lg transition-colors",
            match.completed &&
              match.winner?.id === match.awayTeam?.id &&
              "bg-primary/10 border border-primary/20"
          )}
        >
          <div className="flex items-center gap-2 flex-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src={match.awayTeam?.logo} />
              <AvatarFallback className="text-xs">
                {match.awayTeam?.country.slice(0, 2).toUpperCase() || "TBD"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">
              {match.awayTeam?.name || "TBD"}
            </span>
          </div>
          {match.completed && (
            <Badge variant={match.awayScore! > match.homeScore! ? "default" : "secondary"}>
              {match.awayScore}
            </Badge>
          )}
        </div>

        {/* Play Button */}
        {canPlay && (
          <Button
            size="sm"
            className="w-full mt-2"
            onClick={() => onPlayMatch?.(match.id)}
          >
            <Play className="mr-2 h-4 w-4" />
            Play Match
          </Button>
        )}

        {/* Match Label */}
        <div className="text-center mt-2">
          <Badge variant="outline" className="text-xs">
            {match.round} {match.matchNumber}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function TournamentBracketView({
  quarterFinals,
  semiFinals,
  final,
  champion,
  onPlayMatch,
  isAdmin = false,
}: TournamentBracketProps) {
  return (
    <div className="w-full p-6 bg-gradient-to-br from-background to-muted/20 rounded-xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Tournament Bracket</h2>
        </div>
        {champion && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">🏆 Champion</p>
            <div className="flex items-center justify-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={champion.logo} />
                <AvatarFallback>{champion.country.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-xl font-bold">{champion.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bracket Layout */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-center">
        {/* Quarter Finals */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-center font-semibold text-sm text-muted-foreground mb-4">
            Quarter Finals
          </h3>
          {quarterFinals.slice(0, 2).map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onPlayMatch={onPlayMatch}
              isAdmin={isAdmin}
            />
          ))}
          <div className="h-8" /> {/* Spacer */}
          {quarterFinals.slice(2, 4).map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onPlayMatch={onPlayMatch}
              isAdmin={isAdmin}
            />
          ))}
        </div>

        {/* Connector Lines - QF to SF */}
        <div className="hidden md:flex items-center justify-center">
          <ChevronRight className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* Semi Finals */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-center font-semibold text-sm text-muted-foreground mb-4">
            Semi Finals
          </h3>
          {semiFinals.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onPlayMatch={onPlayMatch}
              isAdmin={isAdmin}
            />
          ))}
        </div>

        {/* Connector Lines - SF to Final */}
        <div className="hidden md:flex items-center justify-center">
          <ChevronRight className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* Final */}
        <div className="md:col-span-2">
          <h3 className="text-center font-semibold text-sm text-muted-foreground mb-4">
            Final
          </h3>
          <MatchCard
            match={final}
            onPlayMatch={onPlayMatch}
            isAdmin={isAdmin}
          />
        </div>
      </div>

      {/* Tournament Progress */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress:</span>
          <div className="flex gap-4">
            <div>
              <span className="font-semibold">
                {[...quarterFinals, ...semiFinals, final].filter((m) => m.completed).length}
              </span>
              <span className="text-muted-foreground"> / 7 matches played</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
