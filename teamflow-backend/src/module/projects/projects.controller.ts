import { Request, Response, NextFunction } from 'express';
import * as projectsService from './projects.service.ts';
import { CreateProjectInput, UpdateProjectInput } from './projects.validation.ts';

export async function listHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await projectsService.listProjects(req.user!.tenantId);
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

export async function getOneHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectsService.getProjectById(req.user!.tenantId, req.params.id as string);
    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function createHandler(
  req: Request<{}, {}, CreateProjectInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const project = await projectsService.createProject(req.user!.tenantId, req.body);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

export async function updateHandler(
  req: Request<{ id: string }, {}, UpdateProjectInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const project = await projectsService.updateProject(req.user!.tenantId, req.params.id, req.body);
    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function deleteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await projectsService.deleteProject(req.user!.tenantId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}