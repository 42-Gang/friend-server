import { z } from 'zod';

import { createResponseSchema } from '../common/schema/core.schema.js';
import { Status } from '@prisma/client';

export const friendRequestSchema = z.object({
  user_id: z.number().int(),
  friend_id: z.number().int(),
  status: z.nativeEnum(Status).default(Status.PENDING),
});

export const friendResponseSchema = createResponseSchema(z.any());

export const friendListResponseSchema = createResponseSchema(
  z.array(
    z.object({
      id: z.number().int(),
      user_id: z.number().int(),
      friend_id: z.number().int(),
      status: z.nativeEnum(Status),
    })
  )
);

export const actionSchema = z.object({
  action: z.enum(['reject', 'accept']),
});
