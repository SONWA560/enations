import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      team1Name, 
      team2Name, 
      team1Email, 
      team2Email, 
      score1, 
      score2, 
      goalScorers,
      matchDate,
      tournamentStage 
    } = body;

    // Validate required fields
    if (!team1Email || !team2Email || !team1Name || !team2Name) {
      return NextResponse.json(
        { error: 'Missing required email data' },
        { status: 400 }
      );
    }

    const winner = score1 > score2 ? team1Name : team2Name;
    const finalScore = `${score1}-${score2}`;

    // Build goal scorers list
    let goalScorersHtml = '<ul style="list-style: none; padding: 0;">';
    if (goalScorers && goalScorers.length > 0) {
      goalScorers.forEach((scorer: any) => {
        goalScorersHtml += `
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            ⚽ <strong>${scorer.playerName}</strong> (${scorer.team}) - ${scorer.minute}'
          </li>
        `;
      });
    } else {
      goalScorersHtml += '<li>No goals scored</li>';
    }
    goalScorersHtml += '</ul>';

    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏆 African Nations League</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Match Result Notification</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #667eea; margin-top: 0;">${tournamentStage || 'Match'} Results</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <div style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 10px;">
                ${team1Name} <span style="color: #667eea;">${score1} - ${score2}</span> ${team2Name}
              </div>
              <div style="text-align: center; color: #28a745; font-weight: bold; font-size: 18px;">
                Winner: ${winner} 🎉
              </div>
            </div>

            <h3 style="color: #333; margin-top: 30px;">⚽ Goal Scorers</h3>
            ${goalScorersHtml}

            ${matchDate ? `
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                <strong>Match Date:</strong> ${new Date(matchDate).toLocaleString()}
              </p>
            ` : ''}

            <div style="margin-top: 30px; padding: 20px; background: #f0f7ff; border-left: 4px solid #667eea; border-radius: 4px;">
              <p style="margin: 0; color: #555;">
                Thank you for participating in the African Nations League. Keep up the great work! 🌍⚽
              </p>
            </div>
          </div>

          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; margin-top: -1px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              African Nations League Tournament<br>
              This is an automated notification. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send emails to both teams
    const emailPromises = [
      resend.emails.send({
        from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
        to: team1Email,
        subject: `Match Result: ${team1Name} vs ${team2Name} - ${finalScore}`,
        html: emailHtml,
      }),
      resend.emails.send({
        from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
        to: team2Email,
        subject: `Match Result: ${team1Name} vs ${team2Name} - ${finalScore}`,
        html: emailHtml,
      }),
    ];

    const results = await Promise.allSettled(emailPromises);

    // Check if at least one email was sent successfully
    const successCount = results.filter(r => r.status === 'fulfilled').length;

    if (successCount === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send emails to both teams',
          details: results 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Emails sent successfully to ${successCount} team(s)`,
      sentTo: {
        team1: results[0].status === 'fulfilled',
        team2: results[1].status === 'fulfilled',
      },
    });

  } catch (error: any) {
    console.error('Email API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send match notification emails',
      },
      { status: 500 }
    );
  }
}
