'use server';

import { getPersonalizedEcoRecommendations } from '@/ai/flows/personalized-eco-recommendations';
import type { PersonalizedEcoRecommendationsInput } from '@/ai/flows/personalized-eco-recommendations';

export async function fetchEcoRecommendations(input: PersonalizedEcoRecommendationsInput): Promise<string[]> {
  try {
    const result = await getPersonalizedEcoRecommendations(input);
    return result.recommendations;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    // Return a generic error message or fallback recommendations
    return ["We had trouble generating suggestions. Try to use public transport more often to reduce your emissions."];
  }
}
