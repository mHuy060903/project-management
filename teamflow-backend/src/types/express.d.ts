import { Role } from '@/generated/prisma/client.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        tenantId: string;
        role: Role;
      };
    }
  }
}

export {};