/**
 * TournamentManager Class
 * Manages tournament bracket creation, match progression, and winner advancement
 */

interface Team {
  id: string;
  name: string;
  country: string;
  teamRating: number;
}

interface BracketMatch {
  id: string;
  round: "QF" | "SF" | "F"; // Quarter-Final, Semi-Final, Final
  matchNumber: number;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore?: number;
  awayScore?: number;
  winner?: Team;
  completed: boolean;
  nextMatchId?: string; // ID of the match the winner advances to
  goalScorers?: Array<{
    playerName: string;
    team: string;
    minute: number;
  }>;
}

interface TournamentBracket {
  quarterFinals: BracketMatch[];
  semiFinals: BracketMatch[];
  final: BracketMatch;
  champion?: Team;
}

export class TournamentManager {
  private teams: Team[];
  private bracket: TournamentBracket | null = null;

  constructor(teams: Team[]) {
    if (teams.length !== 8) {
      throw new Error("Tournament requires exactly 8 teams");
    }
    this.teams = teams;
  }

  /**
   * Initialize tournament by shuffling teams and creating bracket structure
   */
  public startTournament(): TournamentBracket {
    // Shuffle teams for random bracket placement
    const shuffledTeams = this.shuffleTeams([...this.teams]);

    // Create quarter-final matches (QF1, QF2, QF3, QF4)
    const quarterFinals: BracketMatch[] = [
      {
        id: "QF1",
        round: "QF",
        matchNumber: 1,
        homeTeam: shuffledTeams[0],
        awayTeam: shuffledTeams[1],
        completed: false,
        nextMatchId: "SF1",
      },
      {
        id: "QF2",
        round: "QF",
        matchNumber: 2,
        homeTeam: shuffledTeams[2],
        awayTeam: shuffledTeams[3],
        completed: false,
        nextMatchId: "SF1",
      },
      {
        id: "QF3",
        round: "QF",
        matchNumber: 3,
        homeTeam: shuffledTeams[4],
        awayTeam: shuffledTeams[5],
        completed: false,
        nextMatchId: "SF2",
      },
      {
        id: "QF4",
        round: "QF",
        matchNumber: 4,
        homeTeam: shuffledTeams[6],
        awayTeam: shuffledTeams[7],
        completed: false,
        nextMatchId: "SF2",
      },
    ];

    // Create semi-final matches (SF1, SF2)
    const semiFinals: BracketMatch[] = [
      {
        id: "SF1",
        round: "SF",
        matchNumber: 1,
        homeTeam: null, // Will be filled by QF1 winner
        awayTeam: null, // Will be filled by QF2 winner
        completed: false,
        nextMatchId: "F",
      },
      {
        id: "SF2",
        round: "SF",
        matchNumber: 2,
        homeTeam: null, // Will be filled by QF3 winner
        awayTeam: null, // Will be filled by QF4 winner
        completed: false,
        nextMatchId: "F",
      },
    ];

    // Create final match
    const final: BracketMatch = {
      id: "F",
      round: "F",
      matchNumber: 1,
      homeTeam: null, // Will be filled by SF1 winner
      awayTeam: null, // Will be filled by SF2 winner
      completed: false,
    };

    this.bracket = {
      quarterFinals,
      semiFinals,
      final,
    };

    return this.bracket;
  }

  /**
   * Advance winner to next round after a match is completed
   */
  public advanceWinner(
    matchId: string,
    homeScore: number,
    awayScore: number,
    goalScorers?: Array<{ playerName: string; team: string; minute: number }>
  ): TournamentBracket {
    if (!this.bracket) {
      throw new Error("Tournament not started. Call startTournament() first.");
    }

    // Find the match
    const match = this.findMatch(matchId);
    if (!match) {
      throw new Error(`Match ${matchId} not found`);
    }

    if (match.completed) {
      throw new Error(`Match ${matchId} is already completed`);
    }

    if (!match.homeTeam || !match.awayTeam) {
      throw new Error(`Match ${matchId} does not have both teams assigned`);
    }

    if (homeScore === awayScore) {
      throw new Error("Draws are not allowed. Use MatchEngine which guarantees a winner.");
    }

    // Update match result
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.winner = homeScore > awayScore ? match.homeTeam : match.awayTeam;
    match.goalScorers = goalScorers || [];
    match.completed = true;

    // Advance winner to next round
    if (match.nextMatchId) {
      const nextMatch = this.findMatch(match.nextMatchId);
      if (nextMatch) {
        // Determine which position in the next match (home or away)
        if (match.round === "QF") {
          // QF1 winner → SF1 home, QF2 winner → SF1 away
          // QF3 winner → SF2 home, QF4 winner → SF2 away
          if (matchId === "QF1" || matchId === "QF3") {
            nextMatch.homeTeam = match.winner;
          } else {
            nextMatch.awayTeam = match.winner;
          }
        } else if (match.round === "SF") {
          // SF1 winner → Final home, SF2 winner → Final away
          if (matchId === "SF1") {
            nextMatch.homeTeam = match.winner;
          } else {
            nextMatch.awayTeam = match.winner;
          }
        }
      }
    }

    // Check if tournament is complete (final is played)
    if (match.round === "F") {
      this.bracket.champion = match.winner;
    }

    return this.bracket;
  }

  /**
   * Get current tournament bracket
   */
  public getBracket(): TournamentBracket {
    if (!this.bracket) {
      throw new Error("Tournament not started. Call startTournament() first.");
    }
    return this.bracket;
  }

  /**
   * Get next match to be played
   */
  public getNextMatch(): BracketMatch | null {
    if (!this.bracket) {
      return null;
    }

    // Check quarter-finals first
    const nextQF = this.bracket.quarterFinals.find((m) => !m.completed);
    if (nextQF) {
      return nextQF;
    }

    // Then check semi-finals
    const nextSF = this.bracket.semiFinals.find(
      (m) => !m.completed && m.homeTeam && m.awayTeam
    );
    if (nextSF) {
      return nextSF;
    }

    // Finally check final
    if (
      !this.bracket.final.completed &&
      this.bracket.final.homeTeam &&
      this.bracket.final.awayTeam
    ) {
      return this.bracket.final;
    }

    return null; // Tournament complete
  }

  /**
   * Check if tournament is complete
   */
  public isTournamentComplete(): boolean {
    return this.bracket !== null && this.bracket.final.completed;
  }

  /**
   * Get tournament champion
   */
  public getChampion(): Team | null {
    return this.bracket?.champion || null;
  }

  /**
   * Get all completed matches
   */
  public getCompletedMatches(): BracketMatch[] {
    if (!this.bracket) {
      return [];
    }

    return [
      ...this.bracket.quarterFinals,
      ...this.bracket.semiFinals,
      this.bracket.final,
    ].filter((m) => m.completed);
  }

  /**
   * Get matches by round
   */
  public getMatchesByRound(round: "QF" | "SF" | "F"): BracketMatch[] {
    if (!this.bracket) {
      return [];
    }

    switch (round) {
      case "QF":
        return this.bracket.quarterFinals;
      case "SF":
        return this.bracket.semiFinals;
      case "F":
        return [this.bracket.final];
      default:
        return [];
    }
  }

  /**
   * Reset tournament (for testing or restart)
   */
  public resetTournament(): void {
    this.bracket = null;
  }

  /**
   * Shuffle teams using Fisher-Yates algorithm
   */
  private shuffleTeams(teams: Team[]): Team[] {
    const shuffled = [...teams];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Find a match by ID
   */
  private findMatch(matchId: string): BracketMatch | null {
    if (!this.bracket) {
      return null;
    }

    // Check quarter-finals
    const qfMatch = this.bracket.quarterFinals.find((m) => m.id === matchId);
    if (qfMatch) return qfMatch;

    // Check semi-finals
    const sfMatch = this.bracket.semiFinals.find((m) => m.id === matchId);
    if (sfMatch) return sfMatch;

    // Check final
    if (this.bracket.final.id === matchId) return this.bracket.final;

    return null;
  }

  /**
   * Get tournament progress summary
   */
  public getTournamentProgress(): {
    totalMatches: number;
    completedMatches: number;
    remainingMatches: number;
    currentRound: "QF" | "SF" | "F" | "Complete";
  } {
    if (!this.bracket) {
      return {
        totalMatches: 7,
        completedMatches: 0,
        remainingMatches: 7,
        currentRound: "QF",
      };
    }

    const completed = this.getCompletedMatches().length;
    const total = 7; // 4 QF + 2 SF + 1 F

    let currentRound: "QF" | "SF" | "F" | "Complete" = "QF";
    if (this.bracket.final.completed) {
      currentRound = "Complete";
    } else if (this.bracket.semiFinals.every((m) => m.completed)) {
      currentRound = "F";
    } else if (this.bracket.quarterFinals.every((m) => m.completed)) {
      currentRound = "SF";
    }

    return {
      totalMatches: total,
      completedMatches: completed,
      remainingMatches: total - completed,
      currentRound,
    };
  }
}
