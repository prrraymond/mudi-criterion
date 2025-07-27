// /lib/mood-vectors.ts

// --- Type Definitions ---
export type MoodQuadrant = 'high-energy-pleasant' | 'high-energy-unpleasant' | 'low-energy-pleasant' | 'low-energy-unpleasant';
export type MoodVector = [number, number, number, number];

/**
 * Generates a nuanced mood vector for a movie based on the average of its genre scores.
 */
export function generateMovieMoodVector(genreIds: number[]): number[] {
  // Initialize vector for [HE+P, HE+U, LE+P, LE+U]
  let vector = [0, 0, 0, 0];
  
  // Map genres to mood contributions
  const genreMoodMap: Record<number, number[]> = {
    // Your existing mapping is perfect
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
 * Creates a query vector for mood-based movie search
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