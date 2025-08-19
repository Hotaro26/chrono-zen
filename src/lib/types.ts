import {z} from 'zod';

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

export const CongratsMessageInputSchema = z.object({
  name: z.string().describe('The name of the user to congratulate.'),
});
export type CongratsMessageInput = z.infer<typeof CongratsMessageInputSchema>;

export const CongratsMessageOutputSchema = z.object({
  message: z.string().describe('A short, fun, and encouraging message for completing a task. Make it sound exciting and celebratory, and personalize it with the user\'s name. For example: "You crushed it, [Name]!" or "Another one bites the dust, [Name]!"'),
});
export type CongratsMessageOutput = z.infer<typeof CongratsMessageOutputSchema>;
