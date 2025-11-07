import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// User Operations
export const createUser = async (userId: string, userData: any) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, userData);
  return userRef;
};

export const getUser = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
};

export const updateUser = async (userId: string, userData: any) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, userData);
};

// Federation Operations
export const createFederation = async (federationData: any) => {
  const federationsRef = collection(db, 'federations');
  const docRef = await addDoc(federationsRef, federationData);
  return docRef;
};

export const getFederation = async (federationId: string) => {
  const fedRef = doc(db, 'federations', federationId);
  const fedSnap = await getDoc(fedRef);
  return fedSnap.exists() ? { id: fedSnap.id, ...fedSnap.data() } : null;
};

export const getAllFederations = async () => {
  const federationsRef = collection(db, 'federations');
  const snapshot = await getDocs(federationsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateFederation = async (federationId: string, federationData: any) => {
  const fedRef = doc(db, 'federations', federationId);
  await updateDoc(fedRef, federationData);
};

export const deleteFederation = async (federationId: string) => {
  const fedRef = doc(db, 'federations', federationId);
  await deleteDoc(fedRef);
};

// Player Operations (sub-collection)
export const addPlayer = async (federationId: string, playerData: any) => {
  const playersRef = collection(db, `federations/${federationId}/players`);
  const docRef = await addDoc(playersRef, playerData);
  return docRef;
};

export const getPlayers = async (federationId: string) => {
  const playersRef = collection(db, `federations/${federationId}/players`);
  const snapshot = await getDocs(playersRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updatePlayer = async (federationId: string, playerId: string, playerData: any) => {
  const playerRef = doc(db, `federations/${federationId}/players`, playerId);
  await updateDoc(playerRef, playerData);
};

export const deletePlayer = async (federationId: string, playerId: string) => {
  const playerRef = doc(db, `federations/${federationId}/players`, playerId);
  await deleteDoc(playerRef);
};

// Tournament Operations
export const createTournament = async (tournamentData: any) => {
  const tournamentsRef = collection(db, 'tournaments');
  const docRef = await addDoc(tournamentsRef, tournamentData);
  return docRef;
};

export const getTournament = async (tournamentId: string) => {
  const tournamentRef = doc(db, 'tournaments', tournamentId);
  const tournamentSnap = await getDoc(tournamentRef);
  return tournamentSnap.exists() ? { id: tournamentSnap.id, ...tournamentSnap.data() } : null;
};

export const getActiveTournament = async () => {
  const tournamentsRef = collection(db, 'tournaments');
  const q = query(tournamentsRef, where('status', '==', 'active'), limit(1));
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const updateTournament = async (tournamentId: string, tournamentData: any) => {
  const tournamentRef = doc(db, 'tournaments', tournamentId);
  await updateDoc(tournamentRef, tournamentData);
};

// Match Operations
export const createMatch = async (matchData: any) => {
  const matchesRef = collection(db, 'matches');
  const docRef = await addDoc(matchesRef, matchData);
  return docRef;
};

export const getMatch = async (matchId: string) => {
  const matchRef = doc(db, 'matches', matchId);
  const matchSnap = await getDoc(matchRef);
  return matchSnap.exists() ? { id: matchSnap.id, ...matchSnap.data() } : null;
};

export const getMatchesByTournament = async (tournamentId: string) => {
  const matchesRef = collection(db, 'matches');
  const q = query(matchesRef, where('tournamentId', '==', tournamentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateMatch = async (matchId: string, matchData: any) => {
  const matchRef = doc(db, 'matches', matchId);
  await updateDoc(matchRef, matchData);
};

export const deleteMatch = async (matchId: string) => {
  const matchRef = doc(db, 'matches', matchId);
  await deleteDoc(matchRef);
};

// Get top goal scorers across all matches
export const getTopGoalScorers = async (limitCount: number = 10) => {
  // Get the tournament bracket from tournament/current document
  const tournamentDoc = await getDoc(doc(db, "tournament", "current"));
  
  if (!tournamentDoc.exists()) {
    return [];
  }

  const tournamentData = tournamentDoc.data();
  const bracket = tournamentData?.bracket;

  if (!bracket) {
    return [];
  }

  const goalScorers: { 
    [key: string]: { 
      playerId: string;
      playerName: string; 
      teamName: string;
      country: string;
      goals: number;
      teamLogo?: string;
    } 
  } = {};
  
  // Helper function to extract scorers from matches
  const extractScorers = (matches: any[]) => {
    matches.forEach(match => {
      if (match.goalScorers && Array.isArray(match.goalScorers)) {
        match.goalScorers.forEach((scorer: any) => {
          const key = `${scorer.playerName}-${scorer.team}`;
          if (goalScorers[key]) {
            goalScorers[key].goals += 1;
          } else {
            goalScorers[key] = {
              playerId: scorer.playerId || key,
              playerName: scorer.playerName || 'Unknown Player',
              teamName: scorer.team || 'Unknown Team',
              country: scorer.team || 'Unknown',
              goals: 1,
              teamLogo: scorer.teamLogo,
            };
          }
        });
      }
    });
  };

  // Extract from all bracket rounds
  if (bracket.quarterFinals) extractScorers(bracket.quarterFinals);
  if (bracket.semiFinals) extractScorers(bracket.semiFinals);
  if (bracket.final) extractScorers([bracket.final]);
  
  return Object.values(goalScorers)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, limitCount);
};

// Player Operations
export const getPlayerById = async (playerId: string) => {
  const playerRef = doc(db, 'players', playerId);
  const playerSnap = await getDoc(playerRef);
  return playerSnap.exists() ? { id: playerSnap.id, ...playerSnap.data() } : null;
};

export const getPlayersByCountry = async (country: string) => {
  const playersRef = collection(db, 'players');
  const q = query(playersRef, where('nationality', '==', country), orderBy('naturalRating', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAvailablePlayersByCountry = async (country: string) => {
  const playersRef = collection(db, 'players');
  const q = query(
    playersRef,
    where('nationality', '==', country),
    where('available', '==', true),
    orderBy('naturalRating', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const assignPlayersToFederation = async (playerIds: string[], federationId: string) => {
  const batch = writeBatch(db);
  
  for (const playerId of playerIds) {
    const playerRef = doc(db, 'players', playerId);
    batch.update(playerRef, {
      available: false,
      federationId: federationId,
      assignedAt: new Date().toISOString(),
    });
  }
  
  await batch.commit();
};

export const releasePlayersFromFederation = async (federationId: string) => {
  const playersRef = collection(db, 'players');
  const q = query(playersRef, where('federationId', '==', federationId));
  const snapshot = await getDocs(q);
  
  const batch = writeBatch(db);
  
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      available: true,
      federationId: null,
      assignedAt: null,
    });
  });
  
  await batch.commit();
};

export const getPlayersByFederation = async (federationId: string) => {
  const playersRef = collection(db, 'players');
  const q = query(playersRef, where('federationId', '==', federationId), orderBy('naturalRating', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Country Operations
export const getCountryMetadata = async (countryName: string) => {
  const countryRef = doc(db, 'countries', countryName);
  const countrySnap = await getDoc(countryRef);
  return countrySnap.exists() ? { id: countrySnap.id, ...countrySnap.data() } : null;
};

export const getAllCountries = async () => {
  const countriesRef = collection(db, 'countries');
  const snapshot = await getDocs(countriesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateCountryMetadata = async (countryName: string, data: any) => {
  const countryRef = doc(db, 'countries', countryName);
  await updateDoc(countryRef, data);
};
