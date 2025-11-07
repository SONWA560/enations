/**
 * Player Data Import Script
 * Imports African countries player dataset into Firestore
 * 
 * Run with: npx tsx scripts/importPlayers.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { parsePlayerFromCSV, AFRICAN_COUNTRIES, PlayerData } from '../lib/utils/playerData';

// Load environment variables from .env file
import { config } from 'dotenv';
config({ path: path.join(process.cwd(), '.env') });

// Firebase config - update with your credentials
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config
const missingVars = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing Firebase configuration variables:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\n💡 Create a .env.local file with your Firebase credentials');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importPlayers() {
  console.log('🚀 Starting player data import...\n');
  
  // Read CSV file
  const csvPath = path.join(process.cwd(), 'african_countries');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  
  console.log(`📄 Found ${lines.length} lines in CSV\n`);
  
  // Parse players
  const allPlayers: PlayerData[] = [];
  let skipped = 0;
  
  for (const line of lines) {
    const player = parsePlayerFromCSV(line);
    if (player) {
      allPlayers.push(player);
    } else {
      skipped++;
    }
  }
  
  console.log(`✅ Parsed ${allPlayers.length} valid players`);
  console.log(`⚠️  Skipped ${skipped} invalid lines\n`);
  
  // Group by country
  const playersByCountry = AFRICAN_COUNTRIES.reduce((acc, country) => {
    acc[country] = allPlayers.filter(p => p.nationality === country);
    return acc;
  }, {} as Record<string, PlayerData[]>);
  
  // Display stats
  console.log('📊 Players per country:');
  AFRICAN_COUNTRIES.forEach(country => {
    const count = playersByCountry[country].length;
    console.log(`   ${country.padEnd(15)} ${count} players`);
  });
  console.log('');
  
  // Import to Firestore in batches
  console.log('💾 Importing to Firestore...\n');
  
  const BATCH_SIZE = 500; // Firestore batch limit
  let totalImported = 0;
  
  for (let i = 0; i < allPlayers.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchPlayers = allPlayers.slice(i, i + BATCH_SIZE);
    
    for (const player of batchPlayers) {
      // Skip players without valid data
      if (!player.csvId || !player.name || !player.nationality) {
        console.warn(`   ⚠️  Skipping invalid player: ${player.name || 'Unknown'}`);
        continue;
      }
      
      // Use auto-generated ID instead of CSV ID to avoid Firestore restrictions
      const playerRef = doc(collection(db, 'players'));
      batch.set(playerRef, {
        csvId: player.csvId, // Store original CSV ID as a field
        name: player.name,
        age: player.age,
        nationality: player.nationality,
        position: player.position, // Natural position (GK, DF, MD, AT)
        height: player.height,
        ratings: player.ratings, // All 4 position ratings
        naturalRating: player.naturalRating, // Overall rating
        available: true, // Not yet assigned to federation
        createdAt: new Date().toISOString(),
      });
    }
    
    await batch.commit();
    totalImported += batchPlayers.length;
    console.log(`   Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batchPlayers.length} players imported`);
  }
  
  console.log(`\n✨ Successfully imported ${totalImported} players to Firestore!`);
  
  // Create country metadata collection
  console.log('\n📝 Creating country metadata...\n');
  
  for (const country of AFRICAN_COUNTRIES) {
    const players = playersByCountry[country];
    const countryRef = doc(db, 'countries', country);
    
    await setDoc(countryRef, {
      name: country,
      totalPlayers: players.length,
      availablePlayers: players.length,
      federationId: null,
      flag: `/flags/${country.toLowerCase().replace(/\s+/g, '-')}.png`,
      updatedAt: new Date().toISOString(),
    });
    
    console.log(`   ${country}: metadata created`);
  }
  
  console.log('\n🎉 Import complete!\n');
}

// Run import
importPlayers()
  .then(() => {
    console.log('✅ Process finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });
