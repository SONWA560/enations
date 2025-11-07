"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Star, 
  Users, 
  Trophy,
  TrendingUp,
  Filter
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { normalizePosition } from "@/lib/utils/playerData";
import { cn } from "@/lib/utils";

interface PlayerRatings {
  GK: number;
  DF: number;
  MD: number;
  AT: number;
}

interface Player {
  id: string;
  name: string;
  age: number;
  nationality: string;
  position: string; // Natural position (GK, DF, MD, AT)
  height: string;
  ratings: PlayerRatings; // All 4 position ratings
  naturalRating: number; // Overall rating
  available: boolean;
}

interface PlayerPoolSelectorProps {
  country: string;
  onSelectPlayers: (players: Player[]) => void;
  maxPlayers?: number;
  selectedPlayers?: Player[];
}

export function PlayerPoolSelector({
  country,
  onSelectPlayers,
  maxPlayers = 23,
  selectedPlayers = [],
}: PlayerPoolSelectorProps) {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, [country]);

  useEffect(() => {
    filterPlayers();
  }, [searchQuery, positionFilter, availablePlayers]);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      // Import dynamically to avoid server-side issues
      const { getAvailablePlayersByCountry } = await import("@/lib/firebaseService");
      const players = await getAvailablePlayersByCountry(country);
      setAvailablePlayers(players as Player[]);
      setFilteredPlayers(players as Player[]);
    } catch (error) {
      console.error("Error loading players:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPlayers = () => {
    let filtered = [...availablePlayers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Position filter
    if (positionFilter !== "all") {
      filtered = filtered.filter(p => 
        normalizePosition(p.position) === positionFilter
      );
    }

    setFilteredPlayers(filtered);
  };

  const togglePlayer = (player: Player) => {
    const isSelected = selectedPlayers.some(p => p.id === player.id);
    
    if (isSelected) {
      onSelectPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else if (selectedPlayers.length < maxPlayers) {
      onSelectPlayers([...selectedPlayers, player]);
    }
  };

  const selectBestSquad = () => {
    // Auto-select top players by position
    const gks = availablePlayers
      .filter(p => normalizePosition(p.position) === 'GK')
      .sort((a, b) => b.naturalRating - a.naturalRating)
      .slice(0, 3);
    
    const dfs = availablePlayers
      .filter(p => normalizePosition(p.position) === 'DF')
      .sort((a, b) => b.naturalRating - a.naturalRating)
      .slice(0, 8);
    
    const mds = availablePlayers
      .filter(p => normalizePosition(p.position) === 'MD')
      .sort((a, b) => b.naturalRating - a.naturalRating)
      .slice(0, 8);
    
    const ats = availablePlayers
      .filter(p => normalizePosition(p.position) === 'AT')
      .sort((a, b) => b.naturalRating - a.naturalRating)
      .slice(0, 4);
    
    onSelectPlayers([...gks, ...dfs, ...mds, ...ats]);
  };

  const squadStats = {
    gk: selectedPlayers.filter(p => normalizePosition(p.position) === 'GK').length,
    df: selectedPlayers.filter(p => normalizePosition(p.position) === 'DF').length,
    md: selectedPlayers.filter(p => normalizePosition(p.position) === 'MD').length,
    at: selectedPlayers.filter(p => normalizePosition(p.position) === 'AT').length,
  };

  const avgRating = selectedPlayers.length > 0
    ? (selectedPlayers.reduce((sum, p) => sum + p.naturalRating, 0) / selectedPlayers.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      {/* Squad Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Squad Selection
              </CardTitle>
              <CardDescription>
                Select {maxPlayers} players for {country}
              </CardDescription>
            </div>
            <Button onClick={selectBestSquad} variant="outline" size="sm">
              <Star className="mr-2 h-4 w-4" />
              Auto-Select Best
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Selected</div>
              <div className="text-2xl font-bold">
                {selectedPlayers.length}/{maxPlayers}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Avg Rating
              </div>
              <div className="text-2xl font-bold">{avgRating}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">GK</div>
              <div className={cn("text-2xl font-bold", squadStats.gk < 3 && "text-orange-500")}>
                {squadStats.gk}/3
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">DF</div>
              <div className={cn("text-2xl font-bold", squadStats.df < 8 && "text-orange-500")}>
                {squadStats.df}/8
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">MD</div>
              <div className={cn("text-2xl font-bold", squadStats.md < 8 && "text-orange-500")}>
                {squadStats.md}/8
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">AT</div>
              <div className={cn("text-2xl font-bold", squadStats.at < 4 && "text-orange-500")}>
                {squadStats.at}/4
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={positionFilter} onValueChange={setPositionFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            <SelectItem value="GK">Goalkeepers</SelectItem>
            <SelectItem value="DF">Defenders</SelectItem>
            <SelectItem value="MD">Midfielders</SelectItem>
            <SelectItem value="AT">Attackers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Player List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Available Players ({filteredPlayers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading players...
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No players found
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredPlayers.map((player) => {
                const isSelected = selectedPlayers.some(p => p.id === player.id);
                const canSelect = selectedPlayers.length < maxPlayers;
                
                return (
                  <button
                    key={player.id}
                    onClick={() => togglePlayer(player)}
                    disabled={!isSelected && !canSelect}
                    className={cn(
                      "w-full p-3 rounded-lg border transition-all text-left",
                      "hover:border-primary hover:bg-accent",
                      isSelected && "border-primary bg-primary/5",
                      !isSelected && !canSelect && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-xs">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{player.name}</p>
                          {isSelected && (
                            <Star className="h-4 w-4 fill-primary text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{player.age} yrs</span>
                          <span>•</span>
                          <span>{player.height}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{normalizePosition(player.position)}</Badge>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          <span className="font-bold text-sm">{player.naturalRating}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
