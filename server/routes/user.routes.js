import { Router } from 'express';
import { getUsers, getUserById } from '../controllers/user.controller.js';
import { authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authorize, getUsers);
router.get('/:id', authorize, getUserById);

export default router;
