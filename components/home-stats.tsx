"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trophy, ArrowRight } from "lucide-react";
import { getCountryFlagUrl } from "@/lib/utils/countryLogos";
import Image from "next/image";

interface Match {
  id: string;
  round: string;
  homeTeam: { name: string; id: string };
  awayTeam: { name: string; id: string };
  homeScore?: number;
  awayScore?: number;
  completed?: boolean;
}

interface GoalScorer {
  playerName: string;
  teamName: string;
  country: string;
  goals: number;
}

export function HomeStats() {
  const [loading, setLoading] = useState(true);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [topScorers, setTopScorers] = useState<GoalScorer[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch tournament data from tournament/current document
      const tournamentDoc = await getDoc(doc(db, "tournament", "current"));
      
      if (!tournamentDoc.exists()) {
        setLoading(false);
        return;
      }

      const tournamentData = tournamentDoc.data();
      const bracket = tournamentData?.bracket;

      if (!bracket) {
        setLoading(false);
        return;
      }

      // Extract all matches from bracket
      const allMatches: Match[] = [];
      
      // Quarter Finals
      if (bracket.quarterFinals) {
        bracket.quarterFinals.forEach((match: any) => {
          if (match.homeTeam && match.awayTeam) {
            allMatches.push({
              id: match.id,
              round: 'Quarter Final',
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              completed: match.completed || false,
            });
          }
        });
      }

      // Semi Finals
      if (bracket.semiFinals) {
        bracket.semiFinals.forEach((match: any) => {
          if (match.homeTeam && match.awayTeam) {
            allMatches.push({
              id: match.id,
              round: 'Semi Final',
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              completed: match.completed || false,
            });
          }
        });
      }

      // Final
      if (bracket.final && bracket.final.homeTeam && bracket.final.awayTeam) {
        allMatches.push({
          id: bracket.final.id,
          round: 'Final',
          homeTeam: bracket.final.homeTeam,
          awayTeam: bracket.final.awayTeam,
          homeScore: bracket.final.homeScore,
          awayScore: bracket.final.awayScore,
          completed: bracket.final.completed || false,
        });
      }

      // Split into completed and upcoming
      const completed = allMatches.filter(m => m.completed).slice(-3).reverse();
      const upcoming = allMatches.filter(m => !m.completed).slice(0, 3);
      
      setRecentMatches(completed);
      setUpcomingMatches(upcoming);

      // Extract goal scorers from bracket matches
      const goalScorers: { [key: string]: GoalScorer } = {};
      
      const extractScorers = (matches: any[]) => {
        matches.forEach(match => {
          if (match.goalScorers && Array.isArray(match.goalScorers)) {
            match.goalScorers.forEach((scorer: any) => {
              const key = `${scorer.playerName}-${scorer.team}`;
              if (goalScorers[key]) {
                goalScorers[key].goals += 1;
              } else {
                goalScorers[key] = {
                  playerName: scorer.playerName || 'Unknown',
                  teamName: scorer.team || 'Unknown',
                  country: scorer.team || 'Unknown',
                  goals: 1,
                };
              }
            });
          }
        });
      };

      if (bracket.quarterFinals) extractScorers(bracket.quarterFinals);
      if (bracket.semiFinals) extractScorers(bracket.semiFinals);
      if (bracket.final) extractScorers([bracket.final]);

      const scorersArray = Object.values(goalScorers)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 5);
      
      setTopScorers(scorersArray);
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Live Bracket</CardTitle>
            <CardDescription>Follow the tournament progress in real-time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Goalscorers</CardTitle>
            <CardDescription>See who is leading the race for the golden boot.</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
            <CardDescription>Catch up on the latest match outcomes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Live Bracket / Upcoming Matches */}
      <Card>
        <CardHeader>
          <CardTitle>Live Bracket</CardTitle>
          <CardDescription>Follow the tournament progress in real-time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingMatches.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No upcoming matches</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/bracket">View Full Bracket</Link>
              </Button>
            </div>
          ) : (
            <>
              {upcomingMatches.map((match) => (
                <div key={match.id} className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    {match.round}
                  </Badge>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Image
                        src={getCountryFlagUrl(match.homeTeam.name)}
                        alt={match.homeTeam.name}
                        width={20}
                        height={14}
                        className="rounded"
                      />
                      <span className="text-sm truncate">{match.homeTeam.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-sm truncate">{match.awayTeam.name}</span>
                      <Image
                        src={getCountryFlagUrl(match.awayTeam.name)}
                        alt={match.awayTeam.name}
                        width={20}
                        height={14}
                        className="rounded"
                      />
                    </div>
                  </div>
                  {match.id !== upcomingMatches[upcomingMatches.length - 1].id && (
                    <Separator />
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" asChild className="w-full mt-2">
                <Link href="/bracket">
                  View Full Bracket
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Top Goalscorers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Goalscorers</CardTitle>
          <CardDescription>See who is leading the race for the golden boot.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topScorers.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No goals scored yet</p>
            </div>
          ) : (
            <>
              {topScorers.map((scorer, index) => (
                <div key={`${scorer.playerName}-${index}`} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold">
                    {index === 0 ? <Trophy className="h-3 w-3 text-yellow-500" /> : index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getCountryFlagUrl(scorer.country)} />
                    <AvatarFallback className="text-xs">
                      {scorer.country ? scorer.country.slice(0, 2).toUpperCase() : '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{scorer.playerName}</p>
                    <p className="text-xs text-muted-foreground truncate">{scorer.teamName}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs font-bold">
                    {scorer.goals}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" size="sm" asChild className="w-full mt-2">
                <Link href="/leaderboard">
                  View Full Leaderboard
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
          <CardDescription>Catch up on the latest match outcomes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentMatches.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No matches completed yet</p>
            </div>
          ) : (
            <>
              {recentMatches.map((match) => (
                <div key={match.id} className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    {match.round}
                  </Badge>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Image
                        src={getCountryFlagUrl(match.homeTeam.name)}
                        alt={match.homeTeam.name}
                        width={20}
                        height={14}
                        className="rounded"
                      />
                      <span className="text-sm truncate">{match.homeTeam.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-sm">{match.homeScore ?? 0}</span>
                      <span className="text-xs text-muted-foreground">-</span>
                      <span className="text-sm">{match.awayScore ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-sm truncate">{match.awayTeam.name}</span>
                      <Image
                        src={getCountryFlagUrl(match.awayTeam.name)}
                        alt={match.awayTeam.name}
                        width={20}
                        height={14}
                        className="rounded"
                      />
                    </div>
                  </div>
                  {match.id !== recentMatches[recentMatches.length - 1].id && (
                    <Separator />
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" asChild className="w-full mt-2">
                <Link href="/bracket">
                  View All Results
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
