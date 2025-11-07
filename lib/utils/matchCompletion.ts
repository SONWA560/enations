/**
 * Match Completion Helper
 * Integrates AI commentary generation and email notifications
 */

interface MatchResult {
  team1: {
    name: string;
    email?: string;
    score: number;
  };
  team2: {
    name: string;
    email?: string;
    score: number;
  };
  goalScorers: Array<{
    playerName: string;
    team: string;
    minute: number;
  }>;
  matchStats?: {
    possession1: number;
    possession2: number;
    shots1: number;
    shots2: number;
    shotsOnTarget1: number;
    shotsOnTarget2: number;
    fouls1: number;
    fouls2: number;
    yellowCards1?: number;
    yellowCards2?: number;
    redCards1?: number;
    redCards2?: number;
  };
  matchEvents?: Array<{
    minute: number;
    type: string;
    description: string;
  }>;
  matchDate?: string;
  tournamentStage?: string;
}

interface MatchCompletionResult {
  success: boolean;
  commentary?: string;
  emailsSent?: boolean;
  errors?: string[];
}

/**
 * Generate AI commentary for a match
 */
export async function generateMatchCommentary(matchResult: MatchResult): Promise<{
  success: boolean;
  commentary?: string;
  error?: string;
}> {
  try {
    const response = await fetch('/api/generate-commentary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        team1: matchResult.team1.name,
        team2: matchResult.team2.name,
        score1: matchResult.team1.score,
        score2: matchResult.team2.score,
        goalScorers: matchResult.goalScorers,
        matchEvents: matchResult.matchEvents,
        matchStats: matchResult.matchStats,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Commentary generation failed:', error);
      return {
        success: false,
        error: error.error || 'Failed to generate commentary',
        commentary: error.commentary || 'Commentary not available',
      };
    }

    const data = await response.json();
    return {
      success: data.success,
      commentary: data.commentary,
    };
  } catch (error: any) {
    console.error('Error calling commentary API:', error);
    return {
      success: false,
      error: error.message,
      commentary: 'Match commentary could not be generated at this time.',
    };
  }
}

/**
 * Send match result emails to both teams
 */
export async function sendMatchEmails(matchResult: MatchResult): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // TESTING MODE: Override all emails to send to test address
    const TEST_EMAIL = '4340789@myuwc.ac.za';
    
    // Skip if no emails provided
    if (!matchResult.team1.email || !matchResult.team2.email) {
      console.warn('Skipping email notification - team emails not provided');
      return {
        success: false,
        error: 'Team emails not provided',
      };
    }

    const response = await fetch('/api/send-match-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        team1Name: matchResult.team1.name,
        team2Name: matchResult.team2.name,
        team1Email: TEST_EMAIL, // Override for testing
        team2Email: TEST_EMAIL, // Override for testing
        score1: matchResult.team1.score,
        score2: matchResult.team2.score,
        goalScorers: matchResult.goalScorers,
        matchDate: matchResult.matchDate || new Date().toISOString(),
        tournamentStage: matchResult.tournamentStage,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error.error || 'Failed to send emails',
      };
    }

    const data = await response.json();
    return {
      success: data.success,
      message: data.message,
    };
  } catch (error: any) {
    console.error('Error calling email API:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Complete match with AI commentary and email notifications
 * @param matchResult - Match details and results
 * @param options - Control which features to enable
 */
export async function completeMatch(
  matchResult: MatchResult,
  options: {
    generateCommentary?: boolean;
    sendEmails?: boolean;
  } = {}
): Promise<MatchCompletionResult> {
  const {
    generateCommentary: enableCommentary = true,
    sendEmails: enableEmails = true,
  } = options;

  const errors: string[] = [];
  let commentary: string | undefined;
  let emailsSent = false;

  // Generate AI commentary
  if (enableCommentary) {
    const commentaryResult = await generateMatchCommentary(matchResult);
    if (commentaryResult.success && commentaryResult.commentary) {
      commentary = commentaryResult.commentary;
    } else {
      errors.push(commentaryResult.error || 'Failed to generate commentary');
      // Use fallback commentary
      commentary = commentaryResult.commentary || `${matchResult.team1.name} faced ${matchResult.team2.name} in an exciting match that ended ${matchResult.team1.score}-${matchResult.team2.score}.`;
    }
  }

  // Send email notifications
  if (enableEmails) {
    const emailResult = await sendMatchEmails(matchResult);
    if (emailResult.success) {
      emailsSent = true;
    } else {
      errors.push(emailResult.error || 'Failed to send emails');
    }
  }

  return {
    success: errors.length === 0,
    commentary,
    emailsSent,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Simulate match without AI features (faster for testing)
 */
export async function simulateMatchQuick(matchResult: MatchResult): Promise<{
  success: boolean;
  commentary: string;
}> {
  const winner = matchResult.team1.score > matchResult.team2.score 
    ? matchResult.team1.name 
    : matchResult.team2.name;
  
  const fallbackCommentary = `Match Summary: ${matchResult.team1.name} ${matchResult.team1.score} - ${matchResult.team2.score} ${matchResult.team2.name}. Winner: ${winner}. ${matchResult.goalScorers.length} goals scored.`;

  return {
    success: true,
    commentary: fallbackCommentary,
  };
}
