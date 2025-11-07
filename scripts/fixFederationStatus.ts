import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Firebase (use your config)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('Firebase Config:', {
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixFederationStatus() {
  console.log('🔧 Fixing federation active status based on squad completion...\n');

  try {
    // Get all federations
    const federationsRef = collection(db, 'federations');
    const federationsSnapshot = await getDocs(federationsRef);

    let fixed = 0;
    let skipped = 0;

    for (const federationDoc of federationsSnapshot.docs) {
      const federationId = federationDoc.id;
      const federationData = federationDoc.data();

      console.log(`Checking: ${federationData.country}`);

      // Check if federation has players in subcollection
      const playersRef = collection(db, `federations/${federationId}/players`);
      const playersSnapshot = await getDocs(playersRef);
      const playerCount = playersSnapshot.size;

      console.log(`  - Players: ${playerCount}`);
      console.log(`  - Team Rating: ${federationData.teamRating}`);
      console.log(`  - Current Status: ${federationData.isActive ? 'Active' : 'Inactive'}`);

      // Determine if should be active (has 23 players and rating > 0)
      const shouldBeActive = playerCount >= 23 && federationData.teamRating > 0;

      // Update if status is incorrect
      if (federationData.isActive !== shouldBeActive) {
        await updateDoc(doc(db, 'federations', federationId), {
          isActive: shouldBeActive,
          hasSquad: shouldBeActive,
          updatedAt: new Date().toISOString()
        });
        console.log(`  ✅ FIXED: Set to ${shouldBeActive ? 'Active' : 'Inactive'}\n`);
        fixed++;
      } else {
        console.log(`  ✓ Already correct\n`);
        skipped++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  - Fixed: ${fixed} federations`);
    console.log(`  - Already correct: ${skipped} federations`);
    console.log(`  - Total: ${federationsSnapshot.size} federations`);
    console.log('\n✅ Done!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

fixFederationStatus();
