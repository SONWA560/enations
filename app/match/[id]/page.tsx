'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  ArrowLeft, 
  Trophy, 
  Award, 
  Zap, 
  BarChart3, 
  Users, 
  Home,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { getCountryFlagUrl } from '@/lib/utils/countryLogos';
import { MatchStatisticsDisplay } from '@/components/match-statistics-display';

interface GoalScorer {
  playerName: string;
  team: string;
  minute: number;
}

interface MatchData {
  id: string;
  homeTeam: {
    name: string;
    country: string;
  };
  awayTeam: {
    name: string;
    country: string;
  };
  homeScore: number;
  awayScore: number;
  completed: boolean;
  winner?: string;
  round: string;
  matchNumber: number;
  goalScorers?: GoalScorer[];
  commentary?: any;
  wasPlayed?: boolean; // true if AI commentary was generated
  statistics?: {
    possession?: { home: number; away: number };
    shots?: { home: number; away: number };
    shotsOnTarget?: { home: number; away: number };
    fouls?: { home: number; away: number };
    corners?: { home: number; away: number };
    yellowCards?: { home: number; away: number };
    redCards?: { home: number; away: number };
  };
}

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<MatchData | null>(null);

  useEffect(() => {
    loadMatchData();
  }, [matchId]);

  const loadMatchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get tournament data
      const tournamentDoc = await getDoc(doc(db, 'tournament', 'current'));
      
      if (!tournamentDoc.exists()) {
        setError('No active tournament found.');
        setLoading(false);
        return;
      }

      const tournamentData = tournamentDoc.data();
      const bracket = tournamentData?.bracket;

      if (!bracket) {
        setError('Tournament bracket not found.');
        setLoading(false);
        return;
      }

      // Search for match in all rounds
      let foundMatch: MatchData | null = null;

      // Check Quarter Finals
      if (bracket.quarterFinals) {
        const qfMatch = bracket.quarterFinals.find((m: any) => m.id === matchId);
        if (qfMatch) {
          foundMatch = { ...qfMatch, round: 'Quarter Final' };
        }
      }

      // Check Semi Finals
      if (!foundMatch && bracket.semiFinals) {
        const sfMatch = bracket.semiFinals.find((m: any) => m.id === matchId);
        if (sfMatch) {
          foundMatch = { ...sfMatch, round: 'Semi Final' };
        }
      }

      // Check Final
      if (!foundMatch && bracket.final && bracket.final.id === matchId) {
        foundMatch = { ...bracket.final, round: 'Final' };
      }

      if (!foundMatch) {
        setError('Match not found.');
        setLoading(false);
        return;
      }

      setMatch(foundMatch);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading match:', err);
      setError('Failed to load match data.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Match not found'}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/bracket')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bracket
        </Button>
      </div>
    );
  }

  const homeGoals = match.goalScorers?.filter(g => g.team === match.homeTeam.name) || [];
  const awayGoals = match.goalScorers?.filter(g => g.team === match.awayTeam.name) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Home className="h-4 w-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/bracket">Tournament Bracket</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Match Details</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <Button 
          onClick={() => router.push('/bracket')} 
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bracket
        </Button>

        {/* Match Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">{match.round}</Badge>
              {match.wasPlayed ? (
                <Badge variant="default">Match Played</Badge>
              ) : (
                <Badge variant="secondary">Match Simulated</Badge>
              )}
            </div>
            <CardTitle className="text-center text-2xl mt-4">
              Match #{match.matchNumber}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Score Display */}
            <div className="grid grid-cols-3 gap-4 items-center py-6">
              {/* Home Team */}
              <div className="text-center space-y-2">
                <Image
                  src={getCountryFlagUrl(match.homeTeam.country)}
                  alt={`${match.homeTeam.country} flag`}
                  width={80}
                  height={60}
                  className="mx-auto rounded shadow-md"
                />
                <h3 className="font-bold text-xl">{match.homeTeam.name}</h3>
                {match.winner === 'home' && <Trophy className="h-5 w-5 mx-auto text-yellow-500" />}
              </div>

              {/* Score */}
              <div className="text-center">
                <div className="text-5xl font-bold flex items-center justify-center gap-4">
                  <span className={match.winner === 'home' ? 'text-primary' : ''}>
                    {match.homeScore}
                  </span>
                  <span className="text-muted-foreground">-</span>
                  <span className={match.winner === 'away' ? 'text-primary' : ''}>
                    {match.awayScore}
                  </span>
                </div>
                {match.completed && (
                  <Badge variant="secondary" className="mt-2">Full Time</Badge>
                )}
              </div>

              {/* Away Team */}
              <div className="text-center space-y-2">
                <Image
                  src={getCountryFlagUrl(match.awayTeam.country)}
                  alt={`${match.awayTeam.country} flag`}
                  width={80}
                  height={60}
                  className="mx-auto rounded shadow-md"
                />
                <h3 className="font-bold text-xl">{match.awayTeam.name}</h3>
                {match.winner === 'away' && <Trophy className="h-5 w-5 mx-auto text-yellow-500" />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goal Scorers */}
        {match.goalScorers && match.goalScorers.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Goal Scorers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Home Team Goals */}
                <div>
                  <h4 className="font-semibold mb-3">{match.homeTeam.name}</h4>
                  {homeGoals.length > 0 ? (
                    <div className="space-y-2">
                      {homeGoals.map((goal, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                          <Badge variant="outline">{goal.minute}'</Badge>
                          <span className="text-sm">{goal.playerName}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No goals scored</p>
                  )}
                </div>

                {/* Away Team Goals */}
                <div>
                  <h4 className="font-semibold mb-3">{match.awayTeam.name}</h4>
                  {awayGoals.length > 0 ? (
                    <div className="space-y-2">
                      {awayGoals.map((goal, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                          <Badge variant="outline">{goal.minute}'</Badge>
                          <span className="text-sm">{goal.playerName}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No goals scored</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match Statistics */}
        {match.statistics && (
          <MatchStatisticsDisplay
            homeTeam={match.homeTeam.name}
            awayTeam={match.awayTeam.name}
            statistics={{
              possession: match.statistics.possession || { home: 50, away: 50 },
              shots: match.statistics.shots || { home: 0, away: 0 },
              shotsOnTarget: match.statistics.shotsOnTarget || { home: 0, away: 0 },
              fouls: match.statistics.fouls || { home: 0, away: 0 },
              corners: match.statistics.corners || { home: 0, away: 0 },
              yellowCards: match.statistics.yellowCards || { home: 0, away: 0 },
              redCards: match.statistics.redCards || { home: 0, away: 0 },
            }}
          />
        )}

        {/* Match Commentary (only if played with AI) */}
        {match.wasPlayed && match.commentary && (
          <div className="space-y-6">
            {/* Match Summary */}
            {match.commentary.summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Match Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{match.commentary.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Key Moments */}
            {match.commentary.keyMoments && match.commentary.keyMoments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Key Moments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {match.commentary.keyMoments.map((moment: any, idx: number) => (
                      <div key={idx} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                        <Badge variant="outline" className="shrink-0">{moment.minute}'</Badge>
                        <p className="text-sm">{moment.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Player of the Match */}
            {match.commentary.playerOfMatch && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Player of the Match
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">{match.commentary.playerOfMatch.name}</p>
                      <p className="text-sm text-muted-foreground">{match.commentary.playerOfMatch.team}</p>
                      <Separator className="my-2" />
                      <p className="text-sm">{match.commentary.playerOfMatch.reason}</p>
                    </div>
                  </Card>
                </CardContent>
              </Card>
            )}

            {/* Analysis */}
            {match.commentary.analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Match Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{match.commentary.analysis}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Simulated Match Note */}
        {!match.wasPlayed && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This match was simulated quickly without AI commentary. Only the final results are shown.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
