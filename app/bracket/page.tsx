"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TournamentBracket } from "@/components/tournament-bracket";
import { HelpBanner } from "@/components/help-banner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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

interface Match {
  id: string;
  homeTeam: any;
  awayTeam: any;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'in-progress' | 'completed';
  winner?: string;
  round: 'QF' | 'SF' | 'F';
  matchNumber: number;
  date?: string;
  venue?: string;
}

interface TournamentData {
  id: string;
  status?: string;
  currentRound?: string;
  bracket?: {
    quarterFinals?: any[];
    semiFinals?: any[];
    final?: any;
  };
  [key: string]: any;
}

export default function BracketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [bracket, setBracket] = useState<any>(null);

  useEffect(() => {
    loadTournamentBracket();
    
    // Set up auto-refresh every 30 seconds for live updates
    const interval = setInterval(() => {
      loadTournamentBracket();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadTournamentBracket = async () => {
    try {
      setError(null);
      
      // Get active tournament from tournament/current document
      const tournamentDoc = await getDoc(doc(db, "tournament", "current"));
      
      if (!tournamentDoc.exists()) {
        setError("No active tournament found. Check back later!");
        setLoading(false);
        return;
      }

      const tournamentData: TournamentData = { id: tournamentDoc.id, ...tournamentDoc.data() };
      setTournament(tournamentData);

      // The bracket is stored directly in the tournament document
      const bracketData = tournamentData.bracket;

      if (!bracketData) {
        setError("Tournament bracket is not available yet.");
        setLoading(false);
        return;
      }

      // Map the bracket data to ensure status field is present
      const mappedBracket = {
        quarterFinals: bracketData.quarterFinals?.map((match: any) => ({
          ...match,
          status: match.completed ? 'completed' : 'scheduled'
        })) || [],
        semiFinals: bracketData.semiFinals?.map((match: any) => ({
          ...match,
          status: match.completed ? 'completed' : 'scheduled'
        })) || [],
        final: bracketData.final ? {
          ...bracketData.final,
          status: bracketData.final.completed ? 'completed' : 'scheduled'
        } : null
      };

      setBracket(mappedBracket);
      setLoading(false);
    } catch (err) {
      console.error("Error loading bracket:", err);
      setError("Failed to load tournament bracket. Please try again.");
      setLoading(false);
    }
  };

  const handleMatchClick = (matchId: string) => {
    // Navigate to match details page
    router.push(`/match/${matchId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading tournament bracket...</p>
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
              <BreadcrumbPage>Tournament Bracket</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6">
          <HelpBanner
            storageKey="bracket-help-dismissed"
            title="How to Use the Tournament Bracket"
            description="View all tournament matches and results in one place. Click on any match to see detailed commentary and statistics."
            tips={[
              "Click on a completed match to view AI-generated commentary and key moments",
              "Matches update in real-time as the tournament progresses",
              "Check back regularly to see the latest results and bracket updates"
            ]}
          />
        </div>

        <TournamentBracket
          bracket={bracket}
          tournamentName={tournament?.name || "African Nations League"}
          onMatchClick={handleMatchClick}
        />
      </div>
    </div>
  );
}
