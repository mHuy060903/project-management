import { Router } from 'express';
import { Role } from '@/generated/prisma/client.ts';
import { authMiddleware } from '@/middleware/auth.middleware.ts';
import { requireRole } from '@/middleware/role.middleware.ts';
import { validate } from '@/middleware/validate.middleware.ts';
import { createProjectSchema, updateProjectSchema } from './projects.validation.ts';
import * as controller from './projects.controller.ts';

const router = Router();

router.use(authMiddleware); // mọi route dưới đây đều cần đăng nhập

router.get('/', controller.listHandler);
router.get('/:id', controller.getOneHandler);
router.post('/', validate(createProjectSchema), controller.createHandler);
router.patch('/:id', requireRole(Role.OWNER, Role.ADMIN), validate(updateProjectSchema), controller.updateHandler);
router.delete('/:id', requireRole(Role.OWNER), controller.deleteHandler);

export default router;