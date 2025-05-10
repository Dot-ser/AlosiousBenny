// use server'
'use server';
/**
 * @fileOverview An AI agent that generates relevant hashtags for a given image.
 *
 * - generateImageHashtags - A function that generates hashtags for an image.
 * - GenerateImageHashtagsInput - The input type for the generateImageHashtags function.
 * - GenerateImageHashtagsOutput - The return type for the generateImageHashtags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageHashtagsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  additionalDescription: z
    .string()
    .optional()
    .describe('Any additional context about the image.'),
});
export type GenerateImageHashtagsInput = z.infer<
  typeof GenerateImageHashtagsInputSchema
>;

const GenerateImageHashtagsOutputSchema = z.object({
  hashtags: z
    .array(z.string())
    .describe('An array of relevant hashtags for the image.'),
});
export type GenerateImageHashtagsOutput = z.infer<
  typeof GenerateImageHashtagsOutputSchema
>;

export async function generateImageHashtags(
  input: GenerateImageHashtagsInput
): Promise<GenerateImageHashtagsOutput> {
  return generateImageHashtagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImageHashtagsPrompt',
  input: {schema: GenerateImageHashtagsInputSchema},
  output: {schema: GenerateImageHashtagsOutputSchema},
  prompt: `You are an expert social media manager. You will generate a list of relevant hashtags for an image.

Generate a list of hashtags for the following image:

{{media url=photoDataUri}}

{{#if additionalDescription}}
  Additional description: {{{additionalDescription}}}
{{/if}}

Do not include the '#' symbol in the hashtags.  Return only the hashtags.
`,
});

const generateImageHashtagsFlow = ai.defineFlow(
  {
    name: 'generateImageHashtagsFlow',
    inputSchema: GenerateImageHashtagsInputSchema,
    outputSchema: GenerateImageHashtagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
