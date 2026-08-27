import { z } from 'zod';

export const smsSendSchema = z.object({
  recipients: z.array(z.string().min(5, 'Valid recipient phone number required')).min(1, 'At least one recipient is required'),
  message: z.string().min(1, 'Message text is required').max(1600, 'Message cannot exceed 1600 characters'),
  scheduledDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  senderId: z.string().optional(),
});

export const emailSendSchema = z.object({
  recipients: z.array(z.string().email('Valid recipient email required')).min(1, 'At least one recipient is required'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject cannot exceed 200 characters'),
  message: z.string().min(1, 'Email content is required'),
  scheduledDate: z.string().optional(),
  templateId: z.string().optional(),
});

export const announcementCreateSchema = z.object({
  title: z.string().min(2, 'Announcement title must be at least 2 characters'),
  content: z.string().min(1, 'Announcement content is required'),
  type: z.enum(['general', 'urgent', 'event', 'reminder']).default('general'),
  targetAudience: z.enum(['all', 'members', 'leaders', 'youth', 'adults']).default('all'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  publishedAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

export const announcementUpdateSchema = announcementCreateSchema.partial();

export const campaignCreateSchema = z.object({
  name: z.string().min(2, 'Campaign name is required'),
  type: z.enum(['SMS', 'Email', 'Multi-Channel']).default('SMS'),
  targetAudience: z.string().min(1, 'Target audience is required'),
  scheduledDate: z.string().min(1, 'Scheduled dispatch date is required'),
  message: z.string().min(1, 'Message content is required'),
  status: z.enum(['Draft', 'Scheduled', 'Sent', 'Cancelled']).default('Draft'),
});

export const campaignUpdateSchema = campaignCreateSchema.partial();

export const newsletterCreateSchema = z.object({
  title: z.string().min(2, 'Newsletter title is required'),
  subject: z.string().min(2, 'Email subject line is required'),
  content: z.string().min(10, 'Newsletter body content is required'),
  template: z.string().optional(),
  scheduledDate: z.string().optional(),
  status: z.enum(['Draft', 'Scheduled', 'Sent']).default('Draft'),
});

export const newsletterUpdateSchema = newsletterCreateSchema.partial();

export type SMSSendInput = z.infer<typeof smsSendSchema>;
export type EmailSendInput = z.infer<typeof emailSendSchema>;
export type AnnouncementCreateInput = z.infer<typeof announcementCreateSchema>;
export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
export type NewsletterCreateInput = z.infer<typeof newsletterCreateSchema>;
