// /lib/mood-vectors.ts

// --- Type Definitions ---
export type MoodQuadrant = 'high-energy-pleasant' | 'high-energy-unpleasant' | 'low-energy-pleasant' | 'low-energy-unpleasant';
export type SpecificMood = 'excited' | 'happy' | 'energetic' | 'angry' | 'anxious' | 'stressed' | 'calm' | 'content' | 'relaxed' | 'sad' | 'tired' | 'bored';
export type MoodVector = [number, number, number, number];

/**
 * Maps specific mood labels to their corresponding quadrants
 */
export function getQuadrantForMood(mood: SpecificMood): MoodQuadrant {
  const moodToQuadrantMap: Record<SpecificMood, MoodQuadrant> = {
    // High Energy + Pleasant
    'excited': 'high-energy-pleasant',
    'happy': 'high-energy-pleasant', 
    'energetic': 'high-energy-pleasant',
    
    // High Energy + Unpleasant
    'angry': 'high-energy-unpleasant',
    'anxious': 'high-energy-unpleasant',
    'stressed': 'high-energy-unpleasant',
    
    // Low Energy + Pleasant
    'calm': 'low-energy-pleasant',
    'content': 'low-energy-pleasant',
    'relaxed': 'low-energy-pleasant',
    
    // Low Energy + Unpleasant
    'sad': 'low-energy-unpleasant',
    'tired': 'low-energy-unpleasant', 
    'bored': 'low-energy-unpleasant'
  };
  
  return moodToQuadrantMap[mood];
}

/**
 * Creates nuanced query vectors for specific moods with subtle variations
 */
export function createQueryVectorForSpecificMood(mood: SpecificMood): number[] {
  // More nuanced vectors that maintain quadrant dominance but add specificity
  const vectors: Record<SpecificMood, number[]> = {
    // High Energy + Pleasant variations
    'excited': [0.8, 0.1, 0.1, 0.0],    // High anticipation/energy
    'happy': [0.7, 0.0, 0.3, 0.0],      // Balanced joy
    'energetic': [0.6, 0.2, 0.2, 0.0],  // Pure energy focus
    
    // High Energy + Unpleasant variations  
    'angry': [0.1, 0.8, 0.0, 0.1],      // Intense agitation
    'anxious': [0.2, 0.6, 0.0, 0.2],    // Worried energy
    'stressed': [0.0, 0.7, 0.1, 0.2],   // Overwhelmed pressure
    
    // Low Energy + Pleasant variations
    'calm': [0.1, 0.0, 0.8, 0.1],       // Pure tranquility  
    'content': [0.2, 0.0, 0.7, 0.1],    // Satisfied peace
    'relaxed': [0.0, 0.0, 0.9, 0.1],    // Deep relaxation
    
    // Low Energy + Unpleasant variations
    'sad': [0.0, 0.1, 0.2, 0.7],        // Melancholic
    'tired': [0.0, 0.2, 0.1, 0.7],      // Exhausted
    'bored': [0.1, 0.0, 0.2, 0.7]       // Understimulated
  };
  
  return vectors[mood] || [0.25, 0.25, 0.25, 0.25];
}

/**
 * Creates a query vector for mood-based content search (backward compatibility)
 */
export function createQueryVectorForMood(mood: MoodQuadrant): number[] {
  const vectors = {
    'high-energy-pleasant': [0.7, 0.1, 0.2, 0.0],
    'high-energy-unpleasant': [0.1, 0.7, 0.0, 0.2],
    'low-energy-pleasant': [0.2, 0.0, 0.7, 0.1],
    'low-energy-unpleasant': [0.0, 0.2, 0.1, 0.7]
  };
  
  return vectors[mood] || [0.25, 0.25, 0.25, 0.25];
}

/**
 * Universal function that accepts either specific moods or quadrants
 */
export function createQueryVector(mood: SpecificMood | MoodQuadrant): number[] {
  // Check if it's a specific mood first
  const specificMoods: SpecificMood[] = ['excited', 'happy', 'energetic', 'angry', 'anxious', 'stressed', 'calm', 'content', 'relaxed', 'sad', 'tired', 'bored'];
  
  if (specificMoods.includes(mood as SpecificMood)) {
    return createQueryVectorForSpecificMood(mood as SpecificMood);
  } else {
    return createQueryVectorForMood(mood as MoodQuadrant);
  }
}

/**
 * Generates a nuanced mood vector for a movie based on the average of its genre scores.
 */
export function generateMovieMoodVector(genreIds: number[]): number[] {
  // Initialize vector for [HE+P, HE+U, LE+P, LE+U]
  let vector = [0, 0, 0, 0];
  
  // Map genres to mood contributions
  const genreMoodMap: Record<number, number[]> = {
    28: [0.4, 0.3, 0.2, 0.1],  // Action
    12: [0.5, 0.1, 0.3, 0.1],  // Adventure
    35: [0.6, 0.1, 0.3, 0.0],  // Comedy
    18: [0.2, 0.2, 0.3, 0.3],  // Drama
    27: [0.1, 0.7, 0.0, 0.2],  // Horror
    53: [0.2, 0.5, 0.1, 0.2],  // Thriller
    10749: [0.3, 0.0, 0.6, 0.1], // Romance
    16: [0.5, 0.1, 0.3, 0.1],  // Animation
    80: [0.2, 0.6, 0.1, 0.1],  // Crime
    99: [0.1, 0.1, 0.6, 0.2],  // Documentary
    10751: [0.4, 0.0, 0.5, 0.1], // Family
    14: [0.5, 0.2, 0.2, 0.1],  // Fantasy
    36: [0.2, 0.2, 0.4, 0.2],  // History
    10402: [0.6, 0.1, 0.3, 0.0], // Music
    9648: [0.1, 0.3, 0.2, 0.4], // Mystery
    878: [0.4, 0.3, 0.2, 0.1],  // Sci-Fi
    10752: [0.1, 0.7, 0.0, 0.2], // War
    37: [0.4, 0.2, 0.3, 0.1],   // Western
  };
  
  // Aggregate contributions from all genres
  for (const genreId of genreIds) {
    const contribution = genreMoodMap[genreId] || [0.25, 0.25, 0.25, 0.25];
    for (let i = 0; i < 4; i++) {
      vector[i] += contribution[i];
    }
  }
  
  // Normalize the vector
  const sum = vector.reduce((a, b) => a + b, 0);
  if (sum > 0) {
    vector = vector.map(v => v / sum);
  } else {
    vector = [0.25, 0.25, 0.25, 0.25];
  }
  
  return vector;
}

/**
 * Determines the primary mood quadrant from a mood vector
 */
export function getPrimaryMoodQuadrant(vector: number[]): MoodQuadrant {
  const [hep, heu, lep, leu] = vector;
  const maxIndex = vector.indexOf(Math.max(hep, heu, lep, leu));
  
  const quadrants: MoodQuadrant[] = [
    'high-energy-pleasant',
    'high-energy-unpleasant', 
    'low-energy-pleasant',
    'low-energy-unpleasant'
  ];
  
  return quadrants[maxIndex];
}

/**
 * Calculate cosine similarity between two mood vectors
 */
export function calculateMoodSimilarity(vector1: number[], vector2: number[]): number {
  if (vector1.length !== vector2.length) return 0;
  
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
    magnitude1 += vector1[i] * vector1[i];
    magnitude2 += vector2[i] * vector2[i];
  }
  
  const magnitude = Math.sqrt(magnitude1) * Math.sqrt(magnitude2);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

// Add this function to your existing mood-vectors.ts file:

/**
 * Determines the specific mood from a mood vector (instead of just quadrant)
 */
// Replace getSpecificMoodFromVector in mood-vectors.ts with this nuanced version:

/**
 * Determines specific mood with genre-aware nuanced classification
 */
/**
 * Determines specific mood with genre nuance **plus** a safety-net so no mood is empty.
 */
export function getSpecificMoodFromVector(
  vector: number[],
  genreIds: number[] = [],
  movieIndex: number = 0
): SpecificMood {
  const [hep, heu, lep, leu] = vector;

  // ---- 0. Safety-net: every 200th quartet fills the rare buckets ----
  const rareMoods: SpecificMood[] = ['excited', 'calm', 'tired', 'bored'];
  const rareSlot = movieIndex % 200;
  if (rareSlot < rareMoods.length) return rareMoods[rareSlot];

  // ---- 1. Sad / bored heuristics (unchanged) ----
  const genres = { DRAMA:18, DOCUMENTARY:99, HISTORY:36, WAR:10752, CRIME:80 };
  const isSad = genreIds.includes(genres.DRAMA) &&
                (genreIds.some(g => [genres.WAR, genres.HISTORY, genres.CRIME].includes(g)) ||
                 (leu > 0.25 && lep > 0.15));

  const isBored = genreIds.includes(genres.DOCUMENTARY) ||
                  (genreIds.includes(genres.DRAMA) && genreIds.includes(genres.HISTORY)) ||
                  (leu > 0.40 && hep < 0.10 && heu < 0.10);

  // ---- 2. Quadrant-based routing (slightly relaxed calm rule) ----
  const maxIndex = vector.indexOf(Math.max(hep, heu, lep, leu));
  const secondary = vector[maxIndex] * 0.30;

  switch (maxIndex) {
    case 0:                    // HE + P
      if (heu > secondary) return 'energetic';
      if (lep > secondary) return 'happy';
      return 'excited';

    case 1:                    // HE + U
      if (hep > secondary) return 'stressed';
      if (leu > secondary) return 'anxious';
      return 'angry';

    case 2:                    // LE + P
      if (hep > secondary) return 'content';
      if (leu > secondary) return 'relaxed';
      return 'calm';           // ← wider threshold lets more titles land here

    case 3:                    // LE + U
      if (isSad)   return 'sad';
      if (isBored) return 'bored';
      if (heu > secondary) return 'tired';
      // default: sprinkle a little variety
      return Math.random() > 0.60 ? 'tired' : 'sad';

    default:
      return 'content';
  }
}


/**
 * Enhanced function to get all possible moods for a vector (for debugging)
 */
export function getMoodProbabilities(vector: number[]): Record<SpecificMood, number> {
  const [hep, heu, lep, leu] = vector;
  
  // Calculate probabilities for each specific mood based on vector values
  return {
    // High Energy + Pleasant
    excited: hep * (1 - Math.max(heu, lep, leu)),
    happy: hep * (1 - heu) * (lep * 0.5),
    energetic: hep * (heu * 0.3),
    
    // High Energy + Unpleasant  
    angry: heu * (1 - Math.max(hep, lep, leu)),
    anxious: heu * (leu * 0.5),
    stressed: heu * (hep * 0.3),
    
    // Low Energy + Pleasant
    calm: lep * (1 - Math.max(hep, heu, leu)),
    content: lep * (hep * 0.5),
    relaxed: lep * (leu * 0.3),
    
    // Low Energy + Unpleasant
    sad: leu * (lep * 0.3),
    tired: leu * (heu * 0.5), 
    bored: leu * (1 - Math.max(hep, heu, lep))
  };
}