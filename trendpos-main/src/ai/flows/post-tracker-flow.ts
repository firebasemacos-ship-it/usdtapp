'use server';
/**
 * @fileOverview An AI agent that extracts statistics from a social media post URL.
 *
 * - trackPost - A function that handles the post tracking process.
 * - TrackPostInput - The input type for the trackPost function.
 * - TrackPostOutput - The return type for the trackPost function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TrackPostInputSchema = z.object({
  postUrl: z.string().url().describe('The URL of the social media post to track.'),
});
export type TrackPostInput = z.infer<typeof TrackPostInputSchema>;

const TrackPostOutputSchema = z.object({
  title: z.string().describe('The title or a short summary of the post content.'),
  platform: z.string().describe('The social media platform (e.g., Facebook, Instagram, Twitter).'),
  reach: z.number().describe('The number of people who saw the post.'),
  likes: z.number().describe('The number of likes on the post.'),
  comments: z.number().describe('The number of comments on the post.'),
});
export type TrackPostOutput = z.infer<typeof TrackPostOutputSchema>;

export async function trackPost(input: TrackPostInput): Promise<TrackPostOutput> {
  return trackPostFlow(input);
}

const trackPostFlow = ai.defineFlow(
  {
    name: 'trackPostFlow',
    inputSchema: TrackPostInputSchema,
    outputSchema: TrackPostOutputSchema,
  },
  async ({ postUrl }) => {
    // In a real application, you would use a web scraper or an official API
    // to get the actual data. For this demo, we'll generate plausible mock data.
    
    let platform = 'Social Media';
    if (postUrl.includes('facebook')) platform = 'Facebook';
    if (postUrl.includes('instagram')) platform = 'Instagram';
    if (postUrl.includes('twitter')) platform = 'Twitter';
    if (postUrl.includes('linkedin')) platform = 'LinkedIn';

    const { output } = await ai.generate({
        prompt: `Based on this URL, generate some plausible but fake statistics for a social media post.
        URL: ${postUrl}
        Platform: ${platform}
        
        Generate a fake but realistic title for the post, and fake numbers for reach, likes, and comments.
        The title should be in Arabic.`,
        output: {
            schema: TrackPostOutputSchema,
        },
    });

    return output!;
  }
);
