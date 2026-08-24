import prisma from '@/db/prisma.ts';
import { AppError } from '@/middleware/error.middleware.ts';
import { CreateTaskInput, UpdateTaskInput, MoveTaskInput } from './tasks.validation.ts';
import * as projectsService from '../projects/projects.service.ts';
import { getIO } from '@/realtime/socket.ts';
import { notificationQueue } from '@/queues/notification.queue.ts';
export async function listTasksByProject(tenantId: string, projectId: string) {
  await projectsService.getProjectById(tenantId, projectId);

  return prisma.task.findMany({
    where: { tenantId, projectId },
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
  });
}

export async function createTask(tenantId: string, input: CreateTaskInput) {
  await projectsService.getProjectById(tenantId, input.projectId); 

  const maxPosition = await prisma.task.aggregate({
    where: { projectId: input.projectId, status: 'TODO' },
    _max: { position: true },
  });

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      projectId: input.projectId,
      tenantId,
      position: (maxPosition._max.position ?? -1) + 1,
    },
  });

    if (task.assigneeId) {
    const assignee = await prisma.user.findUnique({ where: { id: task.assigneeId } });
    if (assignee) {
      await notificationQueue.add('task-assigned', {
        type: 'TASK_ASSIGNED',
        recipientEmail: assignee.email,
        payload: { taskTitle: task.title },
      });
    }
  }

  return task;
}

async function getTaskById(tenantId: string, taskId: string) {
  const task = await prisma.task.findFirst({ where: { id: taskId, tenantId } });
  if (!task) throw new AppError('Không tìm thấy task', 404);
  return task;
}

export async function updateTask(tenantId: string, taskId: string, input: UpdateTaskInput) {
  await getTaskById(tenantId, taskId);
  return prisma.task.update({ where: { id: taskId }, data: input });
}

export async function deleteTask(tenantId: string, taskId: string) {
  await getTaskById(tenantId, taskId);
  await prisma.task.delete({ where: { id: taskId } });
}

export async function moveTask(tenantId: string, taskId: string, input: MoveTaskInput) {
  await getTaskById(tenantId, taskId);

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: input.status, position: input.position },
  });

  getIO().to(`project:${updated.projectId}`).emit('task:moved', updated);

  return updated;
}