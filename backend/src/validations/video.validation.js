import { z } from "zod";

export const publishVideoSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10)
});

export const updateVideoSchema = z.object({});
export const getVideoSchema = z.object({});
export const deleteVideoSchema = z.object({});
export const togglePublishStatusSchema = z.object({});
export const getAllVideosSchema = z.object({});