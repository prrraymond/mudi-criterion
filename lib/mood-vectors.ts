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
export function getSpecificMoodFromVector(vector: number[]): SpecificMood {
  const [hep, heu, lep, leu] = vector;
  
  // First determine the primary quadrant
  const maxIndex = vector.indexOf(Math.max(hep, heu, lep, leu));
  const maxValue = vector[maxIndex];
  
  // Get secondary values for more nuanced classification
  const sortedValues = [...vector].sort((a, b) => b - a);
  const secondaryValue = sortedValues[1];
  const ratio = secondaryValue / maxValue; // How strong is the secondary influence?
  
  // Classify into specific moods based on dominant quadrant and secondary influences
  switch (maxIndex) {
    case 0: // High Energy + Pleasant dominant
      if (heu > 0.2) return 'energetic'; // Some intensity/activation
      if (lep > 0.2) return 'happy';     // Some calmness mixed in
      return 'excited';                   // Pure high-energy pleasant
      
    case 1: // High Energy + Unpleasant dominant  
      if (hep > 0.15) return 'stressed'; // Some positive energy mixed in
      if (leu > 0.2) return 'anxious';   // Some low energy (worry/fear)
      return 'angry';                     // Pure high-energy unpleasant
      
    case 2: // Low Energy + Pleasant dominant
      if (hep > 0.2) return 'content';   // Some joy/satisfaction
      if (leu > 0.15) return 'relaxed';  // Coming from tiredness/relief
      return 'calm';                      // Pure low-energy pleasant
      
    case 3: // Low Energy + Unpleasant dominant
      if (heu > 0.2) return 'tired';     // Exhaustion/burnout
      if (lep > 0.15) return 'sad';      // Some peace/acceptance in sadness
      return 'bored';                     // Pure low-energy unpleasant
      
    default:
      return 'content'; // Fallback to a neutral positive mood
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