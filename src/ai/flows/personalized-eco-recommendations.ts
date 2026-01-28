'use server';

/**
 * @fileOverview A personalized eco-friendly recommendation AI agent.
 *
 * - getPersonalizedEcoRecommendations - A function that generates personalized eco-friendly recommendations.
 * - PersonalizedEcoRecommendationsInput - The input type for the getPersonalizedEcoRecommendations function.
 * - PersonalizedEcoRecommendationsOutput - The return type for the getPersonalizedEcoRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedEcoRecommendationsInputSchema = z.object({
  transportMode: z
    .string()
    .describe('The user\'s current mode of transportation (e.g., Car, Bike, Bus, Walking, Bicycle, EV).'),
  distanceTraveled: z
    .number()
    .describe('The distance traveled by the user in kilometers.'),
  numberOfTrips: z
    .number()
    .describe('The number of trips taken by the user today.'),
  dailyEmissions: z
    .number()
    .describe('The calculated daily carbon emissions of the user in kg CO2.'),
  totalPoints: z
    .number()
    .describe('The total points earned by the user till date.'),
  dailyPoints: z
    .number()
    .describe('The points earned by the user today.'),
});
export type PersonalizedEcoRecommendationsInput = z.infer<typeof PersonalizedEcoRecommendationsInputSchema>;

const PersonalizedEcoRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('An array of personalized eco-friendly recommendations for the user.'),
});
export type PersonalizedEcoRecommendationsOutput = z.infer<typeof PersonalizedEcoRecommendationsOutputSchema>;

export async function getPersonalizedEcoRecommendations(
  input: PersonalizedEcoRecommendationsInput
): Promise<PersonalizedEcoRecommendationsOutput> {
  return personalizedEcoRecommendationsFlow(input);
}

const personalizedEcoRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedEcoRecommendationsPrompt',
  input: {schema: PersonalizedEcoRecommendationsInputSchema},
  output: {schema: PersonalizedEcoRecommendationsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized eco-friendly recommendations to users based on their transportation habits. Your goal is to suggest actions that can help them reduce their carbon footprint and earn more points in an environmental awareness program.

  Consider the following information about the user:

  - Current mode of transportation: {{transportMode}}
  - Distance traveled today: {{distanceTraveled}} km
  - Number of trips today: {{numberOfTrips}}
  - Daily carbon emissions: {{dailyEmissions}} kg CO2
  - Total points earned: {{totalPoints}}
  - Daily points earned: {{dailyPoints}}

  Based on this information, provide 2-3 specific and actionable recommendations that the user can implement to reduce their environmental impact and increase their points. Focus on suggesting alternative transportation methods, reducing trip frequency, or other relevant strategies.

  Format your output as a JSON array of strings, where each string is a recommendation. For example:

  [\"Consider using a bicycle for short trips to reduce emissions.\", \"Try carpooling with colleagues or friends to decrease the number of individual car trips.\", \"If possible, switch to an electric vehicle to significantly lower your carbon footprint.\"]
  `,
});

const personalizedEcoRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedEcoRecommendationsFlow',
    inputSchema: PersonalizedEcoRecommendationsInputSchema,
    outputSchema: PersonalizedEcoRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await personalizedEcoRecommendationsPrompt(input);
    return output!;
  }
);
