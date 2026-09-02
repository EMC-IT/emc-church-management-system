import { z } from 'zod';

export const joinGroupSchema = z.object({
  groupId: z.string().min(1, 'Please select a group to join'),
  preferredRole: z.string().optional(),
  message: z.string().max(300, 'Message cannot exceed 300 characters').optional(),
});

export type JoinGroupFormData = z.infer<typeof joinGroupSchema>;
