"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Trophy, Users, Calendar, Award, Loader2, Home } from "lucide-react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { HelpTooltip } from "@/components/help-tooltip";
import { EmptyStateGuide } from "@/components/empty-state-guide";

interface FederationData {
  id: string;
  country: string;
  managerName: string;
  teamRating: number;
  isActive: boolean;
  squad?: any[];
}

export default function DashboardPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const [federation, setFederation] = useState<FederationData | null>(null);
  const [loadingFederation, setLoadingFederation] = useState(false);
  const [matchesPlayed, setMatchesPlayed] = useState(0);

  useEffect(() => {
    if (!loading && !userData) {
      router.push("/auth");
    }

    // Fetch federation data if user has a federationId
    if (!loading && userData && userData.federationId) {
      console.log('Dashboard: Fetching federation data for:', userData.federationId);
      fetchFederationData(userData.federationId);
    } else if (!loading && userData) {
      console.log('Dashboard: No federationId found in userData:', userData);
    }
  }, [userData, loading, router]);

  const fetchFederationData = async (federationId: string) => {
    try {
      setLoadingFederation(true);
      console.log('Fetching federation document:', federationId);
      const federationDoc = await getDoc(doc(db, "federations", federationId));
      
      if (federationDoc.exists()) {
        const federationData: FederationData = { id: federationDoc.id, ...federationDoc.data() } as FederationData;
        console.log('Federation document:', federationData);
        
        // Fetch players from subcollection
        const playersRef = collection(db, `federations/${federationId}/players`);
        const playersSnapshot = await getDocs(playersRef);
        const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        console.log('Players fetched:', players.length, 'players');
        
        setFederation({
          ...federationData,
          squad: players
        } as FederationData);

        // Fetch matches played count
        const tournamentDoc = await getDoc(doc(db, "tournament", "current"));
        if (tournamentDoc.exists()) {
          const tournamentData = tournamentDoc.data();
          const bracket = tournamentData?.bracket;
          
          if (bracket) {
            // Count matches where this federation participated
            let matchCount = 0;
            const country = federationData.country;
            
            // Check quarter finals
            if (bracket.quarterFinals) {
              matchCount += bracket.quarterFinals.filter((m: any) => 
                m.completed && (m.homeTeam?.name === country || m.awayTeam?.name === country)
              ).length;
            }
            
            // Check semi finals
            if (bracket.semiFinals) {
              matchCount += bracket.semiFinals.filter((m: any) => 
                m.completed && (m.homeTeam?.name === country || m.awayTeam?.name === country)
              ).length;
            }
            
            // Check final
            if (bracket.final?.completed && 
                (bracket.final.homeTeam?.name === country || bracket.final.awayTeam?.name === country)) {
              matchCount++;
            }
            
            setMatchesPlayed(matchCount);
          }
        }
      } else {
        console.error('Federation document does not exist!');
      }
    } catch (error: any) {
      console.error("Error fetching federation:", error);
      toast.error("Failed to load federation data");
    } finally {
      setLoadingFederation(false);
    }
  };  if (loading || loadingFederation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
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
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userData.email}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {userData.role === "admin" ? "Administrator" : "Representative"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Federation</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userData.federationId ? "Registered" : "Not Registered"}
            </div>
            <p className="text-xs text-muted-foreground">
              {userData.federationId ? "Federation active" : "Register your federation"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Squad Size
              <HelpTooltip content="Select up to 23 players for your squad. Go to 'Manage Federation' to add more players." />
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{federation?.squad?.length || 0}/23</div>
            <p className="text-xs text-muted-foreground">Players selected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Matches Played
              <HelpTooltip content="Total number of tournament matches your federation has participated in." />
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchesPlayed}</div>
            <p className="text-xs text-muted-foreground">Tournament games</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Team Rating
              <HelpTooltip content="Average rating of all players in your squad. Higher ratings mean better performance." />
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{federation?.teamRating || '--'}</div>
            <p className="text-xs text-muted-foreground">Average squad rating</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="squad">My Squad</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your federation and tournament participation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {!userData.federationId ? (
                <Button className="w-full" onClick={() => router.push("/register-federation")}>
                  Register Your Federation
                </Button>
              ) : (
                <>
                  <Button className="w-full" variant="outline" onClick={() => router.push("/federation")}>
                    Manage Federation
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => router.push("/bracket")}>
                    View Tournament Bracket
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Steps to participate in the African Nations League</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  1
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Register Your Federation</p>
                  <p className="text-sm text-muted-foreground">
                    Choose your African nation and register your federation
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  2
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Select Your Squad</p>
                  <p className="text-sm text-muted-foreground">
                    Pick 23 players from your nation's player pool
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  3
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Wait for Tournament</p>
                  <p className="text-sm text-muted-foreground">
                    Admin will start the tournament when all teams are ready
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="squad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Squad Overview</CardTitle>
              <CardDescription>
                {userData.federationId ? `Your registered players (${federation?.squad?.length || 0}/23)` : "Register your federation to select players"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!userData.federationId ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Squad Yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Register your federation to start building your squad
                  </p>
                  <Button className="mt-4" onClick={() => router.push("/register-federation")}>
                    Register Federation
                  </Button>
                </div>
              ) : !federation?.squad || federation.squad.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Squad Not Selected</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Complete your federation registration to view your squad
                  </p>
                  <Button className="mt-4" variant="outline" onClick={() => router.push("/register-federation")}>
                    Select Squad
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {federation.squad.map((player: any, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {player.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium">{player.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {player.naturalPosition} • {player.ratings?.[player.naturalPosition] || 'N/A'}
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
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Match History</CardTitle>
              <CardDescription>Your team's performance in the tournament</CardDescription>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
