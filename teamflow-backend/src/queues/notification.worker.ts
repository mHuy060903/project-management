import { Worker, Job } from 'bullmq';
import redis from '@/db/redis.ts';
import { NotificationJobData } from './notification.queue.ts';

async function sendEmail(to: string, subject: string, body: string) {
  console.log(`[EMAIL] Gửi tới ${to} — ${subject}: ${body}`);
}

const worker = new Worker<NotificationJobData>(
  'notifications',
  async (job: Job<NotificationJobData>) => {
    const { type, recipientEmail, payload } = job.data;

    switch (type) {
      case 'TASK_ASSIGNED':
        await sendEmail(
          recipientEmail,
          'Bạn được assign 1 task mới',
          `Task "${payload.taskTitle}" đã được giao cho bạn.`,
        );
        break;

      case 'TASK_MOVED':
        await sendEmail(
          recipientEmail,
          'Task đã được cập nhật',
          `Task "${payload.taskTitle}" đã chuyển sang trạng thái ${payload.status}.`,
        );
        break;
    }
  },
  {
    connection: redis,
    concurrency: 5,
  },
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} hoàn thành`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} thất bại sau ${job?.attemptsMade} lần thử:`, err.message);
});

export default worker;