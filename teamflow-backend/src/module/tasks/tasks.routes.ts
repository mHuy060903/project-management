import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.ts';
import { validate } from '@/middleware/validate.middleware.ts';
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from './tasks.validation.ts';
import * as controller from './tasks.controller.ts';

const router = Router();

router.use(authMiddleware);

router.get('/project/:projectId', controller.listByProjectHandler);

router.post('/', validate(createTaskSchema), controller.createHandler);
router.patch('/:id', validate(updateTaskSchema), controller.updateHandler);

router.patch('/:id/move', validate(moveTaskSchema), controller.moveHandler);

router.delete('/:id', controller.deleteHandler);

export default router;