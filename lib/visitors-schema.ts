import { z } from 'zod';

export const LINK_HOST_ALLOWLIST = ['github.com', 'linkedin.com'] as const;

const allowlistedUrl = z
  .string()
  .url()
  .refine(
    (value) => {
      try {
        const host = new URL(value).hostname.toLowerCase();
        return LINK_HOST_ALLOWLIST.some(
          (allowed) => host === allowed || host.endsWith(`.${allowed}`),
        );
      } catch {
        return false;
      }
    },
    { message: `Link must point to one of: ${LINK_HOST_ALLOWLIST.join(', ')}` },
  );

export const visitorCardSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(40),
  role: z.string().trim().min(2).max(60),
  message: z.string().trim().min(10).max(200),
  link: allowlistedUrl.nullable(),
  submittedAt: z.string().datetime(),
});

export const visitorSubmissionSchema = z.object({
  name: visitorCardSchema.shape.name,
  role: visitorCardSchema.shape.role,
  message: visitorCardSchema.shape.message,
  link: allowlistedUrl.nullable().optional().default(null),
  turnstileToken: z.string().min(1),
});

export const visitorsFileSchema = z.object({
  version: z.literal(1),
  cards: z.array(visitorCardSchema),
});

export type VisitorCard = z.infer<typeof visitorCardSchema>;
export type VisitorSubmission = z.infer<typeof visitorSubmissionSchema>;
export type VisitorsFile = z.infer<typeof visitorsFileSchema>;
