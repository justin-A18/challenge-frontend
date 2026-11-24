import type { z } from 'zod';
import type { profileSchema } from '../schemas/profile.schema';

export type ProfileValues = z.infer<typeof profileSchema>;
