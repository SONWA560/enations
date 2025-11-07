import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { team1, team2, score1, score2, goalScorers, matchEvents, statistics } = body;

    // Validate required fields
    if (!team1 || !team2 || score1 === undefined || score2 === undefined) {
      return NextResponse.json(
        { error: 'Missing required match data' },
        { status: 400 }
      );
    }

    // Build contextual prompt for OpenAI with structured output
    const prompt = buildStructuredPrompt(team1, team2, score1, score2, goalScorers, matchEvents, statistics);

    // Call OpenAI API with JSON mode
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',
      messages: [
        {
          role: 'system',
          content: 'You are an enthusiastic football commentator for the African Nations League. You provide exciting match commentary celebrating African football culture. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 800,
      temperature: 0.8,
    });

    const commentaryText = completion.choices[0]?.message?.content || '{}';
    
    // Parse the JSON response
    let commentary;
    try {
      commentary = JSON.parse(commentaryText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError);
      // Return fallback structured response
      commentary = generateFallbackCommentary(team1, team2, score1, score2, goalScorers);
    }

    return NextResponse.json({
      success: true,
      commentary,
    });

  } catch (error: any) {
    console.error('OpenAI API Error:', error);

    // Return graceful error with fallback commentary
    const fallback = generateFallbackCommentary(
      'Team A',
      'Team B',
      0,
      0,
      []
    );

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate commentary',
        commentary: fallback,
      },
      { status: 500 }
    );
  }
}

function buildStructuredPrompt(
  team1: string,
  team2: string,
  score1: number,
  score2: number,
  goalScorers: any[] = [],
  matchEvents: any[] = [],
  statistics: any = {}
): string {
  const winner = score1 > score2 ? team1 : score2 > score1 ? team2 : 'Draw';
  const finalScore = `${score1}-${score2}`;

  let prompt = `Generate exciting football match commentary for this African Nations League match.\n\n`;
  prompt += `MATCH DETAILS:\n`;
  prompt += `${team1} ${score1} - ${score2} ${team2}\n`;
  prompt += `Result: ${winner === 'Draw' ? 'Draw' : `${winner} wins!`}\n\n`;

  // Add statistics
  if (statistics && Object.keys(statistics).length > 0) {
    prompt += `MATCH STATISTICS:\n`;
    prompt += `Possession: ${team1} ${statistics.possession?.home || 50}% - ${statistics.possession?.away || 50}% ${team2}\n`;
    prompt += `Shots: ${team1} ${statistics.shots?.home || 0} - ${statistics.shots?.away || 0} ${team2}\n`;
    prompt += `Shots on Target: ${team1} ${statistics.shotsOnTarget?.home || 0} - ${statistics.shotsOnTarget?.away || 0} ${team2}\n`;
    prompt += `Fouls: ${team1} ${statistics.fouls?.home || 0} - ${statistics.fouls?.away || 0} ${team2}\n`;
    prompt += `Corners: ${team1} ${statistics.corners?.home || 0} - ${statistics.corners?.away || 0} ${team2}\n`;
    if (statistics.yellowCards) {
      prompt += `Yellow Cards: ${team1} ${statistics.yellowCards.home || 0} - ${statistics.yellowCards.away || 0} ${team2}\n`;
    }
    if (statistics.redCards) {
      prompt += `Red Cards: ${team1} ${statistics.redCards.home || 0} - ${statistics.redCards.away || 0} ${team2}\n`;
    }
    prompt += '\n';
  }

  // Add goal scorers
  if (goalScorers && goalScorers.length > 0) {
    prompt += `GOAL SCORERS:\n`;
    goalScorers.forEach((scorer) => {
      prompt += `- ${scorer.playerName} (${scorer.team}) - ${scorer.minute}'\n`;
    });
    prompt += '\n';
  }

  // Add key events
  if (matchEvents && matchEvents.length > 0) {
    prompt += `KEY EVENTS:\n`;
    matchEvents.slice(0, 6).forEach((event) => {
      prompt += `- ${event.minute}' - ${event.type}: ${event.description}\n`;
    });
    prompt += '\n';
  }

  prompt += `Respond ONLY with valid JSON in this exact format:\n`;
  prompt += `{\n`;
  prompt += `  "summary": "2-3 exciting sentences about the match outcome and overall performance",\n`;
  prompt += `  "keyMoments": [\n`;
  prompt += `    { "minute": "15", "description": "Exciting description of this moment" },\n`;
  prompt += `    { "minute": "42", "description": "Another key moment" }\n`;
  prompt += `  ],\n`;
  prompt += `  "playerOfMatch": {\n`;
  prompt += `    "name": "Player Name",\n`;
  prompt += `    "team": "${team1} or ${team2}",\n`;
  prompt += `    "reason": "Brief explanation why they were chosen"\n`;
  prompt += `  },\n`;
  prompt += `  "analysis": "2-3 sentences analyzing tactical performance and key factors"\n`;
  prompt += `}\n\n`;
  prompt += `Make it exciting and celebrate African football talent!`;

  return prompt;
}

function generateFallbackCommentary(
  team1: string,
  team2: string,
  score1: number,
  score2: number,
  goalScorers: any[] = []
) {
  const winner = score1 > score2 ? team1 : score2 > score1 ? team2 : null;
  
  return {
    summary: winner 
      ? `${winner} secured a ${score1 > score2 ? score1 - score2 : score2 - score1}-goal victory over ${winner === team1 ? team2 : team1} in an exciting African Nations League encounter. The final score was ${team1} ${score1}-${score2} ${team2}.`
      : `An evenly matched contest between ${team1} and ${team2} ended in a ${score1}-${score1} draw.`,
    keyMoments: goalScorers.slice(0, 4).map(scorer => ({
      minute: scorer.minute || '0',
      description: `${scorer.playerName} finds the back of the net for ${scorer.team}!`
    })),
    playerOfMatch: goalScorers[0] ? {
      name: goalScorers[0].playerName,
      team: goalScorers[0].team,
      reason: 'Outstanding performance with crucial goal contribution'
    } : {
      name: 'Match Hero',
      team: winner || team1,
      reason: 'Solid defensive display throughout the match'
    },
    analysis: 'Both teams showed great determination and skill in this African Nations League fixture, displaying the quality of football across the continent.'
  };
}
