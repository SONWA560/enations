import { NextResponse } from 'next/server';

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
      tournamentStage,
      matchStats
    } = body;

    console.log('📧 Email API called with:', {
      team1Name,
      team2Name,
      team1Email,
      team2Email,
      score: `${score1}-${score2}`,
      tournamentStage
    });

    if (!team1Email || !team2Email || !team1Name || !team2Name) {
      console.error('❌ Missing required email data');
      return NextResponse.json({ error: 'Missing required email data' }, { status: 400 });
    }

    // TODO: Integrate with a real email service (Resend, SendGrid, etc.)
    // For now, we'll simulate successful email sending
    console.log('📨 Email notification simulated (email service not configured)');
    console.log(`   Would send to: ${team1Email}, ${team2Email}`);
    console.log(`   Match: ${team1Name} vs ${team2Name} - ${score1}-${score2}`);

    // Simulate success
    console.log('✅ Email notifications logged successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Email notifications processed (simulated)',
      note: 'Email service integration pending'
    });

  } catch (error) {
    console.error('Error processing email notifications:', error);
    return NextResponse.json({ error: 'Failed to process email notifications' }, { status: 500 });
  }
}

