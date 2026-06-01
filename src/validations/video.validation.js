import { z } from "zod";

export const publishVideoSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10)
});