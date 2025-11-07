/**
 * MatchEngine Class
 * Handles match simulation logic including score generation,
 * goal scorers, and match statistics
 */

interface Player {
  id: string;
  name: string;
  position: "GK" | "DF" | "MD" | "AT";
  naturalRating: number;
  captain?: boolean;
}

interface Team {
  id: string;
  name: string;
  country: string;
  players: Player[];
  teamRating: number;
}

interface GoalScorer {
  playerId: string;
  playerName: string;
  minute: number;
  assistBy?: string;
}

interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  offsides: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
}

interface MatchResult {
  homeScore: number;
  awayScore: number;
  homeGoalScorers: GoalScorer[];
  awayGoalScorers: GoalScorer[];
  stats: MatchStats;
  winner: "home" | "away" | "draw";
  matchEvents: MatchEvent[];
}

interface MatchEvent {
  minute: number;
  type: "goal" | "yellow_card" | "red_card" | "substitution";
  team: "home" | "away";
  player: string;
  description: string;
}

export class MatchEngine {
  private homeTeam: Team;
  private awayTeam: Team;
  private matchDuration: number;

  constructor(homeTeam: Team, awayTeam: Team, matchDuration: number = 90) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.matchDuration = matchDuration;
  }

  /**
   * Main method to simulate a complete match
   * Guarantees no draws by adding a winning goal if scores are tied
   */
  public simulateMatch(): MatchResult {
    // Calculate base goal probability based on team ratings
    const homeGoalProbability = this.calculateGoalProbability(
      this.homeTeam.teamRating,
      this.awayTeam.teamRating,
      true
    );
    const awayGoalProbability = this.calculateGoalProbability(
      this.awayTeam.teamRating,
      this.homeTeam.teamRating,
      false
    );

    // Generate initial scores
    let homeScore = this.generateGoals(homeGoalProbability);
    let awayScore = this.generateGoals(awayGoalProbability);

    // Generate goal scorers for initial goals
    const homeGoalScorers = this.generateGoalScorers(
      this.homeTeam,
      homeScore
    );
    const awayGoalScorers = this.generateGoalScorers(
      this.awayTeam,
      awayScore
    );

    // Ensure no draws - add winning goal if tied
    if (homeScore === awayScore) {
      const winningTeam = Math.random() > 0.5 ? "home" : "away";
      
      if (winningTeam === "home") {
        homeScore++;
        const winningGoal = this.generateGoalScorers(this.homeTeam, 1)[0];
        // Make it a late goal (85-90 minutes)
        winningGoal.minute = 85 + Math.floor(Math.random() * 6);
        homeGoalScorers.push(winningGoal);
      } else {
        awayScore++;
        const winningGoal = this.generateGoalScorers(this.awayTeam, 1)[0];
        // Make it a late goal (85-90 minutes)
        winningGoal.minute = 85 + Math.floor(Math.random() * 6);
        awayGoalScorers.push(winningGoal);
      }
    }

    // Sort goal scorers by minute
    homeGoalScorers.sort((a, b) => a.minute - b.minute);
    awayGoalScorers.sort((a, b) => a.minute - b.minute);

    // Generate match statistics
    const stats = this.generateMatchStats(homeScore, awayScore);

    // Generate match events
    const matchEvents = this.generateMatchEvents(
      homeGoalScorers,
      awayGoalScorers,
      stats
    );

    // Determine winner
    const winner = homeScore > awayScore ? "home" : "away";

    return {
      homeScore,
      awayScore,
      homeGoalScorers,
      awayGoalScorers,
      stats,
      winner,
      matchEvents,
    };
  }

  /**
   * Calculate goal probability based on team ratings
   */
  private calculateGoalProbability(
    attackRating: number,
    defenseRating: number,
    isHome: boolean
  ): number {
    // Base probability
    let probability = attackRating / 100;

    // Adjust based on opponent's defense
    const defenseFactor = defenseRating / 100;
    probability *= 1 - defenseFactor * 0.3;

    // Home advantage (10% boost)
    if (isHome) {
      probability *= 1.1;
    }

    // Ensure reasonable goal range (0.5 to 3.5 expected goals)
    probability = Math.max(0.5, Math.min(3.5, probability * 3));

    return probability;
  }

  /**
   * Generate number of goals using Poisson distribution approximation
   */
  private generateGoals(probability: number): number {
    // Simple Poisson approximation using multiple random checks
    let goals = 0;
    let remainingProbability = probability;

    while (remainingProbability > 0) {
      if (Math.random() < remainingProbability) {
        goals++;
        remainingProbability -= 1;
      } else {
        break;
      }
    }

    return goals;
  }

  /**
   * Generate goal scorers with weighted probability based on position
   */
  private generateGoalScorers(team: Team, goalCount: number): GoalScorer[] {
    const scorers: GoalScorer[] = [];
    const players = team.players;

    // Check if team has players
    if (!players || players.length === 0) {
      console.warn(`Team ${team.name} has no players to generate goal scorers`);
      return scorers;
    }

    // Position weight multipliers for scoring
    const positionWeights = {
      AT: 4.0, // Attackers most likely to score
      MD: 2.0, // Midfielders moderate chance
      DF: 0.5, // Defenders low chance
      GK: 0.01, // Goalkeepers very rare
    };

    for (let i = 0; i < goalCount; i++) {
      // Calculate weighted probabilities for each player
      const weightedPlayers = players.map((player) => ({
        player,
        weight:
          (player.naturalRating / 100) *
          positionWeights[player.position] *
          (player.captain ? 1.2 : 1.0), // Captain boost
      }));

      // Safety check for empty weighted players
      if (weightedPlayers.length === 0) {
        console.warn(`No weighted players available for team ${team.name}`);
        continue;
      }

      // Calculate total weight
      const totalWeight = weightedPlayers.reduce(
        (sum, wp) => sum + wp.weight,
        0
      );

      // Safety check for zero total weight
      if (totalWeight === 0) {
        console.warn(`Total weight is zero for team ${team.name}, using random selection`);
        const randomPlayer = players[Math.floor(Math.random() * players.length)];
        const minute = Math.floor(Math.random() * this.matchDuration) + 1;
        scorers.push({
          playerId: randomPlayer.id,
          playerName: randomPlayer.name,
          minute: minute,
        });
        continue;
      }

      // Select a random player based on weights
      let random = Math.random() * totalWeight;
      let selectedPlayer = weightedPlayers[0].player;

      for (const wp of weightedPlayers) {
        random -= wp.weight;
        if (random <= 0) {
          selectedPlayer = wp.player;
          break;
        }
      }

      // Generate random minute (1-90)
      const minute = Math.floor(Math.random() * this.matchDuration) + 1;

      scorers.push({
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.name,
        minute,
      });
    }

    return scorers;
  }

  /**
   * Generate realistic match statistics
   */
  private generateMatchStats(homeScore: number, awayScore: number): MatchStats {
    // Base possession on team ratings with some randomness
    const ratingDiff = this.homeTeam.teamRating - this.awayTeam.teamRating;
    const basePossession = 50 + ratingDiff * 0.3;
    const homePossession = Math.max(
      35,
      Math.min(65, basePossession + (Math.random() - 0.5) * 10)
    );
    const awayPossession = 100 - homePossession;

    // Generate shots (more shots typically correlate with more goals)
    const homeShots = Math.max(
      homeScore + 3,
      Math.floor(8 + Math.random() * 12 + homeScore * 2)
    );
    const awayShots = Math.max(
      awayScore + 3,
      Math.floor(8 + Math.random() * 12 + awayScore * 2)
    );

    // Shots on target (at least as many as goals, typically 30-50% of total shots)
    const homeShotsOnTarget = Math.max(
      homeScore,
      Math.floor(homeShots * (0.3 + Math.random() * 0.2))
    );
    const awayShotsOnTarget = Math.max(
      awayScore,
      Math.floor(awayShots * (0.3 + Math.random() * 0.2))
    );

    // Other statistics
    const homeCorners = Math.floor(3 + Math.random() * 10);
    const awayCorners = Math.floor(3 + Math.random() * 10);

    const homeFouls = Math.floor(8 + Math.random() * 10);
    const awayFouls = Math.floor(8 + Math.random() * 10);

    const homeOffsides = Math.floor(Math.random() * 6);
    const awayOffsides = Math.floor(Math.random() * 6);

    const homeYellowCards = Math.floor(Math.random() * 4);
    const awayYellowCards = Math.floor(Math.random() * 4);

    const homeRedCards = Math.random() < 0.1 ? 1 : 0;
    const awayRedCards = Math.random() < 0.1 ? 1 : 0;

    return {
      possession: {
        home: Math.round(homePossession),
        away: Math.round(awayPossession),
      },
      shots: { home: homeShots, away: awayShots },
      shotsOnTarget: { home: homeShotsOnTarget, away: awayShotsOnTarget },
      corners: { home: homeCorners, away: awayCorners },
      fouls: { home: homeFouls, away: awayFouls },
      offsides: { home: homeOffsides, away: awayOffsides },
      yellowCards: { home: homeYellowCards, away: awayYellowCards },
      redCards: { home: homeRedCards, away: awayRedCards },
    };
  }

  /**
   * Generate match events timeline
   */
  private generateMatchEvents(
    homeGoalScorers: GoalScorer[],
    awayGoalScorers: GoalScorer[],
    stats: MatchStats
  ): MatchEvent[] {
    const events: MatchEvent[] = [];

    // Add goal events
    homeGoalScorers.forEach((scorer) => {
      events.push({
        minute: scorer.minute,
        type: "goal",
        team: "home",
        player: scorer.playerName,
        description: `Goal scored by ${scorer.playerName}`,
      });
    });

    awayGoalScorers.forEach((scorer) => {
      events.push({
        minute: scorer.minute,
        type: "goal",
        team: "away",
        player: scorer.playerName,
        description: `Goal scored by ${scorer.playerName}`,
      });
    });

    // Add yellow card events
    for (let i = 0; i < stats.yellowCards.home; i++) {
      const player =
        this.homeTeam.players[
          Math.floor(Math.random() * this.homeTeam.players.length)
        ];
      events.push({
        minute: Math.floor(Math.random() * this.matchDuration) + 1,
        type: "yellow_card",
        team: "home",
        player: player.name,
        description: `Yellow card for ${player.name}`,
      });
    }

    for (let i = 0; i < stats.yellowCards.away; i++) {
      const player =
        this.awayTeam.players[
          Math.floor(Math.random() * this.awayTeam.players.length)
        ];
      events.push({
        minute: Math.floor(Math.random() * this.matchDuration) + 1,
        type: "yellow_card",
        team: "away",
        player: player.name,
        description: `Yellow card for ${player.name}`,
      });
    }

    // Sort events by minute
    events.sort((a, b) => a.minute - b.minute);

    return events;
  }

  /**
   * Get match summary for AI commentary generation
   */
  public getMatchSummary(result: MatchResult): string {
    const winningTeam =
      result.winner === "home" ? this.homeTeam.name : this.awayTeam.name;
    const losingTeam =
      result.winner === "home" ? this.awayTeam.name : this.homeTeam.name;

    const topScorer =
      result.homeGoalScorers.length > result.awayGoalScorers.length
        ? result.homeGoalScorers[0]?.playerName
        : result.awayGoalScorers[0]?.playerName;

    return `${winningTeam} defeats ${losingTeam} ${result.homeScore}-${result.awayScore}. ${topScorer} opens the scoring. Final possession: ${result.stats.possession.home}% - ${result.stats.possession.away}%.`;
  }
}
