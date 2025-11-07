"use client";

// import { LiveMatchCard } from "@/components/live-match-card";
import { Button } from "@/components/ui/button";

export default function LiveMatchDemoPage() {

  // Example match data
  const matchData = {
    homeTeam: {
      name: "Nigeria",
      shortName: "NGA",
      logo: "/placeholder.svg",
      score: 2,
      formation: "4-3-3",
    },
    awayTeam: {
      name: "South Africa",
      shortName: "RSA",
      logo: "/placeholder.svg",
      score: 1,
      formation: "4-4-2",
    },
    homeLineup: [
      // Goalkeeper
      { id: "h1", name: "Uzoho", number: 1, position: { x: 50, y: 5 } },
      // Defenders
      { id: "h2", name: "Aina", number: 2, position: { x: 20, y: 20 } },
      { id: "h3", name: "Ajayi", number: 5, position: { x: 40, y: 20 } },
      { id: "h4", name: "Troost", number: 6, position: { x: 60, y: 20 } },
      { id: "h5", name: "Bassey", number: 21, position: { x: 80, y: 20 } },
      // Midfielders
      { id: "h6", name: "Onyeka", number: 8, position: { x: 35, y: 45 } },
      { id: "h7", name: "Ndidi", number: 4, position: { x: 50, y: 40 } },
      { id: "h8", name: "Aribo", number: 10, position: { x: 65, y: 45 } },
      // Forwards
      { id: "h9", name: "Simon", number: 15, position: { x: 25, y: 70 }, hasGoal: true },
      { id: "h10", name: "Osimhen", number: 9, position: { x: 50, y: 75 }, hasGoal: true },
      { id: "h11", name: "Lookman", number: 14, position: { x: 75, y: 70 } },
    ],
    awayLineup: [
      // Goalkeeper
      { id: "a1", name: "Williams", number: 1, position: { x: 50, y: 95 } },
      // Defenders
      { id: "a2", name: "Mudau", number: 20, position: { x: 20, y: 80 } },
      { id: "a3", name: "Mvala", number: 14, position: { x: 40, y: 80 } },
      { id: "a4", name: "Xulu", number: 3, position: { x: 60, y: 80 } },
      { id: "a5", name: "Modiba", number: 6, position: { x: 80, y: 80 } },
      // Midfielders
      { id: "a6", name: "Mokoena", number: 4, position: { x: 30, y: 60 } },
      { id: "a7", name: "Sithole", number: 13, position: { x: 50, y: 55 } },
      { id: "a8", name: "Zwane", number: 11, position: { x: 70, y: 60 } },
      { id: "a9", name: "Tau", number: 10, position: { x: 50, y: 40 }, hasCard: "yellow" as const },
      // Forwards
      { id: "a10", name: "Makgopa", number: 9, position: { x: 35, y: 25 }, hasGoal: true },
      { id: "a11", name: "Hlongwane", number: 17, position: { x: 65, y: 25 } },
    ],
    stats: [
      { label: "Ball Possession", homeValue: 58, awayValue: 42 },
      { label: "Total Shots", homeValue: 12, awayValue: 8 },
      { label: "Shots on Target", homeValue: 6, awayValue: 3 },
      { label: "Corners", homeValue: 7, awayValue: 4 },
      { label: "Fouls", homeValue: 9, awayValue: 12 },
      { label: "Offsides", homeValue: 2, awayValue: 5 },
    ],
    goals: [
      { time: 23, player: "Victor Osimhen", team: "home" as const },
      { time: 41, player: "Thapelo Makgopa", team: "away" as const },
      { time: 67, player: "Moses Simon", team: "home" as const },
    ],
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Live Match Card Demo</h1>
        <p className="mb-8 text-muted-foreground">
          This demo page is currently disabled. The LiveMatchCard component needs to be implemented.
        </p>
        
        {/* <LiveMatchCard
          homeTeam={matchData.homeTeam}
          awayTeam={matchData.awayTeam}
          homeLineup={matchData.homeLineup}
          awayLineup={matchData.awayLineup}
          stats={matchData.stats}
          goals={matchData.goals}
          matchDuration={90}
          isPlaying={true}
          aiCommentary="What an incredible match! Nigeria takes the lead with a stunning header from Osimhen in the 23rd minute. South Africa fights back with Makgopa's equalizer just before halftime. The Super Eagles show their class in the second half as Moses Simon scores a brilliant solo goal to seal the victory for Nigeria!"
          triggerButton={
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Play Match
            </Button>
          }
        /> */}
        
        <Button size="lg" disabled className="bg-muted">
          Demo Not Available
        </Button>
      </div>
    </div>
  );
}
