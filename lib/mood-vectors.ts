// /lib/mood-vectors.ts

// --- Type Definitions ---
export type MoodQuadrant = 'high-energy-pleasant' | 'high-energy-unpleasant' | 'low-energy-pleasant' | 'low-energy-unpleasant';

export type MoodVector = [number, number, number, number];

// --- Mood-to-Genre Mapping ---
// This mapping is subjective and can be fine-tuned.
// We associate TMDb genre IDs with energy and pleasantness scores.
// Score range: -1 (low/unpleasant) to 1 (high/pleasant)
const genreMoodMapping: Record<number, { energy: number; pleasantness: number }> = {
  // High Energy, Pleasant
  28: { energy: 0.9, pleasantness: 0.5 }, // Action
  12: { energy: 0.8, pleasantness: 0.7 }, // Adventure
  35: { energy: 0.6, pleasantness: 0.9 }, // Comedy
  10751: { energy: 0.4, pleasantness: 1.0 }, // Family
  10402: { energy: 0.7, pleasantness: 0.8 }, // Music
  10749: { energy: 0.3, pleasantness: 0.9 }, // Romance
  878: { energy: 0.7, pleasantness: 0.4 }, // Science Fiction

  // High Energy, Unpleasant
  80: { energy: 0.7, pleasantness: -0.6 }, // Crime
  27: { energy: 0.8, pleasantness: -1.0 }, // Horror
  53: { energy: 0.8, pleasantness: -0.5 }, // Thriller
  10752: { energy: 0.9, pleasantness: -0.8 }, // War

  // Low Energy, Pleasant
  16: { energy: 0.2, pleasantness: 0.6 }, // Animation (can vary, but often pleasant)
  99: { energy: -0.5, pleasantness: 0.3 }, // Documentary
  14: { energy: -0.2, pleasantness: 0.5 }, // Fantasy
  36: { energy: -0.7, pleasantness: 0.1 }, // History
  9648: { energy: -0.3, pleasantness: -0.2 }, // Mystery

  // Low Energy, Unpleasant
  18: { energy: -0.6, pleasantness: -0.4 }, // Drama
  37: { energy: -0.4, pleasantness: 0.0 }, // Western (can be neutral)
};

// --- Vector Generation ---

/**
 * **UPDATED LOGIC**
 * Generates a nuanced mood vector for a movie based on its genres.
 * The vector represents the movie's score in each of the four quadrants,
 * creating a unique "fingerprint" for each movie.
 * @param genreIds An array of genre IDs for the movie.
 * @returns A normalized MoodVector: [high-energy-pleasant, high-energy-unpleasant, low-energy-pleasant, low-energy-unpleasant]
 */
export function generateMovieMoodVector(genreIds: number[]): MoodVector {
  let totalEnergy = 0;
  let totalPleasantness = 0;
  let genreCount = 0;

  for (const id of genreIds) {
    if (genreMoodMapping[id]) {
      totalEnergy += genreMoodMapping[id].energy;
      totalPleasantness += genreMoodMapping[id].pleasantness;
      genreCount++;
    }
  }

  // Avoid division by zero
  if (genreCount === 0) {
    return [0.25, 0.25, 0.25, 0.25]; // Return a neutral vector
  }

  // Calculate average scores
  const avgEnergy = totalEnergy / genreCount;
  const avgPleasantness = totalPleasantness / genreCount;

  // Map the average scores to the four quadrants
  // We use Math.max(0, score) to ensure a quadrant score is non-negative.
  // This creates a fractional, nuanced vector instead of a simple "pure" one.
  const vector: MoodVector = [
    Math.max(0, avgEnergy) * Math.max(0, avgPleasantness),       // High Energy, Pleasant
    Math.max(0, avgEnergy) * Math.max(0, -avgPleasantness),      // High Energy, Unpleasant
    Math.max(0, -avgEnergy) * Math.max(0, avgPleasantness),      // Low Energy, Pleasant
    Math.max(0, -avgEnergy) * Math.max(0, -avgPleasantness),     // Low Energy, Unpleasant
  ];
  
  // Normalize the vector (ensures all vectors have a length of 1, which is crucial for accurate cosine similarity)
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
      // If all scores are 0, return a neutral vector to avoid division by zero
      return [0.25, 0.25, 0.25, 0.25];
  }

  return vector.map(v => v / magnitude) as MoodVector;
}

/**
 * Determines the primary mood quadrant for a movie based on its vector.
 * @param vector The movie's mood vector.
 * @returns The MoodQuadrant with the highest score.
 */
export function getPrimaryMoodQuadrant(vector: MoodVector): MoodQuadrant {
    const quadrants: MoodQuadrant[] = ['high-energy-pleasant', 'high-energy-unpleasant', 'low-energy-pleasant', 'low-energy-unpleasant'];
    const maxIndex = vector.indexOf(Math.max(...vector));
    return quadrants[maxIndex] || 'low-energy-pleasant'; // Default fallback
}


/**
 * Generates a pure query vector for a given mood quadrant.
 * This creates a "perfect" vector for similarity search.
 * @param quadrant The target mood quadrant.
 * @returns A normalized MoodVector.
 */
export function createQueryVectorForMood(quadrant: MoodQuadrant): MoodVector {
    const vectors: Record<MoodQuadrant, MoodVector> = {
        'high-energy-pleasant': [1, 0, 0, 0],
        'high-energy-unpleasant': [0, 1, 0, 0],
        'low-energy-pleasant': [0, 0, 1, 0],
        'low-energy-unpleasant': [0, 0, 0, 1],
    };
    return vectors[quadrant];
}

