'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { addPlayer, updateFederation, getPlayers } from "@/lib/firebaseService";
import { toast } from "sonner";
import { Trash2, Crown, Home, AlertCircle, CheckCircle2 } from "lucide-react";

type Position = "GK" | "DF" | "MD" | "AT";

interface Player {
  id?: string;
  name: string;
  naturalPosition: Position;
  isCaptain: boolean;
  ratings: {
    GK: number;
    DF: number;
    MD: number;
    AT: number;
  };
  naturalRating: number; // Rating for natural position (50-100)
}

function PlayersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const federationId = searchParams.get('federationId');
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [position, setPosition] = useState<Position>("GK");
  const [loading, setLoading] = useState(false);

  const generateRatings = (naturalPos: Position): Player['ratings'] => {
    const ratings = { GK: 0, DF: 0, MD: 0, AT: 0 };
    
    // Natural position gets 50-100
    ratings[naturalPos] = Math.floor(Math.random() * 51) + 50;
    
    // Other positions get 0-50
    (Object.keys(ratings) as Position[]).forEach((pos) => {
      if (pos !== naturalPos) {
        ratings[pos] = Math.floor(Math.random() * 51);
      }
    });
    
    return ratings;
  };

  const handleAddPlayer = () => {
    if (!playerName.trim()) {
      toast.error("Please enter a player name");
      return;
    }
    
    if (players.length >= 23) {
      toast.error("You can only add 23 players");
      return;
    }
    
    const ratings = generateRatings(position);
    const newPlayer: Player = {
      name: playerName.trim(),
      naturalPosition: position,
      isCaptain: false,
      ratings: ratings,
      naturalRating: ratings[position], // Store the natural position rating
    };
    
    setPlayers([...players, newPlayer]);
    setPlayerName("");
    toast.success(`${playerName} added to squad`);
  };

  const handleAutoGenerate = () => {
    const positions: Position[] = ["GK", "GK", "GK", "DF", "DF", "DF", "DF", "DF", "DF", "DF", "DF", "MD", "MD", "MD", "MD", "MD", "MD", "MD", "AT", "AT", "AT", "AT", "AT"];
    const firstNames = ["Mohamed", "Ahmed", "Ali", "Ibrahim", "Youssef", "Omar", "Khalid", "Hassan", "Emmanuel", "Samuel", "David", "Joseph", "Daniel", "Michael", "John", "Peter"];
    const lastNames = ["Salah", "Mane", "Mahrez", "Aubameyang", "Eto'o", "Drogba", "Toure", "Essien", "Okocha", "Kanu", "Adebayor", "Ba", "Onyekuru", "Iheanacho"];
    
    const generatedPlayers: Player[] = positions.map((pos, index) => {
      const ratings = generateRatings(pos);
      return {
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        naturalPosition: pos,
        isCaptain: false,
        ratings: ratings,
        naturalRating: ratings[pos], // Store the natural position rating
      };
    });
    
    setPlayers(generatedPlayers);
    toast.success("23 players auto-generated!");
  };

  const handleSetCaptain = (index: number) => {
    setPlayers(players.map((p, i) => ({
      ...p,
      isCaptain: i === index,
    })));
  };

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const calculateTeamRating = () => {
    if (players.length === 0) return 0;
    // Team rating = average of each player's natural position rating
    const totalRating = players.reduce((sum, player) => {
      // Use the player's rating for their natural position
      return sum + player.naturalRating;
    }, 0);
    return Math.round(totalRating / players.length);
  };

  const handleSubmit = async () => {
    if (players.length !== 23) {
      toast.error("You must have exactly 23 players");
      return;
    }
    
    const captainCount = players.filter(p => p.isCaptain).length;
    if (captainCount !== 1) {
      toast.error("You must designate exactly one captain");
      return;
    }
    
    if (!federationId) {
      toast.error("Federation ID is missing");
      return;
    }
    
    setLoading(true);
    
    try {
      // Add all players to the sub-collection
      for (const player of players) {
        await addPlayer(federationId, player);
      }
      
      // Update federation with team rating and activate it
      const teamRating = calculateTeamRating();
      await updateFederation(federationId, { 
        teamRating,
        isActive: true, // Activate federation now that squad is complete
        hasSquad: true,
        updatedAt: new Date().toISOString()
      });
      
      toast.success("Squad registered successfully! Your federation is now active.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to register squad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
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
              <BreadcrumbLink asChild>
                <Link href="/register-federation">Register Federation</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Squad Registration</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Progress Steps */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${players.length === 23 ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground'}`}>
                  1
                </div>
                <div>
                  <p className="text-sm font-medium">Add 23 Players</p>
                  <p className="text-xs text-muted-foreground">{players.length}/23 added</p>
                </div>
              </div>
              
              <div className="h-px flex-1 bg-border" />
              
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${players.filter(p => p.isCaptain).length === 1 ? 'bg-green-500 text-white' : players.length === 23 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  2
                </div>
                <div>
                  <p className="text-sm font-medium">Select Captain</p>
                  <p className="text-xs text-muted-foreground">
                    {players.filter(p => p.isCaptain).length === 1 ? 'Captain selected' : 'Not selected'}
                  </p>
                </div>
              </div>
              
              <div className="h-px flex-1 bg-border" />
              
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${players.length === 23 && players.filter(p => p.isCaptain).length === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  3
                </div>
                <div>
                  <p className="text-sm font-medium">Submit Squad</p>
                  <p className="text-xs text-muted-foreground">Ready to submit</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Build Your 23-Player Squad</CardTitle>
            <CardDescription>
              Add players one by one or auto-generate a complete squad. Designate one captain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="player-name">Player Name</Label>
                <Input
                  id="player-name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter player name"
                />
              </div>
              <div className="w-[150px]">
                <Label htmlFor="position">Position</Label>
                <Select value={position} onValueChange={(val) => setPosition(val as Position)}>
                  <SelectTrigger id="position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GK">Goalkeeper</SelectItem>
                    <SelectItem value="DF">Defender</SelectItem>
                    <SelectItem value="MD">Midfielder</SelectItem>
                    <SelectItem value="AT">Attacker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleAddPlayer} disabled={players.length >= 23}>
                  Add Player
                </Button>
                <Button onClick={handleAutoGenerate} variant="outline" disabled={players.length > 0}>
                  Auto-Generate
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Players: {players.length}/23 | Team Rating: {calculateTeamRating()}
              </p>
            </div>
          </CardContent>
        </Card>

        {players.length > 0 && (
          <>
            {/* Captain Selection Alert */}
            {players.length === 23 && players.filter(p => p.isCaptain).length === 0 && (
              <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900 dark:text-amber-100">Captain Selection Required</AlertTitle>
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  You've added all 23 players! Now you need to <strong>select a captain</strong> before submitting your squad. 
                  Click the <Crown className="w-4 h-4 inline mx-1" /> crown icon next to a player's name to designate them as captain.
                </AlertDescription>
              </Alert>
            )}

            {/* Success Alert when captain is selected */}
            {players.length === 23 && players.filter(p => p.isCaptain).length === 1 && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900 dark:text-green-100">Squad Ready!</AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Your squad is complete with a captain selected. You can now submit your squad to activate your federation.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Squad List</CardTitle>
              </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>GK</TableHead>
                    <TableHead>DF</TableHead>
                    <TableHead>MD</TableHead>
                    <TableHead>AT</TableHead>
                    <TableHead>Captain</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{player.naturalPosition}</Badge>
                      </TableCell>
                      <TableCell>{player.ratings.GK}</TableCell>
                      <TableCell>{player.ratings.DF}</TableCell>
                      <TableCell>{player.ratings.MD}</TableCell>
                      <TableCell>{player.ratings.AT}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={player.isCaptain ? "default" : "ghost"}
                          onClick={() => handleSetCaptain(index)}
                        >
                          <Crown className="w-4 h-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemovePlayer(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-6">
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || players.length !== 23 || players.filter(p => p.isCaptain).length !== 1}
                  className="w-full"
                >
                  {loading ? "Submitting Squad..." : "Submit Squad"}
                </Button>
              </div>
            </CardContent>
          </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default function PlayersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PlayersPageContent />
    </Suspense>
  );
}
