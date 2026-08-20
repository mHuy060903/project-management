import { Request, Response, NextFunction } from 'express';
import * as tasksService from './tasks.service.ts';
import { CreateTaskInput, UpdateTaskInput, MoveTaskInput } from './tasks.validation.ts';

export async function listByProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tasks = await tasksService.listTasksByProject(req.user!.tenantId, req.params.projectId as string);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function createHandler(
  req: Request<{}, {}, CreateTaskInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await tasksService.createTask(req.user!.tenantId, req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateHandler(
  req: Request<{ id: string }, {}, UpdateTaskInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await tasksService.updateTask(req.user!.tenantId, req.params.id, req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function moveHandler(
  req: Request<{ id: string }, {}, MoveTaskInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await tasksService.moveTask(req.user!.tenantId, req.params.id, req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await tasksService.deleteTask(req.user!.tenantId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}