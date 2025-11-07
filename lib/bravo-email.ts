/**
 * Bravo MCP Email Service
 * Handles sending emails via Bravo MCP AI API
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface BravoEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class BravoEmailService {
  private apiKey: string;
  private baseUrl = 'https://api.bravo-ai.com/v1/email'; // Adjust this URL based on Bravo's actual endpoint

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(options: EmailOptions): Promise<BravoEmailResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          to: options.to,
          from: options.from || 'noreply@africonnations.com',
          subject: options.subject,
          html: options.html,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.id || data.messageId,
      };
    } catch (error) {
      console.error('Bravo Email Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async sendMatchNotificationEmail(
    recipientEmail: string,
    teamName: string,
    opponentName: string,
    score: string,
    result: 'won' | 'lost' | 'drew',
    tournamentStage: string,
    matchStats?: {
      possession?: { home: number; away: number };
      shots?: { home: number; away: number };
      fouls?: { home: number; away: number };
      yellowCards?: { home: number; away: number };
      redCards?: { home: number; away: number };
    }
  ): Promise<BravoEmailResponse> {
    const resultEmoji = result === 'won' ? '🎉' : result === 'lost' ? '😔' : '🤝';
    const resultText = result === 'won' ? 'Victory!' : result === 'lost' ? 'Defeat' : 'Draw';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .score-box { background: white; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .score { font-size: 48px; font-weight: bold; color: #667eea; }
          .teams { font-size: 20px; margin: 10px 0; }
          .stats { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .stat-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee; }
          .stat-label { font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${resultEmoji} Match Result - ${resultText}</h1>
          <p>${tournamentStage} • African Nations Cup</p>
        </div>
        <div class="content">
          <p>Dear ${teamName} Federation,</p>
          <p>Your match has concluded with the following result:</p>
          
          <div class="score-box">
            <div class="teams">${teamName} vs ${opponentName}</div>
            <div class="score">${score}</div>
          </div>

          ${matchStats ? `
            <div class="stats">
              <h3>Match Statistics</h3>
              ${matchStats.possession ? `
                <div class="stat-row">
                  <span class="stat-label">Possession</span>
                  <span>${matchStats.possession.home}% - ${matchStats.possession.away}%</span>
                </div>
              ` : ''}
              ${matchStats.shots ? `
                <div class="stat-row">
                  <span class="stat-label">Shots</span>
                  <span>${matchStats.shots.home} - ${matchStats.shots.away}</span>
                </div>
              ` : ''}
              ${matchStats.fouls ? `
                <div class="stat-row">
                  <span class="stat-label">Fouls</span>
                  <span>${matchStats.fouls.home} - ${matchStats.fouls.away}</span>
                </div>
              ` : ''}
              ${matchStats.yellowCards ? `
                <div class="stat-row">
                  <span class="stat-label">Yellow Cards</span>
                  <span>${matchStats.yellowCards.home} - ${matchStats.yellowCards.away}</span>
                </div>
              ` : ''}
              ${matchStats.redCards ? `
                <div class="stat-row">
                  <span class="stat-label">Red Cards</span>
                  <span>${matchStats.redCards.home} - ${matchStats.redCards.away}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <p>Check the tournament dashboard for detailed match commentary and next fixtures.</p>
          
          <div class="footer">
            <p>African Nations Cup Tournament System</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject: `Match Result: ${teamName} vs ${opponentName} - ${score}`,
      html,
    });
  }
}

// Export singleton instance
let bravoEmailService: BravoEmailService | null = null;

export function getBravoEmailService(): BravoEmailService {
  if (!process.env.BRAVO_MCP_API_KEY) {
    throw new Error('BRAVO_MCP_API_KEY is not configured');
  }

  if (!bravoEmailService) {
    bravoEmailService = new BravoEmailService(process.env.BRAVO_MCP_API_KEY);
  }

  return bravoEmailService;
}
