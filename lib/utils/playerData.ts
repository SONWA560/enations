/**
 * Player Data Utilities
 * Processes and provides access to the African countries player dataset
 */

export interface PlayerRatings {
  GK: number;
  DF: number;
  MD: number;
  AT: number;
}

export interface PlayerData {
  id?: string; // Optional - Firestore will auto-generate
  csvId?: string; // Original ID from CSV
  name: string;
  age: number;
  nationality: string;
  position: string; // Natural position (GK, DF, MD, AT)
  height: string;
  ratings: PlayerRatings; // All 4 position ratings
  naturalRating: number; // Overall rating = rating for natural position
}

export const AFRICAN_COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Senegal",
  "Ivory Coast",
  "Cameroon",
  "Mali",
  "Morocco",
  "DR Congo"
] as const;

export type AfricanCountry = typeof AFRICAN_COUNTRIES[number];

// Position mappings for consistency
export const POSITION_MAP: Record<string, string> = {
  // Goalkeepers
  'GK': 'GK',
  
  // Defenders
  'CB': 'DF',
  'LCB': 'DF',
  'RCB': 'DF',
  'LB': 'DF',
  'RB': 'DF',
  'LWB': 'DF',
  'RWB': 'DF',
  
  // Midfielders
  'CDM': 'MD',
  'CM': 'MD',
  'LCM': 'MD',
  'RCM': 'MD',
  'LDM': 'MD',
  'RDM': 'MD',
  'CAM': 'MD',
  'LAM': 'MD',
  'RAM': 'MD',
  'LM': 'MD',
  'RM': 'MD',
  
  // Forwards
  'LW': 'AT',
  'RW': 'AT',
  'ST': 'AT',
  'CF': 'AT',
  'LS': 'AT',
  'RS': 'AT',
};

/**
 * Generate player ratings according to UCT specifications:
 * - Natural position rating: 50-100
 * - Other 3 position ratings: 0-50
 * 
 * @param naturalPosition - The player's natural position (GK, DF, MD, AT)
 * @returns PlayerRatings object with all 4 ratings
 */
export function generatePlayerRatings(naturalPosition: 'GK' | 'DF' | 'MD' | 'AT'): PlayerRatings {
  const ratings: PlayerRatings = {
    GK: 0,
    DF: 0,
    MD: 0,
    AT: 0,
  };
  
  // Generate ratings for all positions
  const positions: Array<'GK' | 'DF' | 'MD' | 'AT'> = ['GK', 'DF', 'MD', 'AT'];
  
  positions.forEach(pos => {
    if (pos === naturalPosition) {
      // Natural position: 50-100 inclusively
      ratings[pos] = 50 + Math.floor(Math.random() * 51); // 50-100
    } else {
      // Other positions: 0-50 inclusively
      ratings[pos] = Math.floor(Math.random() * 51); // 0-50
    }
  });
  
  return ratings;
}

/**
 * Get player's overall rating (rating for their natural position)
 * 
 * @param player - Player data
 * @returns Overall rating (0-100)
 */
export function getPlayerOverallRating(player: PlayerData): number {
  const naturalPos = normalizePosition(player.position);
  return player.ratings[naturalPos];
}

/**
 * Calculate team overall rating (average of all 23 players' overall ratings)
 * 
 * @param squad - Array of 23 players
 * @returns Team rating (0-100)
 */
export function calculateTeamRating(squad: PlayerData[]): number {
  if (squad.length === 0) return 0;
  
  const totalRating = squad.reduce((sum, player) => {
    return sum + getPlayerOverallRating(player);
  }, 0);
  
  // Return average of all players' ratings for their natural positions
  return Math.round(totalRating / squad.length);
}

/**
 * Normalize position to generalized format (GK, DF, MD, AT)
 */
export function normalizePosition(position: string): 'GK' | 'DF' | 'MD' | 'AT' {
  const normalized = POSITION_MAP[position];
  if (!normalized) {
    console.warn(`Unknown position: ${position}, defaulting to MD`);
    return 'MD';
  }
  return normalized as 'GK' | 'DF' | 'MD' | 'AT';
}

/**
 * Get players by country
 */
export function getPlayersByCountry(players: PlayerData[], country: string): PlayerData[] {
  return players.filter(p => p.nationality === country);
}

/**
 * Get players by position
 */
export function getPlayersByPosition(players: PlayerData[], position: string): PlayerData[] {
  const normalizedPos = normalizePosition(position);
  return players.filter(p => normalizePosition(p.position) === normalizedPos);
}

/**
 * Select best squad of 23 players for a country
 * Formation: 3 GK, 8 DF, 8 MD, 4 AT
 */
export function selectBestSquad(players: PlayerData[]): PlayerData[] {
  const gks = players.filter(p => normalizePosition(p.position) === 'GK')
    .sort((a, b) => getPlayerOverallRating(b) - getPlayerOverallRating(a))
    .slice(0, 3);
    
  const dfs = players.filter(p => normalizePosition(p.position) === 'DF')
    .sort((a, b) => getPlayerOverallRating(b) - getPlayerOverallRating(a))
    .slice(0, 8);
    
  const mds = players.filter(p => normalizePosition(p.position) === 'MD')
    .sort((a, b) => getPlayerOverallRating(b) - getPlayerOverallRating(a))
    .slice(0, 8);
    
  const ats = players.filter(p => normalizePosition(p.position) === 'AT')
    .sort((a, b) => getPlayerOverallRating(b) - getPlayerOverallRating(a))
    .slice(0, 4);
  
  return [...gks, ...dfs, ...mds, ...ats];
}

/**
 * Parse CSV line into PlayerData
 */
export function parsePlayerFromCSV(line: string): PlayerData | null {
  const parts = line.split(',');
  if (parts.length < 8 || parts[3] === 'Name') return null; // Skip header
  
  const [, , id, name, age, nationality, position, height] = parts;
  
  if (!name || !nationality || !position) return null;
  
  const playerAge = parseInt(age);
  const naturalPosition = normalizePosition(position);
  const ratings = generatePlayerRatings(naturalPosition);
  const naturalRating = ratings[naturalPosition];
  
  return {
    csvId: id, // Store original CSV ID
    name,
    age: playerAge,
    nationality,
    position: naturalPosition, // Store normalized position
    height,
    ratings,
    naturalRating,
  };
}

/**
 * Get top-rated captain candidate from squad
 */
export function selectCaptain(squad: PlayerData[]): PlayerData | null {
  // Prefer outfield players with high ratings and 25+ age
  const candidates = squad
    .filter(p => normalizePosition(p.position) !== 'GK')
    .sort((a, b) => {
      // Prioritize: overall rating, then age (25-30 ideal)
      const ratingDiff = getPlayerOverallRating(b) - getPlayerOverallRating(a);
      if (ratingDiff !== 0) return ratingDiff;
      
      const aAgeScore = Math.abs(a.age - 27); // 27 is ideal captain age
      const bAgeScore = Math.abs(b.age - 27);
      return aAgeScore - bAgeScore;
    });
  
  return candidates[0] || squad[0] || null;
}
