'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { collection, getDocs, query, doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Trophy, Users, Calendar, Sparkles, Mail, Home, RotateCcw } from "lucide-react";
import { TournamentControlPanel } from "@/components/tournament-control-panel";
import { TournamentManager } from "@/lib/classes/TournamentManager";
import { MatchEngine } from "@/lib/classes/MatchEngine";
import { completeMatch, simulateMatchQuick } from "@/lib/utils/matchCompletion";
import { getCountryFlagUrl } from "@/lib/utils/countryLogos";
import Image from "next/image";

interface Federation {
  id: string;
  country: string;
  managerName: string;
  teamRating: number;
  isActive: boolean;
  hasSquad?: boolean;
  representativeEmail?: string;
}

interface TournamentData {
  id: string;
  status: "not_started" | "in_progress" | "completed";
  bracket: any;
  currentRound: "QF" | "SF" | "F" | "Complete";
  matches: any[];
  champion?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { userData, loading: authLoading } = useAuth();
  const [federations, setFederations] = useState<Federation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [matchInProgress, setMatchInProgress] = useState(false);
  const [commentaryDialog, setCommentaryDialog] = useState(false);
  const [currentCommentary, setCurrentCommentary] = useState<string>("");
  const [currentMatchResult, setCurrentMatchResult] = useState<any>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!userData) {
        router.push("/auth");
      } else if (userData.role !== "admin") {
        toast.error("Access denied. Admin only.");
        router.push("/");
      }
    }
  }, [userData, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch federations
        const federationsQuery = query(collection(db, "federations"));
        const federationsSnapshot = await getDocs(federationsQuery);
        const federationsData: Federation[] = [];
        
        federationsSnapshot.forEach((doc) => {
          federationsData.push({ id: doc.id, ...doc.data() } as Federation);
        });
        
        setFederations(federationsData);

        // Fetch tournament data
        const tournamentDoc = await getDoc(doc(db, "tournament", "current"));
        if (tournamentDoc.exists()) {
          setTournament({ id: tournamentDoc.id, ...tournamentDoc.data() } as TournamentData);
        }
      } catch (error: any) {
        toast.error("Failed to fetch data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (userData?.role === "admin") {
      fetchData();
    }
  }, [userData]);

  const fetchTeamWithPlayers = async (federationId: string) => {
    const teamDoc = await getDoc(doc(db, "federations", federationId));
    if (!teamDoc.exists()) {
      return null;
    }
    
    const teamData = teamDoc.data() as any;
    
    let players: any[] = [];
    
    // Try to fetch players from subcollection first (new method)
    const playersRef = collection(db, `federations/${federationId}/players`);
    const playersSnapshot = await getDocs(playersRef);
    
    if (playersSnapshot.size > 0) {
      // Players found in subcollection (new method)
      players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    } else if (teamData.players && Array.isArray(teamData.players) && teamData.players.length > 0) {
      // Fallback to players array in main document (old method for legacy data)
      players = teamData.players;
    }
    
    return {
      id: teamDoc.id,
      country: teamData.country,
      teamRating: teamData.teamRating,
      representativeEmail: teamData.representativeEmail,
      squad: players,
      ...teamData
    };
  };

  const handleFixFederationStatuses = async () => {
    const loadingToast = toast.loading("Fixing federation statuses...");
    let fixedCount = 0;
    let alreadyCorrect = 0;

    try {
      for (const federation of federations) {
        // Fetch players from subcollection
        const playersRef = collection(db, `federations/${federation.id}/players`);
        const playersSnapshot = await getDocs(playersRef);
        const playerCount = playersSnapshot.size;

        // Determine correct status
        const shouldBeActive = playerCount >= 23 && federation.teamRating > 0;
        const currentlyActive = federation.isActive ?? false;

        if (shouldBeActive !== currentlyActive) {
          // Update federation
          await updateDoc(doc(db, "federations", federation.id), {
            isActive: shouldBeActive,
            hasSquad: shouldBeActive,
            updatedAt: new Date().toISOString()
          });
          fixedCount++;
          console.log(`✓ Fixed ${federation.country}: ${playerCount} players, ${shouldBeActive ? 'Active' : 'Inactive'}`);
        } else {
          alreadyCorrect++;
          console.log(`✓ ${federation.country}: Already correct (${playerCount} players, ${currentlyActive ? 'Active' : 'Inactive'})`);
        }
      }

      toast.dismiss(loadingToast);
      
      if (fixedCount > 0) {
        toast.success(`Fixed ${fixedCount} federation(s). ${alreadyCorrect} already correct.`);
        // Refresh data
        const federationsSnapshot = await getDocs(collection(db, "federations"));
        const federationsData = federationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Federation));
        setFederations(federationsData);
      } else {
        toast.success(`All ${alreadyCorrect} federations already have correct statuses.`);
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error("Failed to fix federation statuses: " + error.message);
      console.error("Error fixing federation statuses:", error);
    }
  };

  const handleStartTournament = async () => {
    const activeFederations = federations.filter(f => f.isActive);
    
    if (activeFederations.length < 8) {
      toast.error("Need at least 8 federations with complete squads to start tournament");
      return;
    }

    try {
      // Prepare teams for TournamentManager (only active federations with squads)
      const teams = activeFederations.slice(0, 8).map(fed => ({
        id: fed.id,
        name: fed.country,
        country: fed.country,
        teamRating: fed.teamRating
      }));

      // Create bracket using TournamentManager
      const manager = new TournamentManager(teams);
      const bracket = manager.startTournament();

      // Save tournament to Firestore
      await setDoc(doc(db, "tournament", "current"), {
        status: "in_progress",
        bracket: bracket,
        currentRound: "QF",
        matches: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Refresh tournament data
      const tournamentDoc = await getDoc(doc(db, "tournament", "current"));
      if (tournamentDoc.exists()) {
        setTournament({ id: tournamentDoc.id, ...tournamentDoc.data() } as TournamentData);
      }
      
      toast.success("Tournament started! Quarter Finals are ready.");
    } catch (error: any) {
      toast.error("Failed to start tournament");
      console.error(error);
    }
  };

  const handlePlayNextMatch = async () => {
    if (!tournament || !tournament.bracket) return;

    setMatchInProgress(true);
    const loadingToast = toast.loading("Playing match with AI commentary...");

    try {
      // Recreate TournamentManager from saved bracket
      const teams = federations.slice(0, 8).map(fed => ({
        id: fed.id,
        name: fed.country,
        country: fed.country,
        teamRating: fed.teamRating
      }));
      const manager = new TournamentManager(teams);
      (manager as any).bracket = tournament.bracket; // Restore bracket state

      const nextMatch = manager.getNextMatch();
      if (!nextMatch || !nextMatch.homeTeam || !nextMatch.awayTeam) {
        toast.error("No matches available to play");
        toast.dismiss(loadingToast);
        setMatchInProgress(false);
        return;
      }

      // Get full team data with players
      const homeTeam = await fetchTeamWithPlayers(nextMatch.homeTeam.id);
      const awayTeam = await fetchTeamWithPlayers(nextMatch.awayTeam.id);

      if (!homeTeam || !awayTeam) {
        toast.error("Failed to fetch team data");
        toast.dismiss(loadingToast);
        setMatchInProgress(false);
        return;
      }

      // Validate teams have players
      if (!homeTeam.squad || homeTeam.squad.length === 0) {
        toast.error(`${homeTeam.country} has no registered players. Please register a squad first.`);
        toast.dismiss(loadingToast);
        setMatchInProgress(false);
        return;
      }

      if (!awayTeam.squad || awayTeam.squad.length === 0) {
        toast.error(`${awayTeam.country} has no registered players. Please register a squad first.`);
        toast.dismiss(loadingToast);
        setMatchInProgress(false);
        return;
      }

      console.log('Home team players:', homeTeam.squad.length);
      console.log('Away team players:', awayTeam.squad.length);

      // Simulate the match using MatchEngine
      const engine = new MatchEngine(
        {
          id: homeTeam.id,
          name: homeTeam.country,
          country: homeTeam.country,
          teamRating: homeTeam.teamRating,
          players: homeTeam.squad || []
        },
        {
          id: awayTeam.id,
          name: awayTeam.country,
          country: awayTeam.country,
          teamRating: awayTeam.teamRating,
          players: awayTeam.squad || []
        }
      );

      const matchResult = engine.simulateMatch();

      // Complete match with AI commentary and emails
      const completion = await completeMatch({
        team1: {
          name: homeTeam.country,
          score: matchResult.homeScore,
          email: homeTeam.representativeEmail || federations.find(f => f.id === homeTeam.id)?.representativeEmail
        },
        team2: {
          name: awayTeam.country,
          score: matchResult.awayScore,
          email: awayTeam.representativeEmail || federations.find(f => f.id === awayTeam.id)?.representativeEmail
        },
        goalScorers: [
          ...matchResult.homeGoalScorers.map(g => ({
            playerName: g.playerName,
            team: homeTeam.country,
            minute: g.minute
          })),
          ...matchResult.awayGoalScorers.map(g => ({
            playerName: g.playerName,
            team: awayTeam.country,
            minute: g.minute
          }))
        ],
        matchStats: {
          possession1: matchResult.stats.possession.home,
          possession2: matchResult.stats.possession.away,
          shots1: matchResult.stats.shots.home,
          shots2: matchResult.stats.shots.away,
          shotsOnTarget1: matchResult.stats.shotsOnTarget.home,
          shotsOnTarget2: matchResult.stats.shotsOnTarget.away,
          fouls1: matchResult.stats.fouls.home,
          fouls2: matchResult.stats.fouls.away,
          yellowCards1: matchResult.stats.yellowCards.home,
          yellowCards2: matchResult.stats.yellowCards.away,
          redCards1: matchResult.stats.redCards.home,
          redCards2: matchResult.stats.redCards.away
        },
        tournamentStage: nextMatch.round
      }, {
        generateCommentary: true,
        sendEmails: true
      });

      // Show commentary in dialog
      setCurrentMatchResult(matchResult);
      setCurrentCommentary(completion.commentary || "Match completed successfully!");
      setCommentaryDialog(true);

      // Prepare goal scorers data
      const goalScorersData = [
        ...matchResult.homeGoalScorers.map(g => ({
          playerName: g.playerName,
          team: homeTeam.country,
          minute: g.minute
        })),
        ...matchResult.awayGoalScorers.map(g => ({
          playerName: g.playerName,
          team: awayTeam.country,
          minute: g.minute
        }))
      ];

      // Advance winner to next round
      const updatedBracket = manager.advanceWinner(
        nextMatch.id,
        matchResult.homeScore,
        matchResult.awayScore,
        goalScorersData
      );

      const isTournamentComplete = manager.isTournamentComplete();
      const newCurrentRound = isTournamentComplete ? "Complete" : 
                      updatedBracket.final.homeTeam && updatedBracket.final.awayTeam ? "F" :
                      updatedBracket.semiFinals.some(m => !m.completed) ? "SF" : "QF";

      // Update Firestore with new bracket state
      await updateDoc(doc(db, "tournament", "current"), {
        bracket: updatedBracket,
        currentRound: newCurrentRound,
        status: isTournamentComplete ? "completed" : "in_progress",
        updatedAt: new Date().toISOString()
      });

      // Refresh tournament data
      const tournamentDoc = await getDoc(doc(db, "tournament", "current"));
      if (tournamentDoc.exists()) {
        setTournament({ id: tournamentDoc.id, ...tournamentDoc.data() } as TournamentData);
      }

      toast.dismiss(loadingToast);
      
      if (completion.emailsSent) {
        toast.success("Match completed! AI commentary generated and emails sent.", {
          icon: <Sparkles className="h-4 w-4" />
        });
      } else {
        toast.success("Match completed with AI commentary!");
      }

    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error("Failed to play match: " + error.message);
      console.error(error);
    } finally {
      setMatchInProgress(false);
    }
  };

  const handleSimulateQuick = async () => {
    if (!tournament || !tournament.bracket) return;

    setMatchInProgress(true);
    const loadingToast = toast.loading("Simulating match (no AI)...");

    try {
      const teams = federations.slice(0, 8).map(fed => ({
        id: fed.id,
        name: fed.country,
        country: fed.country,
        teamRating: fed.teamRating
      }));
      const manager = new TournamentManager(teams);
      (manager as any).bracket = tournament.bracket;

      const nextMatch = manager.getNextMatch();
      if (!nextMatch || !nextMatch.homeTeam || !nextMatch.awayTeam) {
        toast.error("No matches available to play");
        toast.dismiss(loadingToast);
        setMatchInProgress(false);
        return;
      }

      const homeTeam = await fetchTeamWithPlayers(nextMatch.homeTeam.id);
      const awayTeam = await fetchTeamWithPlayers(nextMatch.awayTeam.id);

      if (!homeTeam || !awayTeam) {
        toast.error("Failed to fetch team data");
        toast.dismiss(loadingToast);
        setMatchInProgress(false);
        return;
      }

      const engine = new MatchEngine(
        {
          id: homeTeam.id,
          name: homeTeam.country,
          country: homeTeam.country,
          teamRating: homeTeam.teamRating,
          players: homeTeam.squad || []
        },
        {
          id: awayTeam.id,
          name: awayTeam.country,
          country: awayTeam.country,
          teamRating: awayTeam.teamRating,
          players: awayTeam.squad || []
        }
      );

      const matchResult = engine.simulateMatch();

      // Quick simulation without AI
      const completion = await simulateMatchQuick({
        team1: {
          name: homeTeam.country,
          score: matchResult.homeScore,
          email: homeTeam.representativeEmail
        },
        team2: {
          name: awayTeam.country,
          score: matchResult.awayScore,
          email: awayTeam.representativeEmail
        },
        goalScorers: [
          ...matchResult.homeGoalScorers.map(g => ({
            playerName: g.playerName,
            team: homeTeam.country,
            minute: g.minute
          })),
          ...matchResult.awayGoalScorers.map(g => ({
            playerName: g.playerName,
            team: awayTeam.country,
            minute: g.minute
          }))
        ],
        tournamentStage: nextMatch.round
      });

      setCurrentMatchResult(matchResult);
      setCurrentCommentary(completion.commentary || "Match simulated quickly!");
      setCommentaryDialog(true);

      // Prepare goal scorers data
      const goalScorersData = [
        ...matchResult.homeGoalScorers.map(g => ({
          playerName: g.playerName,
          team: homeTeam.country,
          minute: g.minute
        })),
        ...matchResult.awayGoalScorers.map(g => ({
          playerName: g.playerName,
          team: awayTeam.country,
          minute: g.minute
        }))
      ];

      const updatedBracket = manager.advanceWinner(
        nextMatch.id,
        matchResult.homeScore,
        matchResult.awayScore,
        goalScorersData
      );

      const isTournamentComplete = manager.isTournamentComplete();
      const newCurrentRound = isTournamentComplete ? "Complete" : 
                      updatedBracket.final.homeTeam && updatedBracket.final.awayTeam ? "F" :
                      updatedBracket.semiFinals.some(m => !m.completed) ? "SF" : "QF";

      await updateDoc(doc(db, "tournament", "current"), {
        bracket: updatedBracket,
        currentRound: newCurrentRound,
        status: isTournamentComplete ? "completed" : "in_progress",
        updatedAt: new Date().toISOString()
      });

      const tournamentDoc = await getDoc(doc(db, "tournament", "current"));
      if (tournamentDoc.exists()) {
        setTournament({ id: tournamentDoc.id, ...tournamentDoc.data() } as TournamentData);
      }

      toast.dismiss(loadingToast);
      toast.success("Match simulated quickly (no AI costs)!");

    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error("Failed to simulate match");
      console.error(error);
    } finally {
      setMatchInProgress(false);
    }
  };

  const handleResetTournament = async () => {
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to reset the tournament?\n\n" +
      "This will:\n" +
      "• Delete all match results\n" +
      "• Clear the bracket\n" +
      "• Remove all goal scorer data\n\n" +
      "This action cannot be undone!"
    );
    
    if (!confirmed) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "tournament", "current"));
      setTournament(null);
      toast.success("Tournament reset successfully! You can now start a new tournament.");
    } catch (error: any) {
      toast.error("Failed to reset tournament");
      console.error(error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData || userData.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/"><Home className="h-4 w-4" /></Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Admin Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage the African Nations League</p>
          </div>
          <Button onClick={() => router.push("/")}>View Public Site</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered Federations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {federations.filter(f => f.isActive).length}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  / {federations.length} total
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {8 - federations.filter(f => f.isActive).length > 0 
                  ? `${8 - federations.filter(f => f.isActive).length} more squads needed for tournament`
                  : "All squads complete! Ready to start tournament"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tournament Status</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tournament?.status === "completed" ? "Complete" :
                 tournament?.status === "in_progress" ? "In Progress" :
                 "Not Started"}
              </div>
              <p className="text-xs text-muted-foreground">
                {tournament?.status === "completed" ? "Tournament has ended" :
                 tournament?.status === "in_progress" ? `Currently in ${tournament.currentRound === "QF" ? "Quarter Finals" : tournament.currentRound === "SF" ? "Semi Finals" : tournament.currentRound === "F" ? "Final" : "Progress"}` :
                 "Waiting for registrations"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matches Played</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tournament?.bracket ? 
                  (() => {
                    const qfCompleted = tournament.bracket.quarterFinals?.filter((m: any) => m.completed).length || 0;
                    const sfCompleted = tournament.bracket.semiFinals?.filter((m: any) => m.completed).length || 0;
                    const fCompleted = tournament.bracket.final?.completed ? 1 : 0;
                    return qfCompleted + sfCompleted + fCompleted;
                  })() : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {tournament?.bracket ? 
                  (() => {
                    const qfCompleted = tournament.bracket.quarterFinals?.filter((m: any) => m.completed).length || 0;
                    const sfCompleted = tournament.bracket.semiFinals?.filter((m: any) => m.completed).length || 0;
                    const fCompleted = tournament.bracket.final?.completed ? 1 : 0;
                    const total = qfCompleted + sfCompleted + fCompleted;
                    return `${7 - total} remaining`;
                  })() : "No matches yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Federations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Federations</CardTitle>
            <CardDescription>
              All federations that have completed registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {federations.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Federations Yet</h3>
                <p className="text-muted-foreground">Waiting for federations to register</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Team Rating</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {federations.map((federation) => (
                    <TableRow key={federation.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Image 
                            src={getCountryFlagUrl(federation.country)} 
                            alt={`${federation.country} flag`}
                            width={24}
                            height={16}
                            className="rounded object-cover"
                          />
                          {federation.country}
                        </div>
                      </TableCell>
                      <TableCell>{federation.managerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{federation.teamRating}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={federation.isActive ? "default" : "secondary"}>
                          {federation.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Tournament Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Tournament Controls</CardTitle>
            <CardDescription>
              Manage tournament operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!tournament && (
              <Button 
                onClick={handleStartTournament} 
                disabled={federations.filter(f => f.isActive).length < 8}
                className="w-full"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Start Tournament ({federations.filter(f => f.isActive).length}/8 teams with squads)
              </Button>
            )}
            
            {tournament && (
              <Button 
                onClick={handleResetTournament}
                variant="destructive"
                className="w-full"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Tournament
              </Button>
            )}
            
            {federations.length > federations.filter(f => f.isActive).length && (
              <Button 
                onClick={handleFixFederationStatuses}
                variant="outline"
                className="w-full"
              >
                <Users className="mr-2 h-4 w-4" />
                Fix Federation Statuses
              </Button>
            )}
              
              <p className="text-sm text-muted-foreground text-center">
                {federations.filter(f => f.isActive).length < 8 
                  ? `Need ${8 - federations.filter(f => f.isActive).length} more federation${8 - federations.filter(f => f.isActive).length !== 1 ? 's' : ''} to complete squad registration`
                  : "All federations have registered squads! Ready to start tournament."}
              </p>
              {federations.length > federations.filter(f => f.isActive).length && (
                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                  ⚠️ {federations.length - federations.filter(f => f.isActive).length} federation(s) registered but haven't completed squad selection
                </p>
              )}
            </CardContent>
          </Card>

        {/* Tournament Control Panel */}
        {tournament && tournament.bracket && (
          <div className="grid gap-6 md:grid-cols-2">
            <TournamentControlPanel
              stats={{
                totalTeams: 8,
                totalMatches: 7,
                completedMatches: (() => {
                  const qfCompleted = tournament.bracket.quarterFinals?.filter((m: any) => m.completed).length || 0;
                  const sfCompleted = tournament.bracket.semiFinals?.filter((m: any) => m.completed).length || 0;
                  const fCompleted = tournament.bracket.final?.completed ? 1 : 0;
                  return qfCompleted + sfCompleted + fCompleted;
                })(),
                remainingMatches: (() => {
                  const qfCompleted = tournament.bracket.quarterFinals?.filter((m: any) => m.completed).length || 0;
                  const sfCompleted = tournament.bracket.semiFinals?.filter((m: any) => m.completed).length || 0;
                  const fCompleted = tournament.bracket.final?.completed ? 1 : 0;
                  return 7 - (qfCompleted + sfCompleted + fCompleted);
                })(),
                currentRound: tournament.currentRound,
                totalGoals: (() => {
                  let goals = 0;
                  const countGoals = (matches: any[]) => {
                    matches.forEach((m: any) => {
                      if (m.completed) {
                        goals += (m.homeScore || 0) + (m.awayScore || 0);
                      }
                    });
                  };
                  if (tournament.bracket.quarterFinals) countGoals(tournament.bracket.quarterFinals);
                  if (tournament.bracket.semiFinals) countGoals(tournament.bracket.semiFinals);
                  if (tournament.bracket.final?.completed) {
                    goals += (tournament.bracket.final.homeScore || 0) + (tournament.bracket.final.awayScore || 0);
                  }
                  return goals;
                })(),
              }}
              nextMatch={
                (() => {
                  const teams = federations.slice(0, 8).map(fed => ({
                    id: fed.id,
                    name: fed.country,
                    country: fed.country,
                    teamRating: fed.teamRating
                  }));
                  const manager = new TournamentManager(teams);
                  (manager as any).bracket = tournament.bracket;
                  const next = manager.getNextMatch();
                  return next ? {
                    id: next.id,
                    round: next.round,
                    homeTeam: next.homeTeam?.name || "",
                    awayTeam: next.awayTeam?.name || "",
                  } : null;
                })()
              }
              onStartTournament={handleStartTournament}
              onPlayNextMatch={handlePlayNextMatch}
              onResetTournament={handleResetTournament}
              tournamentStarted={tournament?.status === "in_progress" || tournament?.status === "completed"}
              tournamentComplete={tournament.currentRound === "Complete" || tournament?.status === "completed"}
            />

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Fast simulation without AI costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleSimulateQuick}
                  disabled={matchInProgress || tournament.currentRound === "Complete"}
                  variant="outline"
                  className="w-full"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Simulate Match (No AI)
                </Button>
                <p className="text-xs text-muted-foreground">
                  Quickly simulate matches without generating AI commentary or sending emails. Useful for testing tournament progression.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Commentary Dialog */}
        <Dialog open={commentaryDialog} onOpenChange={setCommentaryDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Match Commentary
              </DialogTitle>
              <DialogDescription>
                {currentMatchResult && (
                  <div className="flex items-center justify-center gap-4 py-2">
                    <span className="font-semibold">{currentMatchResult.winner === 'home' ? '🏆' : ''}</span>
                    <span className="font-semibold text-lg">
                      {currentMatchResult.homeScore}
                    </span>
                    <span className="text-muted-foreground">-</span>
                    <span className="font-semibold text-lg">
                      {currentMatchResult.awayScore}
                    </span>
                    <span className="font-semibold">{currentMatchResult.winner === 'away' ? '🏆' : ''}</span>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{currentCommentary}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
