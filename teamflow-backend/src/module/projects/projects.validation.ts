import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Tên project phải có ít nhất 2 ký tự'),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;