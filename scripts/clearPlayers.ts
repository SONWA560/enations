/**
 * Clear Players Script
 * Deletes all player documents from Firestore to prepare for fresh import
 * 
 * Run with: npx tsx scripts/clearPlayers.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch } from 'firebase/firestore';
import * as path from 'path';

// Load environment variables from .env file
import { config } from 'dotenv';
config({ path: path.join(process.cwd(), '.env') });

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearPlayers() {
  console.log('🗑️  Starting to clear players collection...\n');

  try {
    const playersRef = collection(db, 'players');
    const snapshot = await getDocs(playersRef);

    if (snapshot.empty) {
      console.log('✅ Players collection is already empty.');
      return;
    }

    console.log(`Found ${snapshot.size} players to delete...`);

    // Delete in batches of 500 (Firestore batch limit)
    const batchSize = 500;
    let deletedCount = 0;
    const docs = snapshot.docs;

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchDocs = docs.slice(i, i + batchSize);

      batchDocs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
      });

      await batch.commit();
      deletedCount += batchDocs.length;
      console.log(`Deleted ${deletedCount}/${docs.length} players...`);

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Successfully deleted ${deletedCount} players from Firestore.`);
    console.log('Ready for fresh import with new rating structure!');

  } catch (error) {
    console.error('❌ Error clearing players:', error);
    process.exit(1);
  }
}

// Run the script
clearPlayers()
  .then(() => {
    console.log('\n🎉 Clear operation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
