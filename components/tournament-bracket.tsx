"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCountryFlagUrl } from "@/lib/utils/countryLogos";
import Image from "next/image";

interface Team {
  id: string;
  name: string;
  flag?: string;
  rating?: number;
}

interface Match {
  id: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'in-progress' | 'completed';
  winner?: string;
  date?: string;
  venue?: string;
}

interface BracketRound {
  quarterFinals: Match[];
  semiFinals: Match[];
  final: Match | null;
}

interface TournamentBracketProps {
  bracket: BracketRound;
  tournamentName?: string;
  onMatchClick?: (matchId: string) => void;
}

const MatchCard = ({ 
  match, 
  roundName,
  onClick 
}: { 
  match: Match; 
  roundName: string;
  onClick?: () => void;
}) => {
  const isCompleted = match.status === 'completed';
  const isInProgress = match.status === 'in-progress';
  const homeWon = isCompleted && match.winner === match.homeTeam?.id;
  const awayWon = isCompleted && match.winner === match.awayTeam?.id;

  return (
    <Card 
      className={cn(
        "relative transition-all duration-300 hover:shadow-lg cursor-pointer",
        isInProgress && "ring-2 ring-primary animate-pulse",
        isCompleted && "bg-muted/30"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-2">
        {/* Round Label */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {roundName}
          </Badge>
          {isInProgress && (
            <Badge variant="default" className="text-xs animate-pulse">
              LIVE
            </Badge>
          )}
          {isCompleted && (
            <Badge variant="secondary" className="text-xs">
              FT
            </Badge>
          )}
        </div>

        {/* Home Team */}
        <div
          className={cn(
            "flex items-center justify-between p-2 rounded-lg transition-all",
            homeWon && "bg-primary/10 font-semibold",
            !match.homeTeam && "bg-muted/50"
          )}
        >
          <div className="flex items-center gap-2 flex-1">
            {match.homeTeam && (
              <Image 
                src={getCountryFlagUrl(match.homeTeam.name)} 
                alt={`${match.homeTeam.name} flag`}
                width={24}
                height={16}
                className="rounded object-cover"
              />
            )}
            <span className={cn("text-sm", !match.homeTeam && "text-muted-foreground")}>
              {match.homeTeam?.name || "TBD"}
            </span>
          </div>
          {isCompleted && match.homeScore !== undefined && (
            <span className={cn("text-lg font-bold", homeWon && "text-primary")}>
              {match.homeScore}
            </span>
          )}
        </div>

        {/* Away Team */}
        <div
          className={cn(
            "flex items-center justify-between p-2 rounded-lg transition-all",
            awayWon && "bg-primary/10 font-semibold",
            !match.awayTeam && "bg-muted/50"
          )}
        >
          <div className="flex items-center gap-2 flex-1">
            {match.awayTeam && (
              <Image 
                src={getCountryFlagUrl(match.awayTeam.name)} 
                alt={`${match.awayTeam.name} flag`}
                width={24}
                height={16}
                className="rounded object-cover"
              />
            )}
            <span className={cn("text-sm", !match.awayTeam && "text-muted-foreground")}>
              {match.awayTeam?.name || "TBD"}
            </span>
          </div>
          {isCompleted && match.awayScore !== undefined && (
            <span className={cn("text-lg font-bold", awayWon && "text-primary")}>
              {match.awayScore}
            </span>
          )}
        </div>

        {/* Match Info */}
        {match.date && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(match.date).toLocaleDateString()}</span>
            </div>
            {match.venue && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{match.venue}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function TournamentBracket({ 
  bracket, 
  tournamentName = "African Nations League",
  onMatchClick 
}: TournamentBracketProps) {
  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">{tournamentName}</h1>
        </div>
        <p className="text-muted-foreground">Tournament Bracket</p>
      </div>

      {/* Bracket Grid */}
      {!bracket ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tournament bracket available. Please start the tournament from the admin dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Quarter Finals */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-border"></span>
              Quarter Finals
              <span className="h-px w-8 bg-border"></span>
            </h2>
            <div className="space-y-6">
              {bracket.quarterFinals.map((match, index) => (
              <MatchCard
                key={match.id}
                match={match}
                roundName={`QF ${index + 1}`}
                onClick={() => onMatchClick?.(match.id)}
              />
            ))}
          </div>
        </div>

        {/* Semi Finals */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-border"></span>
            Semi Finals
            <span className="h-px w-8 bg-border"></span>
          </h2>
          <div className="space-y-6 lg:mt-20">
            {bracket.semiFinals.map((match, index) => (
              <MatchCard
                key={match.id}
                match={match}
                roundName={`SF ${index + 1}`}
                onClick={() => onMatchClick?.(match.id)}
              />
            ))}
          </div>
        </div>

        {/* Final */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-border"></span>
            Final
            <span className="h-px w-8 bg-border"></span>
          </h2>
          <div className="lg:mt-32">
            {bracket.final ? (
              <MatchCard
                match={bracket.final}
                roundName="FINAL"
                onClick={() => onMatchClick?.(bracket.final!.id)}
              />
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Final match not yet scheduled</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Champion Display */}
          {bracket.final?.status === 'completed' && bracket.final.winner && (
            <Card className="mt-8 border-primary bg-primary/5">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  Champion
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center gap-3">
                  {(bracket.final.winner === bracket.final.homeTeam?.id 
                    ? bracket.final.homeTeam?.flag 
                    : bracket.final.awayTeam?.flag) && (
                    <span className="text-4xl">
                      {bracket.final.winner === bracket.final.homeTeam?.id 
                        ? bracket.final.homeTeam?.flag 
                        : bracket.final.awayTeam?.flag}
                    </span>
                  )}
                  <div>
                    <p className="text-2xl font-bold">
                      {bracket.final.winner === bracket.final.homeTeam?.id
                        ? bracket.final.homeTeam?.name
                        : bracket.final.awayTeam?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tournamentName} Champions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      )}

      {/* Mobile View Helper */}
      <div className="lg:hidden text-center text-sm text-muted-foreground mt-8">
        <p>💡 Tip: Scroll horizontally to view the full bracket</p>
      </div>
    </div>
  );
}
