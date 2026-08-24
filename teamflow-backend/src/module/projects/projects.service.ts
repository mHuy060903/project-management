import prisma from '@/db/prisma.ts';
import { AppError } from '@/middleware/error.middleware.ts';
import { CreateProjectInput, UpdateProjectInput } from './projects.validation.ts';
import { getCached, invalidateCache, setCached } from '@/cache/cache.service.ts';
import { Project } from '@/generated/prisma/client.ts';

function cacheKey(tenantId: string) {
  return `tenant:${tenantId}:projects`
}

export async function listProjects(tenantId: string) {
  const cached = await getCached<Project[]>(cacheKey(tenantId))
  if(cached) return cached

  const projects = prisma.project.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });

  await setCached(cacheKey(tenantId), projects)
  return projects
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
  const project = prisma.project.create({
    data: { name: input.name, tenantId },
  });

  await invalidateCache(cacheKey(tenantId))
  return project
}

export async function updateProject(tenantId: string, projectId: string, input: UpdateProjectInput) {
  await getProjectById(tenantId, projectId); 

  const project = await prisma.project.update({
    where: { id: projectId },
    data: input,
  });
 
  await invalidateCache(cacheKey(tenantId));
  return project
}

export async function deleteProject(tenantId: string, projectId: string) {
  await getProjectById(tenantId, projectId);
  await prisma.project.delete({ where: { id: projectId } });
  await invalidateCache(cacheKey(tenantId));
}