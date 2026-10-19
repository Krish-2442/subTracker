import { Router } from 'express';
import { authorize } from '../middlewares/auth.middleware.js';
import {
    getSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    getSummary,
    getUpcoming,
} from '../controllers/subscription.controller.js';

const router = Router();

router.use(authorize);

router.get('/summary', getSummary);
router.get('/upcoming', getUpcoming);

router.get('/', getSubscriptions);
router.post('/', createSubscription);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);

export default router;
