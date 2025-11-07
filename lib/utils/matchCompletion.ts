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
  commentary?: any; // Changed to any to support structured response
  error?: string;
}> {
  try {
    // Transform matchStats to statistics format expected by API
    const statistics = matchResult.matchStats ? {
      possession: {
        home: matchResult.matchStats.possession1 || 50,
        away: matchResult.matchStats.possession2 || 50,
      },
      shots: {
        home: matchResult.matchStats.shots1 || 0,
        away: matchResult.matchStats.shots2 || 0,
      },
      shotsOnTarget: {
        home: matchResult.matchStats.shotsOnTarget1 || 0,
        away: matchResult.matchStats.shotsOnTarget2 || 0,
      },
      fouls: {
        home: matchResult.matchStats.fouls1 || 0,
        away: matchResult.matchStats.fouls2 || 0,
      },
      corners: {
        home: Math.floor((matchResult.matchStats.shots1 || 0) * 0.3),
        away: Math.floor((matchResult.matchStats.shots2 || 0) * 0.3),
      },
      yellowCards: {
        home: matchResult.matchStats.yellowCards1 || 0,
        away: matchResult.matchStats.yellowCards2 || 0,
      },
      redCards: {
        home: matchResult.matchStats.redCards1 || 0,
        away: matchResult.matchStats.redCards2 || 0,
      },
    } : undefined;

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
        statistics, // Pass transformed statistics
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
      commentary: data.commentary, // Now returns structured object
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
    console.log('🔍 Email sending check:', {
      team1: {
        name: matchResult.team1.name,
        email: matchResult.team1.email,
        hasEmail: !!matchResult.team1.email
      },
      team2: {
        name: matchResult.team2.name,
        email: matchResult.team2.email,
        hasEmail: !!matchResult.team2.email
      }
    });
    
    // Skip if no emails provided
    if (!matchResult.team1.email || !matchResult.team2.email) {
      console.warn('⚠️ Skipping email notification - team emails not provided');
      console.warn('Team 1 email:', matchResult.team1.email);
      console.warn('Team 2 email:', matchResult.team2.email);
      return {
        success: false,
        error: 'Team emails not provided',
      };
    }

    console.log('✅ Emails found! Proceeding to send emails...');

    const response = await fetch('/api/send-match-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        team1Name: matchResult.team1.name,
        team2Name: matchResult.team2.name,
        team1Email: matchResult.team1.email,
        team2Email: matchResult.team2.email,
        score1: matchResult.team1.score,
        score2: matchResult.team2.score,
        goalScorers: matchResult.goalScorers,
        matchDate: matchResult.matchDate || new Date().toISOString(),
        tournamentStage: matchResult.tournamentStage,
        matchStats: matchResult.matchStats,
      }),
    });

    console.log('📡 Email API response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to send emails';
      try {
        const error = await response.json();
        console.error('Email sending failed:', error);
        errorMessage = error.error || error.message || errorMessage;
      } catch (e) {
        console.error('Could not parse error response:', await response.text());
      }
      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();
    console.log('📧 Email API success response:', data);
    return {
      success: data.success || true,
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
 * Now includes email notifications
 */
export async function simulateMatchQuick(matchResult: MatchResult): Promise<{
  success: boolean;
  commentary: string;
  emailsSent?: boolean;
}> {
  const winner = matchResult.team1.score > matchResult.team2.score 
    ? matchResult.team1.name 
    : matchResult.team2.name;
  
  const fallbackCommentary = `Match Summary: ${matchResult.team1.name} ${matchResult.team1.score} - ${matchResult.team2.score} ${matchResult.team2.name}. Winner: ${winner}. ${matchResult.goalScorers.length} goals scored.`;

  // Send emails even for quick simulation
  let emailsSent = false;
  try {
    const emailResult = await sendMatchEmails(matchResult);
    emailsSent = emailResult.success;
    if (!emailResult.success) {
      console.error('Email sending failed in quick simulation:', emailResult.error);
    }
  } catch (error) {
    console.error('Error sending emails in quick simulation:', error);
  }

  return {
    success: true,
    commentary: fallbackCommentary,
    emailsSent,
  };
}
