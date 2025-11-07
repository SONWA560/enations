"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Shield, Users, MapPin, Calendar, Edit, Loader2, Home } from "lucide-react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { getCountryFlagUrl } from "@/lib/utils/countryLogos";

interface FederationData {
  id: string;
  country: string;
  managerName: string;
  teamRating: number;
  isActive: boolean;
  squad?: any[];
  createdAt?: string;
}

export default function FederationPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const [federation, setFederation] = useState<FederationData | null>(null);
  const [loadingFederation, setLoadingFederation] = useState(true);
  const [matchesPlayed, setMatchesPlayed] = useState(0);
  const [goalsScored, setGoalsScored] = useState(0);

  useEffect(() => {
    if (!loading && !userData) {
      router.push("/auth");
    }

    if (!loading && userData && !userData.federationId) {
      router.push("/register-federation");
    }

    // Fetch federation data if user has a federationId
    if (!loading && userData && userData.federationId) {
      fetchFederationData(userData.federationId);
    }
  }, [userData, loading, router]);

  const fetchFederationData = async (federationId: string) => {
    try {
      setLoadingFederation(true);
      const federationDoc = await getDoc(doc(db, "federations", federationId));
      
      if (federationDoc.exists()) {
        const federationData = { id: federationDoc.id, ...federationDoc.data() };
        
        // Fetch players from subcollection
        const playersRef = collection(db, `federations/${federationId}/players`);
        const playersSnapshot = await getDocs(playersRef);
        const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setFederation({
          ...federationData,
          squad: players
        } as FederationData);

        // Fetch match statistics
        const tournamentDoc = await getDoc(doc(db, "tournament", "current"));
        if (tournamentDoc.exists()) {
          const tournamentData = tournamentDoc.data();
          const bracket = tournamentData?.bracket;
          
          if (bracket) {
            const country = (federationData as any).country;
            let matchCount = 0;
            let totalGoals = 0;
            
            // Helper function to check matches
            const checkMatches = (matches: any[]) => {
              matches.forEach((match: any) => {
                if (match.completed) {
                  if (match.homeTeam?.name === country) {
                    matchCount++;
                    totalGoals += match.homeScore || 0;
                  } else if (match.awayTeam?.name === country) {
                    matchCount++;
                    totalGoals += match.awayScore || 0;
                  }
                }
              });
            };
            
            // Check all rounds
            if (bracket.quarterFinals) checkMatches(bracket.quarterFinals);
            if (bracket.semiFinals) checkMatches(bracket.semiFinals);
            if (bracket.final?.completed) checkMatches([bracket.final]);
            
            setMatchesPlayed(matchCount);
            setGoalsScored(totalGoals);
          }
        }
      } else {
        toast.error("Federation not found");
        router.push("/register-federation");
      }
    } catch (error: any) {
      console.error("Error fetching federation:", error);
      toast.error("Failed to load federation data");
    } finally {
      setLoadingFederation(false);
    }
  };

  if (loading || loadingFederation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading federation data...</p>
        </div>
      </div>
    );
  }

  if (!userData || !userData.federationId || !federation) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
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
            <BreadcrumbPage>My Federation</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Federation</h1>
          <p className="text-muted-foreground">Manage your team and players</p>
        </div>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit Details
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <Image 
                src={getCountryFlagUrl(federation.country)} 
                alt={`${federation.country} flag`}
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
              <AvatarFallback>
                <Shield className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{federation.country} Football Federation</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" />
                {federation.country}
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-1">
                Manager: {federation.managerName}
              </p>
            </div>
            <Badge variant={federation.isActive ? "default" : "secondary"} className="text-sm">
              {federation.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Squad Size</p>
              <p className="text-2xl font-bold">{federation.squad?.length || 0}/23</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Team Rating</p>
              <p className="text-2xl font-bold">{federation.teamRating || '--'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Matches Played</p>
              <p className="text-2xl font-bold">{matchesPlayed}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Goals Scored</p>
              <p className="text-2xl font-bold">{goalsScored}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Squad</CardTitle>
              <CardDescription>Your registered players ({federation.squad?.length || 0}/23)</CardDescription>
            </div>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Squad
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!federation.squad || federation.squad.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Players Selected</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Complete your federation registration to add players
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {federation.squad.map((player, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{player.name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {player.naturalPosition} • Rating: {player.ratings?.[player.naturalPosition] || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {player.isCaptain && (
                    <Badge variant="default">Captain</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Match History</CardTitle>
          <CardDescription>Your team's performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Matches Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Matches will appear here once the tournament starts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
