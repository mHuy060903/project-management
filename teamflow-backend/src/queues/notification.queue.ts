import { Queue } from "bullmq";
import redis from "@/db/redis.ts";

export interface NotificationJobData {
    type: 'TASK_ASSIGNED' | 'TASK_MOVED';
    recipientEmail: string;
    payload: Record<string, unknown>;
}

export const notificationQueue = new Queue<NotificationJobData>('notifications', {
      connection: redis,
  defaultJobOptions: {
    attempts: 3, 
    backoff: { type: 'exponential', delay: 2000 }, 
    removeOnComplete: { count: 1000 }, 
    removeOnFail: { count: 5000 },
  },
})