import { Router } from 'express';
import TestSkipController from './testSkip.controller';

const router = Router();

router.get('/', TestSkipController.getAll);
router.post('/', TestSkipController.create);

export default router;
