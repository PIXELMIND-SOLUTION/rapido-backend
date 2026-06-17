import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/all', authenticate, authorize('admin'), userController.getAllUsers);
router.put('/deactivate/:id', authenticate, authorize('admin'), userController.deactivateUser);

export default router;