'use server';
/**
 * @fileOverview A simple flow to generate a congratulatory message.
 *
 * - getCongratsMessage - A function that returns a random congratulatory message.
 */

import {ai} from '@/ai/genkit';
import {CongratsMessageOutputSchema, type CongratsMessageOutput, CongratsMessageInputSchema, type CongratsMessageInput} from '@/lib/types';

const prompt = ai.definePrompt({
  name: 'congratsMessagePrompt',
  input: {schema: CongratsMessageInputSchema},
  output: {schema: CongratsMessageOutputSchema},
  prompt: `Generate a short, fun, and encouraging message for a user named {{{name}}} who just completed a task.`,
});

const congratsMessageFlow = ai.defineFlow(
  {
    name: 'congratsMessageFlow',
    inputSchema: CongratsMessageInputSchema,
    outputSchema: CongratsMessageOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function getCongratsMessage(input: CongratsMessageInput): Promise<CongratsMessageOutput> {
    return congratsMessageFlow(input);
}
