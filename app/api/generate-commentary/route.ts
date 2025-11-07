import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Lazy initialization of OpenAI client to avoid build-time errors
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { team1, team2, score1, score2, goalScorers, matchEvents } = body;

    // Validate required fields
    if (!team1 || !team2 || score1 === undefined || score2 === undefined) {
      return NextResponse.json(
        { error: 'Missing required match data' },
        { status: 400 }
      );
    }

    // Build contextual prompt for OpenAI
    const prompt = buildCommentaryPrompt(team1, team2, score1, score2, goalScorers, matchEvents);

    // Initialize OpenAI client only when needed
    const openai = getOpenAIClient();

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an enthusiastic football commentator providing exciting match commentary for the African Nations League tournament. Your commentary should be engaging, descriptive, and celebrate African football culture.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const commentary = completion.choices[0]?.message?.content || 'Commentary not available';

    return NextResponse.json({
      success: true,
      commentary,
    });

  } catch (error: any) {
    console.error('OpenAI API Error:', error);

    // Return graceful error response
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate commentary',
        commentary: 'Match commentary could not be generated at this time. Please check the match results above.',
      },
      { status: 500 }
    );
  }
}

function buildCommentaryPrompt(
  team1: string,
  team2: string,
  score1: number,
  score2: number,
  goalScorers: any[] = [],
  matchEvents: any[] = []
): string {
  const winner = score1 > score2 ? team1 : team2;
  const finalScore = `${score1}-${score2}`;

  let prompt = `Generate exciting football match commentary for an African Nations League match between ${team1} and ${team2}.\n\n`;
  prompt += `FINAL SCORE: ${team1} ${score1} - ${score2} ${team2}\n`;
  prompt += `WINNER: ${winner}\n\n`;

  // Add goal scorers information
  if (goalScorers && goalScorers.length > 0) {
    prompt += `GOAL SCORERS:\n`;
    goalScorers.forEach((scorer) => {
      prompt += `- ${scorer.playerName} (${scorer.team}) at ${scorer.minute}'\n`;
    });
    prompt += '\n';
  }

  // Add match events if available
  if (matchEvents && matchEvents.length > 0) {
    prompt += `KEY MATCH EVENTS:\n`;
    matchEvents.slice(0, 8).forEach((event) => {
      prompt += `- ${event.minute}' - ${event.type}: ${event.description}\n`;
    });
    prompt += '\n';
  }

  prompt += `Please provide:\n`;
  prompt += `1. A dramatic opening paragraph setting the scene\n`;
  prompt += `2. Key moments from the match including goals scored\n`;
  prompt += `3. Analysis of team performances\n`;
  prompt += `4. A concluding paragraph celebrating the winner and the spirit of African football\n\n`;
  prompt += `Keep the commentary between 300-400 words. Make it exciting and celebratory of African football talent.`;

  return prompt;
}
