import prisma from '@/db/prisma.ts';
import { AppError } from '@/middleware/error.middleware.ts';
import { CreateProjectInput, UpdateProjectInput } from './projects.validation.ts';

export async function listProjects(tenantId: string) {
  return prisma.project.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProjectById(tenantId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, tenantId }, 
  });

  if (!project) {
    throw new AppError('Không tìm thấy project', 404);
  }

  return project;
}

export async function createProject(tenantId: string, input: CreateProjectInput) {
  return prisma.project.create({
    data: { name: input.name, tenantId },
  });
}

export async function updateProject(tenantId: string, projectId: string, input: UpdateProjectInput) {
  await getProjectById(tenantId, projectId); 

  return prisma.project.update({
    where: { id: projectId },
    data: input,
  });
}

export async function deleteProject(tenantId: string, projectId: string) {
  await getProjectById(tenantId, projectId);

  await prisma.project.delete({ where: { id: projectId } });
}